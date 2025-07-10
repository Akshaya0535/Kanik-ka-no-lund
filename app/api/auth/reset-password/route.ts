import type { NextRequest } from "next/server"
import { createApiResponse, createErrorResponse } from "@/lib/auth-utils"
import { findUserByEmail, addAuditLogEntry, addEmailNotification } from "@/lib/mock-database"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return createErrorResponse("Email is required", 400)
    }

    // Find user by email
    const user = findUserByEmail(email)
    if (!user) {
      // Don't reveal if email exists or not for security
      return createApiResponse({
        message: "If an account with that email exists, a password reset link has been sent.",
      })
    }

    // Log the password reset request
    addAuditLogEntry({
      userId: user.id,
      userName: user.name,
      action: "PASSWORD_RESET_REQUEST",
      resource: "AUTH",
      details: "Password reset requested",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || undefined,
    })

    // Send password reset email (mock)
    addEmailNotification({
      recipient: email,
      subject: "Password Reset Request",
      status: "sent",
      type: "password_reset",
    })

    return createApiResponse({
      message: "If an account with that email exists, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
