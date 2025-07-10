import type { NextRequest } from "next/server"
import { createApiResponse, createErrorResponse, generateToken } from "@/lib/auth-utils"
import { findUserByEmail, updateUserLastLogin, addAuditLogEntry } from "@/lib/mock-database"

// Demo users for the CSIR-CRRI system
const demoUsers = [
  { username: "hod1", password: "1234", role: "HOD", email: "hod1@crri.gov.in", name: "Dr. HOD Singh" },
  {
    username: "employee1",
    password: "abcd",
    role: "Employee",
    email: "employee1@crri.gov.in",
    name: "Mr. Employee Kumar",
  },
  {
    username: "transport",
    password: "admin",
    role: "Transport Head",
    email: "transport@crri.gov.in",
    name: "Mr. Transport Head",
  },
  { username: "admin", password: "demo", role: "admin", email: "admin@example.com", name: "Admin User" },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json()

    if ((!email && !username) || !password) {
      return createErrorResponse("Email/Username and password are required", 400)
    }

    // First try to find demo user by username or email
    const matchedUser = demoUsers.find(
      (user) => user.email === email || user.username === email || user.username === username,
    )

    // If found demo user, check password
    if (matchedUser && matchedUser.password === password) {
      // Create user object for token generation
      const userForToken = {
        id: matchedUser.username,
        email: matchedUser.email,
        name: matchedUser.name,
        role:
          matchedUser.role.toLowerCase() === "hod"
            ? "admin"
            : matchedUser.role.toLowerCase() === "transport head"
              ? "admin"
              : "user",
      }

      // Generate JWT token
      const token = generateToken(userForToken)

      // Log the login
      addAuditLogEntry({
        userId: matchedUser.username,
        userName: matchedUser.name,
        action: "LOGIN",
        resource: "AUTH",
        details: `${matchedUser.role} user logged in successfully`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
      })

      return createApiResponse({
        token,
        user: {
          id: matchedUser.username,
          email: matchedUser.email,
          name: matchedUser.name,
          role: matchedUser.role,
          username: matchedUser.username,
        },
        message: "Login successful",
      })
    }

    // Try to find user in mock database
    const user = findUserByEmail(email)
    if (!user) {
      return createErrorResponse("Invalid credentials", 401)
    }

    // Check if user is suspended
    if (user.status === "suspended") {
      return createErrorResponse("Account suspended. Please contact support.", 403)
    }

    // In production, verify password hash
    // For demo purposes, we'll accept any password for existing users
    // const isValidPassword = verifyPassword(password, user.passwordHash)

    // Update last login
    updateUserLastLogin(user.id)

    // Generate JWT token
    const token = generateToken(user)

    // Log the login
    addAuditLogEntry({
      userId: user.id,
      userName: user.name,
      action: "LOGIN",
      resource: "AUTH",
      details: `User logged in successfully`,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return createApiResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
