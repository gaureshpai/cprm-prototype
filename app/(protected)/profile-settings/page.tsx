"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Shield, Palette, Save, Camera } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"

export default function ProfileSettings() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        address: "",
        department: user?.role === "doctor" ? "Cardiology" : user?.role === "nurse" ? "Ward 3" : user?.role || "",
        bio: "",
        experience: "",
        specialization: user?.role === "doctor" ? "Interventional Cardiology" : "",
    })

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false,
        emergencyAlerts: true,
        scheduleReminders: true,
        systemUpdates: false,
    })

    const handleSaveProfile = () => {
        toast({
            title: "Profile updated",
            description: "Your profile information has been saved successfully.",
        })
        setIsEditing(false)
    }

    const handleSaveNotifications = () => {
        toast({
            title: "Notification preferences updated",
            description: "Your notification settings have been saved.",
        })
    }

    return (
        <AuthGuard allowedRoles={["admin","doctor","nurse","technician","patient"]}>
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
                        <p className="text-gray-500">Manage your account settings and preferences</p>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-white">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <span>Personal Information</span>
                                </CardTitle>
                                <CardDescription>Update your personal details and professional information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input
                                            id="department"
                                            type="text"
                                            placeholder="Enter your department"
                                            value={profileData.department}
                                            onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        placeholder="Enter your address"
                                        value={profileData.address}
                                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="experience">Experience</Label>
                                        <Input
                                            id="experience"
                                            type="text"
                                            placeholder="Enter your years of experience"
                                            value={profileData.experience}
                                            onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    {user?.role === "doctor" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="specialization">Specialization</Label>
                                            <Input
                                                id="specialization"
                                                type="text"
                                                placeholder="Enter your specialization"
                                                value={profileData.specialization}
                                                onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about yourself"
                                        className="resize-none"
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        disabled={!isEditing}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Label>Role:</Label>
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 capitalize">{user?.role}</Badge>
                                </div>

                                <div className="flex space-x-2">
                                    {!isEditing ? (
                                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                                    ) : (
                                        <>
                                            <Button onClick={handleSaveProfile}>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </Button>
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Bell className="h-5 w-5 text-blue-600" />
                                    <span>Notification Preferences</span>
                                </CardTitle>
                                <CardDescription>Choose how you want to receive notifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="email-alerts">Email Alerts</Label>
                                            <p className="text-sm text-gray-500">Receive important updates via email</p>
                                        </div>
                                        <Switch
                                            id="email-alerts"
                                            checked={notifications.emailAlerts}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="emergency-alerts">Emergency Alerts</Label>
                                            <p className="text-sm text-gray-500">Immediate notifications for emergencies</p>
                                        </div>
                                        <Switch
                                            id="emergency-alerts"
                                            checked={notifications.emergencyAlerts}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, emergencyAlerts: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="schedule-reminders">Schedule Reminders</Label>
                                            <p className="text-sm text-gray-500">Reminders for appointments and tasks</p>
                                        </div>
                                        <Switch
                                            id="schedule-reminders"
                                            checked={notifications.scheduleReminders}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, scheduleReminders: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="system-updates">System Updates</Label>
                                            <p className="text-sm text-gray-500">Notifications about system maintenance</p>
                                        </div>
                                        <Switch
                                            id="system-updates"
                                            checked={notifications.systemUpdates}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleSaveNotifications}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Notification Preferences
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    <span>Security Settings</span>
                                </CardTitle>
                                <CardDescription>Manage your account security and access</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label>Current Password</Label>
                                        <Input type="password" placeholder="Enter current password" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>New Password</Label>
                                        <Input type="password" placeholder="Enter new password" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Confirm New Password</Label>
                                        <Input type="password" placeholder="Confirm new password" className="mt-1" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Button>Update Password</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthGuard>
    )
}
