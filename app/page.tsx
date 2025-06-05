"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleGoBack = () => {
    if (user) {
      router.push(`/${user.role}`)
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">Access Denied</CardTitle>
          <CardDescription>You don't have permission to access this page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This page is restricted to specific user roles. Please contact your administrator if you believe this is an
            error.
          </p>
          <div className="space-y-2">
            <Button onClick={handleGoBack} className="w-full">
              Go Back to Dashboard
            </Button>
            <Button variant="outline" onClick={logout} className="w-full">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
