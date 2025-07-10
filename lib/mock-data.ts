export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "moderator"
  status: "active" | "inactive" | "suspended"
  createdAt: string
  lastLoginAt: string
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
}

export interface EmailNotification {
  id: string
  recipient: string
  subject: string
  status: "sent" | "failed" | "pending"
  timestamp: string
  errorMessage?: string
}

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    lastLoginAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-16T11:00:00Z",
    lastLoginAt: "2024-01-19T09:15:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    status: "inactive",
    createdAt: "2024-01-17T12:00:00Z",
    lastLoginAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "4",
    name: "Alice Moderator",
    email: "alice@example.com",
    role: "moderator",
    status: "active",
    createdAt: "2024-01-18T13:00:00Z",
    lastLoginAt: "2024-01-20T11:20:00Z",
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "user",
    status: "suspended",
    createdAt: "2024-01-19T14:00:00Z",
    lastLoginAt: "2024-01-19T15:30:00Z",
  },
]

// Mock Audit Log Data
export const mockAuditLog: AuditLogEntry[] = [
  {
    id: "1",
    userId: "1",
    userName: "John Admin",
    action: "LOGIN",
    resource: "AUTH",
    details: "Admin user logged in",
    timestamp: "2024-01-20T14:30:00Z",
    ipAddress: "192.168.1.100",
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
    details: "Suspended user charlie@example.com",
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
]

// Mock Email Notifications Data
export const mockEmailNotifications: EmailNotification[] = [
  {
    id: "1",
    recipient: "jane@example.com",
    subject: "Welcome to our platform!",
    status: "sent",
    timestamp: "2024-01-20T14:00:00Z",
  },
  {
    id: "2",
    recipient: "bob@example.com",
    subject: "Password reset request",
    status: "failed",
    timestamp: "2024-01-20T13:30:00Z",
    errorMessage: "Invalid email address",
  },
  {
    id: "3",
    recipient: "alice@example.com",
    subject: "Account verification",
    status: "sent",
    timestamp: "2024-01-20T12:45:00Z",
  },
  {
    id: "4",
    recipient: "charlie@example.com",
    subject: "Account suspended notification",
    status: "pending",
    timestamp: "2024-01-20T12:00:00Z",
  },
  {
    id: "5",
    recipient: "admin@example.com",
    subject: "Daily system report",
    status: "sent",
    timestamp: "2024-01-20T09:00:00Z",
  },
]
