import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.warn("Token verification failed:", error)
    return null
  }
}

export function generateToken(user: { id: string; email: string; name: string; role: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

export async function authenticateUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)

    // Skip mock tokens
    if (token.startsWith("mock_token_")) {
      return {
        userId: "demo_user",
        email: "demo@crri.gov.in",
        role: "user",
      }
    }

    return verifyToken(token)
  } catch (error) {
    console.warn("Authentication error:", error)
    return null
  }
}

export async function authenticateAdmin(request: NextRequest): Promise<JWTPayload | null> {
  const payload = await authenticateUser(request)

  if (!payload || payload.role !== "admin") {
    return null
  }

  return payload
}

export function createApiResponse(data: any, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export function createErrorResponse(message: string, status = 400) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}

export function hashPassword(password: string): string {
  // In production, use bcrypt or similar
  // This is a simple hash for demo purposes
  return Buffer.from(password).toString("base64")
}

export function verifyPassword(password: string, hash: string): boolean {
  // In production, use bcrypt.compare
  return Buffer.from(password).toString("base64") === hash
}
