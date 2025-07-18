"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Car,
  Calendar,
  MapPin,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Truck,
  LogOut,
  RefreshCw,
  Download,
} from "lucide-react"

// --- safe JSON helper -------------------------------------------------------
async function parseResponse<T = any>(res: Response): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const ct = res.headers.get("content-type") || ""
    const isJSON = ct.includes("application/json")

    if (isJSON) {
      const body = await res.json()
      return res.ok ? { ok: true, data: body as T } : { ok: false, error: body?.error || "API error" }
    } else {
      const text = await res.text()
      return res.ok ? { ok: true, data: text as T } : { ok: false, error: text || "Unknown error" }
    }
  } catch (err) {
    console.error("Response parsing error:", err)
    return { ok: false, error: "Failed to parse server response" }
  }
}

// PDF generation utility
const generatePDF = (request: VehicleRequest) => {
  const content = `
    VEHICLE REQUEST FORM - CSIR-CRRI
    
    Request ID: ${request.id}
    Status: ${request.status.toUpperCase()}
    
    BASIC INFORMATION:
    Date of Indent: ${request.dateOfIndent}
    Vehicle Type: ${request.vehicleType}
    Date of Duty: ${request.dateOfDuty}
    Division/Section: ${request.division}
    Booking Time: ${request.bookingTimeFrom} - ${request.bookingTimeTo}
    Contact Number: ${request.contactNumber}
    
    TRAVEL DETAILS:
    Place to Visit: ${request.placeToVisit}
    Purpose of Visit: ${request.purposeOfVisit}
    
    PERSONS TO BE PICKED:
    ${request.persons
      .map(
        (person, index) => `
    ${index + 1}. Name: ${person.name}
       ID No: ${person.idNo}
       From: ${person.from}
       To: ${person.to}
       CRRI: ${person.crri ? "Yes" : "No"}
    `,
      )
      .join("")}
    
    ${
      request.vehicleAssigned
        ? `
    VEHICLE ASSIGNMENT:
    Vehicle Number: ${request.vehicleAssigned}
    ${request.driverAssigned ? `Driver: ${request.driverAssigned}` : ""}
    `
        : ""
    }
    
    ${
      request.comments.length > 0
        ? `
    COMMENTS:
    ${request.comments
      .map(
        (comment) => `
    ${comment.by} (${new Date(comment.at).toLocaleString()}):
    ${comment.text}
    `,
      )
      .join("")}
    `
        : ""
    }
    
    Submitted by: ${request.submittedBy}
    Submitted on: ${new Date(request.submittedAt).toLocaleString()}
    ${request.approvedBy ? `Approved by: ${request.approvedBy} on ${new Date(request.approvedAt!).toLocaleString()}` : ""}
  `

  // Create and download the PDF-like text file
  const blob = new Blob([content], { type: "text/plain" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `vehicle-request-${request.id}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

interface VehicleRequest {
  id: string
  status: "pending" | "approved" | "rejected"
  submittedBy: string
  submittedAt: string
  dateOfIndent: string
  vehicleType: string
  dateOfDuty: string
  division: string
  bookingTimeFrom: string
  bookingTimeTo: string
  placeToVisit: string
  purposeOfVisit: string
  contactNumber: string
  persons: Array<{
    name: string
    idNo: string
    from: string
    to: string
    crri: boolean
  }>
  approvedBy?: string
  approvedAt?: string
  vehicleAssigned?: string
  driverAssigned?: string
  comments: Array<{
    by: string
    at: string
    text: string
  }>
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<VehicleRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedRequest, setSelectedRequest] = useState<VehicleRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    dateFrom: "",
    dateTo: "",
    submittedBy: "",
  })

  // Action form data
  const [actionData, setActionData] = useState({
    comment: "",
    vehicleAssigned: "",
    driverAssigned: "",
  })

  const router = useRouter()

  useEffect(() => {
    // Check authentication - try multiple sources
    const username = localStorage.getItem("username")
    const role = localStorage.getItem("role")
    const userData = localStorage.getItem("user")

    if (username && role) {
      setCurrentUser({ username, role })
    } else if (userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentUser(user)
      } catch (err) {
        console.error("Failed to parse user data:", err)
        router.push("/auth/login")
        return
      }
    } else {
      router.push("/auth/login")
      return
    }

    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Fetching requests with filters:", filters)

      const params = new URLSearchParams()
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom)
      if (filters.dateTo) params.append("dateTo", filters.dateTo)
      if (filters.submittedBy) params.append("submittedBy", filters.submittedBy)

      const token = localStorage.getItem("token")
      const headers: HeadersInit = {}

      if (token && !token.startsWith("mock_token_")) {
        headers.Authorization = `Bearer ${token}`
      }

      console.log("Making request to:", `/api/vehicle/requests?${params}`)

      const res = await fetch(`/api/vehicle/requests?${params}`, { headers })

      console.log("Response status:", res.status)
      console.log("Response headers:", Object.fromEntries(res.headers.entries()))

      const { ok, data, error: errMsg } = await parseResponse(res)

      if (ok) {
        console.log("Success response:", data)
        const requestsData = (data as any)?.requests ?? []
        setRequests(requestsData)
        setError("")
      } else {
        console.error("Error response:", errMsg)
        setError(errMsg || "Failed to fetch requests")
      }
    } catch (err) {
      console.error("Fetch requests error:", err)
      setError(`Network error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: "approve" | "reject" | "assign_vehicle", requestId: string) => {
    try {
      setActionLoading(true)
      setError("")

      const token = localStorage.getItem("token")

      const res = await fetch("/api/vehicle/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && !token.startsWith("mock_token_") ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, requestId, ...actionData }),
      })

      const { ok, data, error: errMsg } = await parseResponse(res)

      if (ok) {
        alert((data as any)?.message ?? "Success")
        fetchRequests()
        setActionData({ comment: "", vehicleAssigned: "", driverAssigned: "" })
        setError("")
      } else {
        setError(errMsg || "Action failed")
      }
    } catch (err) {
      console.error("Action error:", err)
      setError(`Network error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "approved":
        return <Badge variant="default">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Role-based permissions
  const isHOD = currentUser?.role === "HOD" || currentUser?.role?.toLowerCase() === "hod"
  const isTransportHead =
    currentUser?.role === "Transport Head" || currentUser?.role?.toLowerCase() === "transport head"
  const isAdmin = currentUser?.role === "admin"

  // HOD can approve/reject pending requests
  const canApprove = isHOD || isAdmin

  // Transport Head can assign vehicles to approved requests
  const canAssignVehicle = isTransportHead || isAdmin

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("username")
    localStorage.removeItem("role")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077cc] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-[#004080]">Vehicle Requests</h1>
              <Badge variant="outline">{currentUser?.role || currentUser?.username}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push("/vehicle-indent")}>
                New Request
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchRequests} className="w-full" disabled={loading}>
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Filter className="h-4 w-4 mr-2" />
                    )}
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={fetchRequests}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Requests List */}
          <div className="space-y-4">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{error ? "Unable to load requests" : "No requests found"}</p>
                  {error && (
                    <Button variant="outline" onClick={fetchRequests} className="mt-4 bg-transparent">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <h3 className="font-semibold text-lg">Request #{request.id}</h3>
                          <p className="text-sm text-gray-600">
                            Submitted by {request.submittedBy} on {new Date(request.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(request.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDF(request)}
                          className="bg-blue-50 hover:bg-blue-100"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center justify-between">
                                <span>Request Details - {request.id}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generatePDF(request)}
                                  className="ml-4"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </Button>
                              </DialogTitle>
                              <DialogDescription>Complete information about this vehicle request</DialogDescription>
                            </DialogHeader>

                            {selectedRequest && (
                              <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-medium">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Vehicle Type</Label>
                                    <p className="mt-1">{selectedRequest.vehicleType}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Date of Duty</Label>
                                    <p className="mt-1">{selectedRequest.dateOfDuty}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Division</Label>
                                    <p className="mt-1">{selectedRequest.division}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Booking Time</Label>
                                    <p className="mt-1">
                                      {selectedRequest.bookingTimeFrom} - {selectedRequest.bookingTimeTo}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Contact</Label>
                                    <p className="mt-1">{selectedRequest.contactNumber}</p>
                                  </div>
                                </div>

                                {/* Places and Purpose */}
                                <div className="space-y-4">
                                  <div>
                                    <Label className="font-medium">Place to Visit</Label>
                                    <p className="mt-1">{selectedRequest.placeToVisit}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Purpose of Visit</Label>
                                    <p className="mt-1">{selectedRequest.purposeOfVisit}</p>
                                  </div>
                                </div>

                                {/* Persons */}
                                <div>
                                  <Label className="font-medium">Persons to be Picked</Label>
                                  <div className="mt-2 space-y-2">
                                    {selectedRequest.persons.map((person, index) => (
                                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div>
                                            <strong>Name:</strong> {person.name}
                                          </div>
                                          <div>
                                            <strong>ID:</strong> {person.idNo}
                                          </div>
                                          <div>
                                            <strong>From:</strong> {person.from}
                                          </div>
                                          <div>
                                            <strong>To:</strong> {person.to}
                                          </div>
                                        </div>
                                        {person.crri && (
                                          <Badge variant="outline" className="mt-2">
                                            CRRI
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Vehicle Assignment */}
                                {selectedRequest.vehicleAssigned && (
                                  <div className="p-4 bg-green-50 rounded-lg">
                                    <Label className="font-medium text-green-800">Vehicle Assigned</Label>
                                    <div className="mt-2 space-y-1">
                                      <p>
                                        <strong>Vehicle:</strong> {selectedRequest.vehicleAssigned}
                                      </p>
                                      {selectedRequest.driverAssigned && (
                                        <p>
                                          <strong>Driver:</strong> {selectedRequest.driverAssigned}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Comments */}
                                {selectedRequest.comments.length > 0 && (
                                  <div>
                                    <Label className="font-medium">Comments</Label>
                                    <div className="mt-2 space-y-2">
                                      {selectedRequest.comments.map((comment, index) => (
                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                          <div className="flex justify-between items-start">
                                            <p className="text-sm">{comment.text}</p>
                                            <div className="text-xs text-gray-500">
                                              <div>{comment.by}</div>
                                              <div>{new Date(comment.at).toLocaleString()}</div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* HOD Actions - Approve/Reject only */}
                                {canApprove && selectedRequest.status === "pending" && (
                                  <div className="border-t pt-4">
                                    <Label className="font-medium">HOD Actions</Label>
                                    <div className="mt-4 space-y-4">
                                      <Textarea
                                        placeholder="Add a comment..."
                                        value={actionData.comment}
                                        onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
                                      />
                                      <div className="flex space-x-2">
                                        <Button
                                          onClick={() => handleAction("approve", selectedRequest.id)}
                                          disabled={actionLoading}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <ThumbsUp className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                        <Button
                                          onClick={() => handleAction("reject", selectedRequest.id)}
                                          disabled={actionLoading}
                                          variant="destructive"
                                        >
                                          <ThumbsDown className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Transport Head Actions - Vehicle Assignment */}
                                {canAssignVehicle &&
                                  selectedRequest.status === "approved" &&
                                  !selectedRequest.vehicleAssigned && (
                                    <div className="border-t pt-4">
                                      <Label className="font-medium">Transport Head - Assign Vehicle</Label>
                                      <div className="mt-4 space-y-4">
                                        <Textarea
                                          placeholder="Add a comment..."
                                          value={actionData.comment}
                                          onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                          <Input
                                            placeholder="Vehicle Number"
                                            value={actionData.vehicleAssigned}
                                            onChange={(e) =>
                                              setActionData({ ...actionData, vehicleAssigned: e.target.value })
                                            }
                                            required
                                          />
                                          <Input
                                            placeholder="Driver Name"
                                            value={actionData.driverAssigned}
                                            onChange={(e) =>
                                              setActionData({ ...actionData, driverAssigned: e.target.value })
                                            }
                                          />
                                        </div>
                                        <Button
                                          onClick={() => handleAction("assign_vehicle", selectedRequest.id)}
                                          disabled={actionLoading || !actionData.vehicleAssigned}
                                          className="bg-blue-600 hover:bg-blue-700"
                                        >
                                          <Truck className="h-4 w-4 mr-2" />
                                          Assign Vehicle
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                {/* Transport Head Actions - Update Vehicle Assignment */}
                                {canAssignVehicle &&
                                  selectedRequest.status === "approved" &&
                                  selectedRequest.vehicleAssigned && (
                                    <div className="border-t pt-4">
                                      <Label className="font-medium">Transport Head - Update Vehicle Assignment</Label>
                                      <div className="mt-4 space-y-4">
                                        <Textarea
                                          placeholder="Add a comment..."
                                          value={actionData.comment}
                                          onChange={(e) => setActionData({ ...actionData, comment: e.target.value })}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                          <Input
                                            placeholder="New Vehicle Number"
                                            value={actionData.vehicleAssigned}
                                            onChange={(e) =>
                                              setActionData({ ...actionData, vehicleAssigned: e.target.value })
                                            }
                                          />
                                          <Input
                                            placeholder="New Driver Name"
                                            value={actionData.driverAssigned}
                                            onChange={(e) =>
                                              setActionData({ ...actionData, driverAssigned: e.target.value })
                                            }
                                          />
                                        </div>
                                        <Button
                                          onClick={() => handleAction("assign_vehicle", selectedRequest.id)}
                                          disabled={actionLoading || !actionData.vehicleAssigned}
                                          className="bg-orange-600 hover:bg-orange-700"
                                        >
                                          <Truck className="h-4 w-4 mr-2" />
                                          Update Assignment
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span>{request.vehicleType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{request.dateOfDuty}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{request.placeToVisit}</span>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                      <p>
                        <strong>Purpose:</strong> {request.purposeOfVisit}
                      </p>
                      <p>
                        <strong>Division:</strong> {request.division}
                      </p>
                      {request.vehicleAssigned && (
                        <p className="text-green-600 font-medium">
                          <strong>Assigned Vehicle:</strong> {request.vehicleAssigned}
                          {request.driverAssigned && ` (Driver: ${request.driverAssigned})`}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
