"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"

export default function ProfileSettings() {
    const { user } = useAuth()
    const { toast } = useToast()

    if (!user) {
        return (
            <AuthGuard allowedRoles={[]} className="container mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                    <p className="text-gray-500">You must be logged in to view this page.</p>
                </div>
            </AuthGuard>
        )
    }

    return (
        <AuthGuard
            allowedRoles={["admin", "doctor", "nurse", "technician", "pharmacist", "patient"]}
            className="container mx-auto p-6 space-y-6"
        >
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="text-gray-500">View your account information</p>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <span>Personal Information</span>
                                </CardTitle>
                                <CardDescription>Your account details (read-only)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                                        <div className="p-3 bg-gray-50 rounded-md border">
                                            <p className="text-sm">{user.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                                        <div className="p-3 bg-gray-50 rounded-md border">
                                            <p className="text-sm">{user.email || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Department</Label>
                                        <div className="p-3 bg-gray-50 rounded-md border">
                                            <p className="text-sm">{user.department || "Not assigned"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">User ID</Label>
                                        <div className="p-3 bg-gray-50 rounded-md border">
                                            <p className="text-xs font-mono text-gray-600">{user.id}</p>
                                        </div>
                                    </div>
                                </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Role</Label>
                                        <div className="p-3 bg-gray-50 rounded-md border">
                                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 capitalize">{user.role}</Badge>
                                        </div>
                                    </div>

                                {user.permissions && user.permissions.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Permissions</Label>
                                        <div className="p-3 bg-gray-50 rounded-md border">
                                            <div className="flex flex-wrap gap-2">
                                                {user.permissions.map((permission, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {permission}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> To update your personal information, please contact your system
                                        administrator.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthGuard>
    )
}