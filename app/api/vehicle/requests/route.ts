import type { NextRequest } from "next/server"

// Local JSON helpers (avoid importing utils that pull in node-only deps)
function createApiResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })
}

function createErrorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  })
}

// util: return epoch ms or null
function toEpoch(value: string | null): number | null {
  if (!value) return null
  const t = Date.parse(value) // returns NaN on failure
  return Number.isNaN(t) ? null : t
}

// Mock database for vehicle requests
const vehicleRequests: any[] = [
  {
    id: "REQ_001",
    status: "pending",
    submittedBy: "employee1",
    submittedAt: "2024-01-20T10:30:00Z",
    dateOfIndent: "2024-01-20",
    vehicleType: "Car",
    dateOfDuty: "2024-01-22",
    division: "Research Division",
    bookingTimeFrom: "09:00",
    bookingTimeTo: "17:00",
    placeToVisit: "Delhi University",
    purposeOfVisit: "Research collaboration meeting",
    contactNumber: "+91-9876543210",
    persons: [{ name: "Dr. Smith", idNo: "EMP001", from: "CRRI", to: "Delhi University", crri: true }],
    approvedBy: null,
    approvedAt: null,
    vehicleAssigned: null,
    driverAssigned: null,
    comments: [],
  },
  {
    id: "REQ_002",
    status: "approved",
    submittedBy: "employee2",
    submittedAt: "2024-01-19T14:15:00Z",
    dateOfIndent: "2024-01-19",
    vehicleType: "Van",
    dateOfDuty: "2024-01-21",
    division: "Transport Division",
    bookingTimeFrom: "08:00",
    bookingTimeTo: "18:00",
    placeToVisit: "IIT Delhi",
    purposeOfVisit: "Equipment transportation",
    contactNumber: "+91-9876543211",
    persons: [
      { name: "Mr. Kumar", idNo: "EMP002", from: "CRRI", to: "IIT Delhi", crri: true },
      { name: "Ms. Sharma", idNo: "EMP003", from: "CRRI", to: "IIT Delhi", crri: true },
    ],
    approvedBy: "hod1",
    approvedAt: "2024-01-19T16:30:00Z",
    vehicleAssigned: "DL-01-AB-1234",
    driverAssigned: "Rajesh Kumar",
    comments: [{ by: "hod1", at: "2024-01-19T16:30:00Z", text: "Approved for equipment transport" }],
  },
  {
    id: "REQ_003",
    status: "rejected",
    submittedBy: "employee3",
    submittedAt: "2024-01-18T11:20:00Z",
    dateOfIndent: "2024-01-18",
    vehicleType: "Bus",
    dateOfDuty: "2024-01-25",
    division: "Admin Division",
    bookingTimeFrom: "06:00",
    bookingTimeTo: "22:00",
    placeToVisit: "Goa",
    purposeOfVisit: "Team outing",
    contactNumber: "+91-9876543212",
    persons: [{ name: "Multiple staff", idNo: "VARIOUS", from: "CRRI", to: "Goa", crri: false }],
    approvedBy: "hod1",
    approvedAt: "2024-01-18T13:45:00Z",
    vehicleAssigned: null,
    driverAssigned: null,
    comments: [{ by: "hod1", at: "2024-01-18T13:45:00Z", text: "Personal trips not allowed with official vehicles" }],
  },
]

export async function GET(request: NextRequest) {
  try {
    // Simply return everything in mock DB
    return createApiResponse({
      requests: vehicleRequests,
      total: vehicleRequests.length,
      userRole: "user",
    })
  } catch (err) {
    console.error("GET /api/vehicle/requests failed:", err)
    return createErrorResponse("Unable to fetch requests", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/vehicle/requests - Starting")

    const body = await request.json()
    const { action, requestId, ...updateData } = body

    console.log("Action:", action, "RequestId:", requestId)

    if (action === "approve" || action === "reject") {
      const requestIndex = vehicleRequests.findIndex((req) => req.id === requestId)
      if (requestIndex === -1) {
        return createErrorResponse("Request not found", 404)
      }

      const request = vehicleRequests[requestIndex]
      request.status = action === "approve" ? "approved" : "rejected"
      request.approvedBy = "current_user" // Mock user for now
      request.approvedAt = new Date().toISOString()

      if (updateData.comment) {
        request.comments.push({
          by: "current_user",
          at: new Date().toISOString(),
          text: updateData.comment,
        })
      }

      // HOD only approves/rejects - no vehicle assignment
      // Vehicle assignment is handled separately by Transport Head

      return createApiResponse({
        message: `Request ${action}d successfully`,
        request: request,
      })
    }

    if (action === "assign_vehicle") {
      const requestIndex = vehicleRequests.findIndex((req) => req.id === requestId)
      if (requestIndex === -1) {
        return createErrorResponse("Request not found", 404)
      }

      const request = vehicleRequests[requestIndex]
      if (request.status !== "approved") {
        return createErrorResponse("Can only assign vehicles to approved requests", 400)
      }

      request.vehicleAssigned = updateData.vehicleAssigned
      request.driverAssigned = updateData.driverAssigned

      if (updateData.comment) {
        request.comments.push({
          by: "current_user",
          at: new Date().toISOString(),
          text: updateData.comment,
        })
      }

      return createApiResponse({
        message: "Vehicle assigned successfully",
        request: request,
      })
    }

    return createErrorResponse("Invalid action", 400)
  } catch (error) {
    console.error("Process request error:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
