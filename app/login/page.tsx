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
import { Eye, EyeOff, Heart, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { demoCredentials } from "@/lib/mock-data"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
    permissions: [] as string[],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role,
      username: demoCredentials[role as keyof typeof demoCredentials]?.username || "",
      password: demoCredentials[role as keyof typeof demoCredentials]?.password || "",
    })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const roleCredentials = demoCredentials[formData.role as keyof typeof demoCredentials]

      if (
        !roleCredentials ||
        formData.username !== roleCredentials.username ||
        formData.password !== roleCredentials.password
      ) {
        throw new Error("Invalid credentials")
      }

      const user = {
        id: formData.username,
        name: `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} User`,
        email: `${formData.username.toLowerCase()}@wenlock.hospital`,
        role: formData.role as "admin" | "doctor" | "nurse" | "technician" | "pharmacist" | "patient",
        permissions: formData.permissions || ["all"],
      }      

      login(user)

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })

      router.push(`/${formData.role}`)
    } catch (err) {
      setError("Invalid username or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
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
            <CardDescription className="text-center">Select your role and enter your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 w-100">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
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
                disabled={isLoading || !formData.role}
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
  )
}
