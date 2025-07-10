export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "moderator"
  status: "active" | "inactive" | "suspended"
  createdAt: string
  lastLoginAt: string
  emailVerified: boolean
}

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  details: string
  timestamp: string
  ipAddress: string
  userAgent?: string
}

export interface EmailNotification {
  id: string
  recipient: string
  subject: string
  status: "sent" | "failed" | "pending"
  timestamp: string
  errorMessage?: string
  type: "welcome" | "password_reset" | "notification" | "system"
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  message: string
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}
