import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

// Mock JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

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
    return null
  }
}

export function generateToken(user: User): string {
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

export async function authenticateAdmin(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)

  if (!payload || payload.role !== "admin") {
    return null
  }

  return payload
}

export function createApiResponse(data: any, status = 200) {
  return Response.json(data, { status })
}

export function createErrorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}
