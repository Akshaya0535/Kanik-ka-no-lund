import type { NextRequest } from "next/server"
import { authenticateUser, createApiResponse, createErrorResponse } from "@/lib/auth-utils"
import { findUserById } from "@/lib/mock-database"

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await authenticateUser(request)
    if (!authUser) {
      return createErrorResponse("Unauthorized", 401)
    }

    // Get user details
    const user = findUserById(authUser.userId)
    if (!user) {
      return createErrorResponse("User not found", 404)
    }

    return createApiResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    })
  } catch (error) {
    console.error("Profile API error:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
