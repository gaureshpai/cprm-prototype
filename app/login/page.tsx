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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, EyeOff, AlertTriangle, Users, Copy, TestTube, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { validateUserCredentialsAction } from "@/lib/user-actions"

export const demoCredentials = {
  admin: { username: "admin", password: "admin123" },
  doctor: { username: "dr.smith", password: "doctor123" },
  nurse: { username: "nurse.jane", password: "nurse123" },
  technician: { username: "tech.mike", password: "tech123" },
  pharmacist: { username: "pharm.sarah", password: "pharma123" },
}

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    setIsDialogOpen(false)

    toast({
      title: "Demo credentials loaded",
      description: `Loaded ${credentials.username} credentials`,
    })
  }

  const validateLogin = async (username: string, password: string) => {
    try {
      const isDemoLogin = Object.values(demoCredentials).some(
        (cred) => cred.username === username && cred.password === password,
      )

      if (isDemoLogin) {
        const demoRole = Object.entries(demoCredentials).find(
          ([_, cred]) => cred.username === username && cred.password === password,
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
          },
        }
      }
      
      const result = await validateUserCredentialsAction(username, password)

      if (!result.success || !result.data) {
        return { success: false, error: result.error || "Invalid credentials" }
      }

      const user = result.data

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
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

      const userRole = user.role.toLowerCase() as "admin" | "doctor" | "nurse" | "technician" | "pharmacist"

      login({
        id: user.id,
        name: user.username,
        email: user.email || `${user.username}@wenlock.hospital`,
        role: userRole
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-black p-2 rounded-md">
              <Image src="/logo.png" alt="inunity Logo" width={24} height={24} className="invert" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">UDAL - Wenlock Hospital</CardTitle>
          <CardDescription>Sign in to access the hospital management system</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Use Demo Credentials
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Demo Credentials
                  </DialogTitle>
                  <DialogDescription>Click on any credential to auto-fill the login form</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(demoCredentials).map(([role, credentials]) => (
                    <div
                      key={role}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleDemoCredentialClick(role as keyof typeof demoCredentials)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize text-gray-900">{credentials.username}</span>
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
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(credentials.username)
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(credentials.password)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button type="submit" className="w-full" disabled={isLoading || !formData.username || !formData.password}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Quick Demo Access:</p>
              <p>Click "Use Demo Credentials" to see available test accounts</p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>© 2025 inunity • UDAL Fellowship Challenge</p>
            <p className="mt-1">Wenlock Hospital Management System</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}