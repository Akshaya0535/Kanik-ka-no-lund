import type { NextRequest } from "next/server"
import { authenticateAdmin, createApiResponse, createErrorResponse } from "@/lib/auth-utils"
import { mockAuditLog } from "@/lib/mock-database"

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const adminUser = await authenticateAdmin(request)
    if (!adminUser) {
      return createErrorResponse("Unauthorized: Admin access required", 401)
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")
    const action = searchParams.get("action")
    const userId = searchParams.get("userId")
    const resource = searchParams.get("resource")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Filter audit log based on query parameters
    let filteredLogs = [...mockAuditLog]

    if (fromDate) {
      const from = new Date(fromDate)
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) >= from)
    }

    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999) // End of day
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) <= to)
    }

    if (action) {
      filteredLogs = filteredLogs.filter((log) => log.action.toLowerCase().includes(action.toLowerCase()))
    }

    if (userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === userId)
    }

    if (resource) {
      filteredLogs = filteredLogs.filter((log) => log.resource.toLowerCase().includes(resource.toLowerCase()))
    }

    // Sort by timestamp (most recent first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Implement pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    // Calculate statistics
    const stats = {
      total: filteredLogs.length,
      byAction: filteredLogs.reduce(
        (acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      byResource: filteredLogs.reduce(
        (acc, log) => {
          acc[log.resource] = (acc[log.resource] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    return createApiResponse({
      logs: paginatedLogs,
      stats,
      pagination: {
        page,
        limit,
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / limit),
        hasNext: endIndex < filteredLogs.length,
        hasPrev: page > 1,
      },
      filters: {
        from: fromDate,
        to: toDate,
        action,
        userId,
        resource,
      },
    })
  } catch (error) {
    console.error("Audit log API error:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
