import type { User, AuditLogEntry, EmailNotification } from "./types"

// Mock Users Database
export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    lastLoginAt: "2024-01-20T14:30:00Z",
    emailVerified: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-16T11:00:00Z",
    lastLoginAt: "2024-01-19T09:15:00Z",
    emailVerified: true,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    status: "inactive",
    createdAt: "2024-01-17T12:00:00Z",
    lastLoginAt: "2024-01-18T16:45:00Z",
    emailVerified: false,
  },
  {
    id: "4",
    name: "Alice Moderator",
    email: "alice@example.com",
    role: "moderator",
    status: "active",
    createdAt: "2024-01-18T13:00:00Z",
    lastLoginAt: "2024-01-20T11:20:00Z",
    emailVerified: true,
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "user",
    status: "suspended",
    createdAt: "2024-01-19T14:00:00Z",
    lastLoginAt: "2024-01-19T15:30:00Z",
    emailVerified: true,
  },
]

// Mock Audit Log Database
export const mockAuditLog: AuditLogEntry[] = [
  {
    id: "1",
    userId: "1",
    userName: "John Admin",
    action: "LOGIN",
    resource: "AUTH",
    details: "Admin user logged in successfully",
    timestamp: "2024-01-20T14:30:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
  {
    id: "2",
    userId: "2",
    userName: "Jane Smith",
    action: "UPDATE_PROFILE",
    resource: "USER",
    details: "Updated profile information",
    timestamp: "2024-01-20T13:15:00Z",
    ipAddress: "192.168.1.101",
  },
  {
    id: "3",
    userId: "1",
    userName: "John Admin",
    action: "SUSPEND_USER",
    resource: "USER",
    details: "Suspended user charlie@example.com for policy violation",
    timestamp: "2024-01-20T12:00:00Z",
    ipAddress: "192.168.1.100",
  },
  {
    id: "4",
    userId: "4",
    userName: "Alice Moderator",
    action: "DELETE_POST",
    resource: "POST",
    details: "Deleted inappropriate post #123",
    timestamp: "2024-01-20T11:45:00Z",
    ipAddress: "192.168.1.102",
  },
  {
    id: "5",
    userId: "3",
    userName: "Bob Johnson",
    action: "LOGOUT",
    resource: "AUTH",
    details: "User logged out",
    timestamp: "2024-01-20T10:30:00Z",
    ipAddress: "192.168.1.103",
  },
  {
    id: "6",
    userId: "2",
    userName: "Jane Smith",
    action: "PASSWORD_RESET_REQUEST",
    resource: "AUTH",
    details: "Requested password reset",
    timestamp: "2024-01-20T09:15:00Z",
    ipAddress: "192.168.1.101",
  },
]

// Mock Email Notifications Database
export const mockEmailNotifications: EmailNotification[] = [
  {
    id: "1",
    recipient: "jane@example.com",
    subject: "Welcome to UserPanel!",
    status: "sent",
    timestamp: "2024-01-20T14:00:00Z",
    type: "welcome",
  },
  {
    id: "2",
    recipient: "bob@example.com",
    subject: "Password Reset Request",
    status: "failed",
    timestamp: "2024-01-20T13:30:00Z",
    errorMessage: "SMTP server timeout",
    type: "password_reset",
  },
  {
    id: "3",
    recipient: "alice@example.com",
    subject: "Account Verification Required",
    status: "sent",
    timestamp: "2024-01-20T12:45:00Z",
    type: "notification",
  },
  {
    id: "4",
    recipient: "charlie@example.com",
    subject: "Account Suspended - Action Required",
    status: "pending",
    timestamp: "2024-01-20T12:00:00Z",
    type: "notification",
  },
  {
    id: "5",
    recipient: "admin@example.com",
    subject: "Daily System Report - January 20, 2024",
    status: "sent",
    timestamp: "2024-01-20T09:00:00Z",
    type: "system",
  },
  {
    id: "6",
    recipient: "jane@example.com",
    subject: "Password Reset Successful",
    status: "sent",
    timestamp: "2024-01-20T08:30:00Z",
    type: "password_reset",
  },
]

// Helper functions for database operations
export function findUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email === email)
}

export function findUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id)
}

export function createUser(userData: Omit<User, "id" | "createdAt" | "lastLoginAt">): User {
  const newUser: User = {
    ...userData,
    id: (mockUsers.length + 1).toString(),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  }
  mockUsers.push(newUser)
  return newUser
}

export function updateUserLastLogin(userId: string): void {
  const user = findUserById(userId)
  if (user) {
    user.lastLoginAt = new Date().toISOString()
  }
}

export function addAuditLogEntry(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: (mockAuditLog.length + 1).toString(),
    timestamp: new Date().toISOString(),
  }
  mockAuditLog.unshift(newEntry) // Add to beginning for most recent first
}

export function addEmailNotification(notification: Omit<EmailNotification, "id" | "timestamp">): void {
  const newNotification: EmailNotification = {
    ...notification,
    id: (mockEmailNotifications.length + 1).toString(),
    timestamp: new Date().toISOString(),
  }
  mockEmailNotifications.unshift(newNotification)
}
