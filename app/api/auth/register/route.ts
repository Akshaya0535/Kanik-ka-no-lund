import type { NextRequest } from "next/server"
import { createApiResponse, createErrorResponse, generateToken, hashPassword } from "@/lib/auth-utils"
import { findUserByEmail, createUser, addAuditLogEntry, addEmailNotification } from "@/lib/mock-database"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return createErrorResponse("Name, email, and password are required", 400)
    }

    if (password.length < 6) {
      return createErrorResponse("Password must be at least 6 characters long", 400)
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return createErrorResponse("User with this email already exists", 409)
    }

    // Create new user
    const hashedPassword = hashPassword(password)
    const newUser = createUser({
      name,
      email,
      role: "user",
      status: "active",
      emailVerified: false,
    })

    // Generate token
    const token = generateToken(newUser)

    // Log the registration
    addAuditLogEntry({
      userId: newUser.id,
      userName: newUser.name,
      action: "REGISTER",
      resource: "AUTH",
      details: "New user registered",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || undefined,
    })

    // Send welcome email (mock)
    addEmailNotification({
      recipient: email,
      subject: "Welcome to UserPanel!",
      status: "sent",
      type: "welcome",
    })

    return createApiResponse(
      {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        message: "Registration successful",
      },
      201,
    )
  } catch (error) {
    console.error("Registration error:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
