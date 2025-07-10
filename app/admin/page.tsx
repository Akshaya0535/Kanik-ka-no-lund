"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Activity,
  Mail,
  Shield,
  LogOut,
  Search,
  Filter,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string
}

interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  details: string
  timestamp: string
  ipAddress: string
}

interface EmailNotification {
  id: string
  recipient: string
  subject: string
  status: string
  timestamp: string
  type: string
  errorMessage?: string
}

interface SystemHealth {
  status: string
  timestamp: string
  version: string
  uptime: number
  services: {
    database: string
    email: string
    auth: string
  }
  environment: string
}

interface UserSummary {
  total: number
  byRole: Record<string, number>
  byStatus: Record<string, number>
  recentSignups: number
  activeToday: number
  emailStats: {
    verified: number
    unverified: number
    verificationRate: number
  }
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [emails, setEmails] = useState<EmailNotification[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")

  // Filters
  const [userFilters, setUserFilters] = useState({
    role: "all",
    status: "all",
    search: "",
  })
  const [auditFilters, setAuditFilters] = useState({
    action: "",
    from: "",
    to: "",
  })
  const [emailFilters, setEmailFilters] = useState({
    status: "all",
    type: "all",
    recipient: "",
  })

  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      if (user.role !== "admin") {
        router.push("/dashboard")
        return
      }
      setCurrentUser(user)
    } else {
      router.push("/auth/login")
      return
    }

    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    await Promise.all([fetchSystemHealth(), fetchUserSummary(), fetchUsers(), fetchAuditLogs(), fetchEmails()])
    setLoading(false)
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch("/api/admin/health", {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setSystemHealth(data)
      }
    } catch (err) {
      console.error("Failed to fetch system health:", err)
    }
  }

  const fetchUserSummary = async () => {
    try {
      const response = await fetch("/api/admin/users/summary", {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setUserSummary(data)
      }
    } catch (err) {
      console.error("Failed to fetch user summary:", err)
    }
  }

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (userFilters.role !== "all") params.append("role", userFilters.role)
      if (userFilters.status !== "all") params.append("status", userFilters.status)
      if (userFilters.search) params.append("search", userFilters.search)

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (auditFilters.action) params.append("action", auditFilters.action)
      if (auditFilters.from) params.append("from", auditFilters.from)
      if (auditFilters.to) params.append("to", auditFilters.to)

      const response = await fetch(`/api/admin/audit-log?${params}`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.logs)
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err)
    }
  }

  const fetchEmails = async () => {
    try {
      const params = new URLSearchParams()
      if (emailFilters.status !== "all") params.append("status", emailFilters.status)
      if (emailFilters.type !== "all") params.append("type", emailFilters.type)
      if (emailFilters.recipient) params.append("recipient", emailFilters.recipient)

      const response = await fetch(`/api/admin/emails?${params}`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails)
      }
    } catch (err) {
      console.error("Failed to fetch emails:", err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "healthy":
      case "connected":
      case "operational":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getBadgeVariant = (type: string, value: string) => {
    if (type === "role") {
      switch (value) {
        case "admin":
          return "default"
        case "moderator":
          return "secondary"
        default:
          return "outline"
      }
    }
    if (type === "status") {
      switch (value) {
        case "active":
          return "default"
        case "inactive":
          return "secondary"
        case "suspended":
          return "destructive"
        default:
          return "outline"
      }
    }
    if (type === "email") {
      switch (value) {
        case "sent":
          return "default"
        case "failed":
          return "destructive"
        case "pending":
          return "secondary"
        default:
          return "outline"
      }
    }
    return "outline"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {systemHealth && getStatusIcon(systemHealth.status)}
                <span className="text-sm text-gray-600">System {systemHealth?.status || "Unknown"}</span>
              </div>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                User Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {currentUser?.name}. Manage users and monitor system activity.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Summary Cards */}
              {userSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userSummary.total}</div>
                      <p className="text-xs text-muted-foreground">+{userSummary.recentSignups} this week</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userSummary.byStatus.active || 0}</div>
                      <p className="text-xs text-muted-foreground">{userSummary.activeToday} active today</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Email Verified</CardTitle>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userSummary.emailStats.verificationRate}%</div>
                      <p className="text-xs text-muted-foreground">
                        {userSummary.emailStats.verified} of {userSummary.total} users
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Admins</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userSummary.byRole.admin || 0}</div>
                      <p className="text-xs text-muted-foreground">{userSummary.byRole.moderator || 0} moderators</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent User Activity</CardTitle>
                    <CardDescription>Latest user actions and registrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{log.action}</p>
                            <p className="text-xs text-gray-500">
                              {log.userName} - {log.details}
                            </p>
                            <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Current system health and services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {systemHealth && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall Status</span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(systemHealth.status)}
                            <Badge variant="default">{systemHealth.status}</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Database</span>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(systemHealth.services.database)}
                              <span className="text-xs">{systemHealth.services.database}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Email Service</span>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(systemHealth.services.email)}
                              <span className="text-xs">{systemHealth.services.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Authentication</span>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(systemHealth.services.auth)}
                              <span className="text-xs">{systemHealth.services.auth}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="text-xs text-gray-500">
                            <div>Version: {systemHealth.version}</div>
                            <div>Environment: {systemHealth.environment || "production"}</div>
                            <div>Uptime: {Math.round(systemHealth.uptime / 3600)}h</div>
                            <div>Last Check: {new Date(systemHealth.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and filter all registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          value={userFilters.search}
                          onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={userFilters.role}
                      onValueChange={(value) => setUserFilters({ ...userFilters, role: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={userFilters.status}
                      onValueChange={(value) => setUserFilters({ ...userFilters, status: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={fetchUsers}>
                      <Filter className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>

                  {/* Users Table */}
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            {user.emailVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={getBadgeVariant("role", user.role)}>{user.role}</Badge>
                            <Badge variant={getBadgeVariant("status", user.status)}>{user.status}</Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                          <div>Last Login: {new Date(user.lastLoginAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Log</CardTitle>
                  <CardDescription>Monitor system actions and user activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Input
                      placeholder="Filter by action..."
                      value={auditFilters.action}
                      onChange={(e) => setAuditFilters({ ...auditFilters, action: e.target.value })}
                    />
                    <Input
                      type="date"
                      placeholder="From date"
                      value={auditFilters.from}
                      onChange={(e) => setAuditFilters({ ...auditFilters, from: e.target.value })}
                    />
                    <Input
                      type="date"
                      placeholder="To date"
                      value={auditFilters.to}
                      onChange={(e) => setAuditFilters({ ...auditFilters, to: e.target.value })}
                    />
                    <Button onClick={fetchAuditLogs}>
                      <Filter className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>

                  {/* Audit Log Table */}
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">{log.action}</Badge>
                              <Badge variant="secondary">{log.resource}</Badge>
                            </div>
                            <p className="font-medium">{log.details}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              User: {log.userName} | IP: {log.ipAddress}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emails Tab */}
            <TabsContent value="emails" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Monitor email delivery status and history</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Input
                      placeholder="Filter by recipient..."
                      value={emailFilters.recipient}
                      onChange={(e) => setEmailFilters({ ...emailFilters, recipient: e.target.value })}
                    />
                    <Select
                      value={emailFilters.status}
                      onValueChange={(value) => setEmailFilters({ ...emailFilters, status: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={emailFilters.type}
                      onValueChange={(value) => setEmailFilters({ ...emailFilters, type: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="password_reset">Password Reset</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={fetchEmails}>
                      <Filter className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>

                  {/* Email Table */}
                  <div className="space-y-3">
                    {emails.map((email) => (
                      <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(email.status)}
                            <Badge variant={getBadgeVariant("email", email.status)}>{email.status}</Badge>
                            <Badge variant="outline">{email.type}</Badge>
                          </div>
                          <p className="font-medium">{email.subject}</p>
                          <p className="text-sm text-gray-500">To: {email.recipient}</p>
                          {email.errorMessage && (
                            <p className="text-sm text-red-600 mt-1">Error: {email.errorMessage}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {new Date(email.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Current system status and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {systemHealth && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(systemHealth.status)}
                            <div>
                              <p className="font-medium">System Status</p>
                              <p className="text-sm text-gray-500">Overall system health</p>
                            </div>
                          </div>
                          <Badge variant="default">{systemHealth.status}</Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Database Connection</span>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(systemHealth.services.database)}
                              <span className="text-sm">{systemHealth.services.database}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Email Service</span>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(systemHealth.services.email)}
                              <span className="text-sm">{systemHealth.services.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Authentication Service</span>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(systemHealth.services.auth)}
                              <span className="text-sm">{systemHealth.services.auth}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Version</p>
                              <p className="font-medium">{systemHealth.version}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Environment</p>
                              <p className="font-medium">{systemHealth.environment || "production"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Uptime</p>
                              <p className="font-medium">{Math.round(systemHealth.uptime / 3600)}h</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Last Check</p>
                              <p className="font-medium">{new Date(systemHealth.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={fetchSystemHealth}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Refresh System Status
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={fetchUserSummary}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Refresh User Statistics
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={fetchAuditLogs}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Refresh Audit Logs
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent" onClick={fetchEmails}>
                        <Mail className="h-4 w-4 mr-2" />
                        Refresh Email Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
