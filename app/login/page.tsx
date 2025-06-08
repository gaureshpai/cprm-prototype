"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, Users, Copy } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getUserByUsernameAction } from "@/lib/user-actions" 
import { demoCredentials } from "@/lib/mock-data"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showDemoCredentials, setShowDemoCredentials] = useState(false)

  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role,
      username: "",
      password: "",
    })
    setError("")
  }

  const handleDemoCredentialClick = (role: keyof typeof demoCredentials) => {
    const credentials = demoCredentials[role]
    setFormData({
      username: credentials.username,
      password: credentials.password,
      role: role,
    })
    setError("")

    toast({
      title: "Demo credentials loaded",
      description: `Loaded ${credentials.username} credentials`,
    })
  }

  const validateLogin = async (username: string, password: string) => {
    try {
      
      const isDemoLogin = Object.values(demoCredentials).some(
        cred => cred.username === username && cred.password === password
      )

      if (isDemoLogin) {
        const demoRole = Object.entries(demoCredentials).find(
          ([_, cred]) => cred.username === username && cred.password === password
        )?.[0]

        return {
          success: true,
          user: {
            id: username,
            username: username,
            name: demoCredentials[demoRole as keyof typeof demoCredentials].username,
            email: `${username}@wenlock.hospital`,
            role: demoRole?.toUpperCase(),
            status: "ACTIVE",
            permissions: getDefaultPermissions(demoRole?.toUpperCase() as any),
          }
        }
      }
      
      const result = await getUserByUsernameAction(username)

      if (!result.success || !result.data) {
        return { success: false, error: "User not found" }
      }

      const user = result.data
      
      if (user.status !== "ACTIVE") {
        return { success: false, error: "Account is inactive" }
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          permissions: user.permissions,
        }
      }

    } catch (error) {
      console.error("Login validation error:", error)
      return { success: false, error: "Login validation failed" }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const result = await validateLogin(formData.username, formData.password)

      if (!result.success) {
        throw new Error(result.error || "Invalid credentials")
      }

      const user = result.user!
      
      if (!user.role) {
        throw new Error("User role is not defined")
      }

      const userRole = user.role.toLowerCase() as "admin" | "doctor" | "nurse" | "technician" | "pharmacist" | "patient"

      login({
        id: user.id,
        name: user.username,
        email: user.email || `${user.username}@wenlock.hospital`,
        role: userRole,
        permissions: user.permissions || ["all"],
      })

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      })

      router.push(`/${userRole}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid username or password")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: text,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex gap-8">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Demo Credentials
              </CardTitle>
              <CardDescription>
                Click on any credential to auto-fill the login form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(demoCredentials).map(([role, credentials]) => (
                <div key={role} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize text-gray-900">
                      {credentials.username}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {role.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Username: {credentials.username}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(credentials.username)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Password: {credentials.password}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(credentials.password)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => handleDemoCredentialClick(role as keyof typeof demoCredentials)}
                  >
                    Use These Credentials
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="bg-black p-2 rounded-md">
                <Image
                  src="/logo.png"
                  alt="inunity Logo"
                  width={32}
                  height={32}
                  className="invert"
                />
              </div>

              <div className="flex items-center space-x-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">UDAL</h1>
                  <p className="text-sm text-gray-500">Wenlock Hospital</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600">Sign in to access the hospital management system</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Select your role and enter your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 w-100">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || !formData.username || !formData.password}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>© 2025 inunity • UDAL Fellowship Challenge</p>
                <p className="mt-1">Wenlock Hospital Management System</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getDefaultPermissions(role: string): string[] {
  const permissions = {
    ADMIN: [
      "user_management",
      "display_management",
      "content_management",
      "emergency_alerts",
      "system_settings",
      "analytics",
    ],
    DOCTOR: ["patient_management", "appointments", "prescriptions", "medical_records"],
    NURSE: ["patient_care", "appointments", "medication_administration"],
    TECHNICIAN: ["equipment_management", "maintenance", "technical_support"],
    PHARMACIST: ["drug_inventory", "prescriptions", "medication_dispensing"],
    PATIENT: ["view_appointments", "view_prescriptions", "personal_records"],
  }

  return permissions[role as keyof typeof permissions] || []
}