"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Building, Truck, Users, FileText, Car, ClipboardList } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const username = localStorage.getItem("username")
    const role = localStorage.getItem("role")

    if (username && role) {
      setUser({ username, role })
    } else {
      router.push("/")
    }
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("username")
    localStorage.removeItem("role")
    router.push("/")
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "HOD":
        return <Building className="h-6 w-6 text-blue-600" />
      case "Transport Head":
        return <Truck className="h-6 w-6 text-green-600" />
      case "Employee":
        return <Users className="h-6 w-6 text-purple-600" />
      default:
        return <User className="h-6 w-6 text-gray-600" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "HOD":
        return "default"
      case "Transport Head":
        return "secondary"
      case "Employee":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "HOD":
        return "Head of Department - Full administrative access"
      case "Transport Head":
        return "Transport Department Head - Vehicle and logistics management"
      case "Employee":
        return "Staff Member - Standard user access"
      default:
        return "User"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077cc] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-[#004080]">CSIR-CRRI Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon(user.role)}
                <span className="text-sm text-gray-700">{user.username}</span>
                <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#004080]">Welcome, {user.username}!</h2>
            <p className="mt-2 text-gray-600">{getRoleDescription(user.role)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vehicle Indent Form Access */}
            <Card className="shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-[#004080]">
                  <Car className="h-6 w-6 mr-2" />
                  Vehicle Indent
                </CardTitle>
                <CardDescription>Submit vehicle booking requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Create and submit vehicle indent forms for official transportation needs.
                  </p>
                  <Link href="/vehicle-indent">
                    <Button className="w-full bg-[#0077cc] hover:bg-[#005fa3]">
                      <FileText className="h-4 w-4 mr-2" />
                      Create Vehicle Indent
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Request Management */}
            <Card className="shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-[#004080]">
                  <ClipboardList className="h-6 w-6 mr-2" />
                  Request Management
                </CardTitle>
                <CardDescription>View and manage vehicle requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {user.role === "Employee"
                      ? "Track your vehicle requests and their status."
                      : "Process and approve vehicle requests from staff members."}
                  </p>
                  <Link href="/requests">
                    <Button className="w-full bg-[#28a745] hover:bg-[#1f7d37]">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      {user.role === "Employee" ? "My Requests" : "Process Requests"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Profile Card */}
            <Card className="shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-[#004080]">
                  {getRoleIcon(user.role)}
                  <span className="ml-2">Profile Information</span>
                </CardTitle>
                <CardDescription>Your account details and role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Username</label>
                    <p className="text-lg font-semibold">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <div className="mt-1">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-sm">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Login Time</label>
                    <p className="text-sm">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific Features */}
            {user.role === "HOD" && (
              <Card className="shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-0">
                <CardHeader>
                  <CardTitle className="text-[#004080]">Department Management</CardTitle>
                  <CardDescription>Administrative oversight and approvals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/requests">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <FileText className="h-4 w-4 mr-2" />
                        Approve Vehicle Requests
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Users className="h-4 w-4 mr-2" />
                      View Staff Requests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.role === "Transport Head" && (
              <Card className="shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-0">
                <CardHeader>
                  <CardTitle className="text-[#004080]">Vehicle Management</CardTitle>
                  <CardDescription>Fleet and request management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Truck className="h-4 w-4 mr-2" />
                      Manage Fleet
                    </Button>
                    <Link href="/requests">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <FileText className="h-4 w-4 mr-2" />
                        Process Requests
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.role === "Employee" && (
              <Card className="shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-0">
                <CardHeader>
                  <CardTitle className="text-[#004080]">My Requests</CardTitle>
                  <CardDescription>Track your vehicle requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/requests">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <FileText className="h-4 w-4 mr-2" />
                        View My Requests
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Building className="h-4 w-4 mr-2" />
                      Request Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
