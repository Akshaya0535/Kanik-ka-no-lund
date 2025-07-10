import type { NextRequest } from "next/server"

// Mock database for vehicle requests
const vehicleRequests: any[] = []

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Generate unique request ID
    const requestId = `REQ_${Date.now()}`

    // Create new request object
    const newRequest = {
      id: requestId,
      status: "pending",
      submittedBy: "current_user", // In real app, get from auth
      submittedAt: new Date().toISOString(),
      ...body,
      approvedBy: null,
      approvedAt: null,
      vehicleAssigned: null,
      driverAssigned: null,
      comments: [],
    }

    // Add to mock database
    vehicleRequests.push(newRequest)

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Vehicle indent request submitted successfully",
        requestId: requestId,
        data: newRequest,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to submit request",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
