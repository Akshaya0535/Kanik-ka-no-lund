import type { NextRequest } from "next/server"
import { authenticateAdmin, createApiResponse, createErrorResponse } from "@/lib/auth-utils"
import { mockUsers } from "@/lib/mock-database"

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const adminUser = await authenticateAdmin(request)
    if (!adminUser) {
      return createErrorResponse("Unauthorized: Admin access required", 401)
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get("role")
    const statusFilter = searchParams.get("status")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Filter users based on query parameters
    let filteredUsers = [...mockUsers]

    if (roleFilter) {
      filteredUsers = filteredUsers.filter((user) => user.role === roleFilter)
    }

    if (statusFilter) {
      filteredUsers = filteredUsers.filter((user) => user.status === statusFilter)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (user) => user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower),
      )
    }

    // Sort by creation date (newest first)
    filteredUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Implement pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return createApiResponse({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1,
      },
      filters: {
        role: roleFilter,
        status: statusFilter,
        search,
      },
    })
  } catch (error) {
    console.error("Users API error:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
