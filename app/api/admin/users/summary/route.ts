import type { NextRequest } from "next/server"
import { authenticateAdmin, createApiResponse, createErrorResponse } from "@/lib/auth-utils"
import { mockUsers } from "@/lib/mock-database"

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const adminUser = await authenticateAdmin(request)
    if (!adminUser) {
      return createErrorResponse("Unauthorized: Admin access required", 401)
    }

    // Calculate user statistics
    const total = mockUsers.length
    const byRole = mockUsers.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const byStatus = mockUsers.reduce(
      (acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Calculate recent signups (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentSignups = mockUsers.filter((user) => {
      const createdAt = new Date(user.createdAt)
      return createdAt > sevenDaysAgo
    }).length

    // Calculate active today (logged in today)
    const today = new Date().toDateString()
    const activeToday = mockUsers.filter((user) => {
      const lastLogin = new Date(user.lastLoginAt)
      return lastLogin.toDateString() === today
    }).length

    // Calculate email verification stats
    const emailVerified = mockUsers.filter((user) => user.emailVerified).length
    const emailUnverified = total - emailVerified

    return createApiResponse({
      total,
      byRole,
      byStatus,
      recentSignups,
      activeToday,
      emailStats: {
        verified: emailVerified,
        unverified: emailUnverified,
        verificationRate: Math.round((emailVerified / total) * 100),
      },
      growth: {
        thisWeek: recentSignups,
        lastWeek: Math.floor(Math.random() * 5) + 1, // Mock data
        growthRate: Math.round(((recentSignups - 2) / 2) * 100), // Mock calculation
      },
    })
  } catch (error) {
    console.error("Users summary API error:", error)
    return createErrorResponse("Internal server error", 500)
  }
}
