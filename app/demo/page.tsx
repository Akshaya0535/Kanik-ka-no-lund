"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"

export default function DemoPage() {
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState("")

  const handleLogin = async (email: string) => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "demo" }),
      })

      const data = await res.json()

      if (res.ok) {
        setToken(data.token)
        setResponse(data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Login failed")
    } finally {
      setLoading(false)
    }
  }

  const makeApiCall = async (endpoint: string, params = "") => {
    if (!token) {
      setError("Please login first")
      return
    }

    setLoading(true)
    setError("")

    try {
      const url = `/api/admin${endpoint}${params ? `?${params}` : ""}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()

      if (res.ok) {
        setResponse(data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("API call failed")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
      admin: "outline",
      user: "secondary",
      moderator: "outline",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Admin Panel API Demo</h1>
          <p className="text-slate-600">Test all admin endpoints with live data</p>
        </div>

        {/* Login Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Login to get access token for admin endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => handleLogin("admin@example.com")} disabled={loading} variant="default">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login as Admin
              </Button>
              <Button onClick={() => handleLogin("jane@example.com")} disabled={loading} variant="outline">
                Login as User (Should Fail)
              </Button>
              {token && (
                <Badge variant="outline" className="px-3 py-1">
                  Token: {token.substring(0, 20)}...
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Testing Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and filter all users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button onClick={() => makeApiCall("/users")}>Get All Users</Button>
                  <Button onClick={() => makeApiCall("/users", "role=admin")} variant="outline">
                    Admin Users Only
                  </Button>
                  <Button onClick={() => makeApiCall("/users", "status=active")} variant="outline">
                    Active Users Only
                  </Button>
                  <Button onClick={() => makeApiCall("/users", "role=user&status=active")} variant="outline">
                    Active Regular Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>Monitor system actions and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button onClick={() => makeApiCall("/audit-log")}>Get Recent Logs</Button>
                  <Button onClick={() => makeApiCall("/audit-log", "action=LOGIN")} variant="outline">
                    Login Actions Only
                  </Button>
                  <Button onClick={() => makeApiCall("/audit-log", "from=2024-01-20&to=2024-01-21")} variant="outline">
                    Date Range Filter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Track email delivery status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button onClick={() => makeApiCall("/emails")}>Get All Emails</Button>
                  <Button onClick={() => makeApiCall("/emails", "status=failed")} variant="outline">
                    Failed Emails
                  </Button>
                  <Button onClick={() => makeApiCall("/emails", "recipient=jane@example.com")} variant="outline">
                    Specific Recipient
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle>Health Check</CardTitle>
                <CardDescription>Monitor API system status</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => makeApiCall("/health")}>Check System Health</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>User Summary</CardTitle>
                <CardDescription>Get user statistics and counts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => makeApiCall("/users/summary")}>Get User Summary</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <Alert className="mt-6" variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Response Display */}
        {response && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>API Response</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Users Response */}
              {response.users && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Users ({response.users.length})</h4>
                    {response.pagination && (
                      <Badge variant="outline">
                        Page {response.pagination.page} of {response.pagination.totalPages}
                      </Badge>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {response.users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-slate-600">{user.email}</div>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(user.role)}
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Log Response */}
              {response.logs && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Audit Log ({response.logs.length})</h4>
                  <div className="grid gap-2">
                    {response.logs.map((log: any) => (
                      <div key={log.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{log.action}</div>
                            <div className="text-sm text-slate-600">
                              {log.userName} - {log.details}
                            </div>
                          </div>
                          <div className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Response */}
              {response.emails && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Email Notifications ({response.emails.length})</h4>
                    {response.stats && (
                      <div className="flex gap-2">
                        <Badge variant="outline">Sent: {response.stats.sent}</Badge>
                        <Badge variant="destructive">Failed: {response.stats.failed}</Badge>
                        <Badge variant="secondary">Pending: {response.stats.pending}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {response.emails.map((email: any) => (
                      <div key={email.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{email.subject}</div>
                          <div className="text-sm text-slate-600">To: {email.recipient}</div>
                          {email.errorMessage && <div className="text-sm text-red-600">{email.errorMessage}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(email.status)}
                          <Badge
                            variant={
                              email.status === "sent"
                                ? "default"
                                : email.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {email.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Response */}
              {response.total !== undefined && (
                <div className="space-y-4">
                  <h4 className="font-semibold">User Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded text-center">
                      <div className="text-2xl font-bold">{response.total}</div>
                      <div className="text-sm text-slate-600">Total Users</div>
                    </div>
                    <div className="p-4 border rounded text-center">
                      <div className="text-2xl font-bold text-green-600">{response.byStatus?.active || 0}</div>
                      <div className="text-sm text-slate-600">Active</div>
                    </div>
                    <div className="p-4 border rounded text-center">
                      <div className="text-2xl font-bold text-blue-600">{response.byRole?.admin || 0}</div>
                      <div className="text-sm text-slate-600">Admins</div>
                    </div>
                    <div className="p-4 border rounded text-center">
                      <div className="text-2xl font-bold text-purple-600">{response.recentSignups || 0}</div>
                      <div className="text-sm text-slate-600">Recent Signups</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Health Response */}
              {response.status && (
                <div className="space-y-4">
                  <h4 className="font-semibold">System Health</h4>
                  <div className="p-4 border rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Status: {response.status}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <div>Version: {response.version}</div>
                      <div>Uptime: {Math.round(response.uptime)} seconds</div>
                      <div>Timestamp: {new Date(response.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw JSON for other responses */}
              {!response.users &&
                !response.logs &&
                !response.emails &&
                response.total === undefined &&
                !response.status && (
                  <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
