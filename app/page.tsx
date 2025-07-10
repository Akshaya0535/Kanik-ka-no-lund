"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface User {
  username: string
  password: string
  role: string
}

const users: User[] = [
  { username: "hod1", password: "1234", role: "HOD" },
  { username: "employee1", password: "abcd", role: "Employee" },
  { username: "transport", password: "admin", role: "Transport Head" },
]

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validate inputs
    if (!username || !password || !role) {
      setError("Please fill in all fields and select a role.")
      setLoading(false)
      return
    }

    // Find matching user
    const matchedUser = users.find(
      (user) => user.username === username && user.password === password && user.role === role,
    )

    if (matchedUser) {
      // Store user data in localStorage for compatibility
      localStorage.setItem("username", matchedUser.username)
      localStorage.setItem("role", matchedUser.role)

      // Also create a mock token for API compatibility
      const mockUser = {
        id: matchedUser.username,
        email: `${matchedUser.username}@crri.gov.in`,
        name: matchedUser.username,
        role: matchedUser.role,
        username: matchedUser.username,
      }
      localStorage.setItem("user", JSON.stringify(mockUser))
      localStorage.setItem("token", `mock_token_${Date.now()}`)

      // Simulate loading and redirect
      setTimeout(() => {
        alert("Login successful!")
        router.push("/dashboard")
        setLoading(false)
      }, 500)
    } else {
      setError("Invalid credentials. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <Card className="w-full max-width-[400px] shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-0">
        <CardContent className="p-10">
          <h2 className="text-center text-[#004080] text-2xl font-normal mb-5">CSIR-CRRI Login</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="block mt-2.5 text-[#333] text-base font-normal">
                Username:
              </Label>
              <Input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] text-base"
                style={{ fontFamily: "Arial, sans-serif" }}
              />
            </div>

            <div>
              <Label htmlFor="password" className="block mt-2.5 text-[#333] text-base font-normal">
                Password:
              </Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] text-base"
                style={{ fontFamily: "Arial, sans-serif" }}
              />
            </div>

            <div className="mt-2.5">
              <RadioGroup value={role} onValueChange={setRole} className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HOD" id="hod" />
                  <Label htmlFor="hod" className="text-[#333] text-base font-normal cursor-pointer">
                    HOD
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Transport Head" id="transport" />
                  <Label htmlFor="transport" className="text-[#333] text-base font-normal cursor-pointer">
                    Transport Head
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Employee" id="employee" />
                  <Label htmlFor="employee" className="text-[#333] text-base font-normal cursor-pointer">
                    Employee
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full p-2.5 mt-5 bg-[#0077cc] hover:bg-[#005fa3] text-white border-0 rounded-[5px] text-base cursor-pointer font-normal"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <strong>HOD:</strong> hod1 / 1234
              </div>
              <div>
                <strong>Employee:</strong> employee1 / abcd
              </div>
              <div>
                <strong>Transport Head:</strong> transport / admin
              </div>
            </div>
          </div>

          {/* Quick Access to Vehicle Form */}
          <div className="mt-6 text-center">
            <Link href="/vehicle-indent">
              <Button variant="outline" className="w-full bg-transparent">
                Go to Vehicle Indent Form
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
