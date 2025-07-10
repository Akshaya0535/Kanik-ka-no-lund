import type { NextRequest } from "next/server"

export async function GET(_req: NextRequest) {
  // TODO: replace with real proxy logic
  return new Response(
    JSON.stringify({
      status: "success",
      message: "Mock GET /home response from Next.js route",
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  )
}
