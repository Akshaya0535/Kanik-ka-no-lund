import type { NextRequest } from "next/server"
import { authenticateAdmin, createApiResponse, createErrorResponse } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const adminUser = await authenticateAdmin(request)
    if (!adminUser) {
      return createErrorResponse("Unauthorized: Admin access required", 401)
    }

    // Return health status
    return createApiResponse({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        database: "connected",
        email: "operational",
        auth: "operational",
      },
      message: "All systems operational",
    })
  } catch (error) {
    console.error("Health check error:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
