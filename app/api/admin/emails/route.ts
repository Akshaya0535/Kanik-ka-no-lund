import type { NextRequest } from "next/server"
import { authenticateAdmin, createApiResponse, createErrorResponse } from "@/lib/auth-utils"
import { mockEmailNotifications } from "@/lib/mock-database"

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const adminUser = await authenticateAdmin(request)
    if (!adminUser) {
      return createErrorResponse("Unauthorized: Admin access required", 401)
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const recipient = searchParams.get("recipient")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Filter email notifications based on query parameters
    let filteredEmails = [...mockEmailNotifications]

    if (recipient) {
      filteredEmails = filteredEmails.filter((email) => email.recipient.toLowerCase().includes(recipient.toLowerCase()))
    }

    if (status) {
      filteredEmails = filteredEmails.filter((email) => email.status === status)
    }

    if (type) {
      filteredEmails = filteredEmails.filter((email) => email.type === type)
    }

    if (fromDate) {
      const from = new Date(fromDate)
      filteredEmails = filteredEmails.filter((email) => new Date(email.timestamp) >= from)
    }

    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999)
      filteredEmails = filteredEmails.filter((email) => new Date(email.timestamp) <= to)
    }

    // Sort by timestamp (most recent first)
    filteredEmails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Implement pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEmails = filteredEmails.slice(startIndex, endIndex)

    // Calculate statistics
    const stats = {
      total: filteredEmails.length,
      sent: filteredEmails.filter((email) => email.status === "sent").length,
      failed: filteredEmails.filter((email) => email.status === "failed").length,
      pending: filteredEmails.filter((email) => email.status === "pending").length,
      byType: filteredEmails.reduce(
        (acc, email) => {
          acc[email.type] = (acc[email.type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      successRate: Math.round(
        (filteredEmails.filter((email) => email.status === "sent").length / filteredEmails.length) * 100,
      ),
    }

    return createApiResponse({
      emails: paginatedEmails,
      stats,
      pagination: {
        page,
        limit,
        total: filteredEmails.length,
        totalPages: Math.ceil(filteredEmails.length / limit),
        hasNext: endIndex < filteredEmails.length,
        hasPrev: page > 1,
      },
      filters: {
        recipient,
        status,
        type,
        from: fromDate,
        to: toDate,
      },
    })
  } catch (error) {
    console.error("Email notifications API error:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
