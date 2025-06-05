"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  allowedRoles?: string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  allowedRoles = [],
  fallback,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user!.role)) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-red-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Access Denied</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">You don't have permission to access this page.</p>
              <p className="text-sm text-gray-500">
                Required role: {allowedRoles.join(", ")}
                <br />
                Your role: {user!.role}
              </p>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.some(
      (permission) => user!.permissions.includes(permission) || user!.permissions.includes("all"),
    )

    if (!hasRequiredPermissions) {
      return (
        fallback || (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-red-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2 text-red-600">
                  <Shield className="h-5 w-5" />
                  <span>Insufficient Permissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">You don't have the required permissions to access this page.</p>
                <p className="text-sm text-gray-500">Required permissions: {requiredPermissions.join(", ")}</p>
              </CardContent>
            </Card>
          </div>
        )
      )
    }
  }

  return <>{children}</>
}
