"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Monitor, Users, AlertTriangle, Plus, Edit, Trash2, LogOut, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"

export default function AdminPanel() {
  const [displays, setDisplays] = useState([
    { id: 1, location: "Main Lobby", status: "online", content: "Queue Display" },
    { id: 2, location: "OT Complex", status: "online", content: "Surgery Status" },
    { id: 3, location: "Cardiology Wing", status: "offline", content: "Department Info" },
    { id: 4, location: "Pharmacy", status: "online", content: "Drug Inventory" },
  ])
  const { user, logout } = useAuth()
  const router = useRouter()
  const [emergencyAlert, setEmergencyAlert] = useState({
    type: "",
    location: "",
    description: "",
  })
  const [newAnnouncement, setNewAnnouncement] = useState("")

  const handleEmergencyAlert = () => {
    if (emergencyAlert.type && emergencyAlert.location) {
      alert(`Emergency Alert Sent: ${emergencyAlert.type} at ${emergencyAlert.location}`)
      setEmergencyAlert({ type: "", location: "", description: "" })
    }
  }

  const handleDisplayUpdate = (displayId: number, newContent: string) => {
    setDisplays(displays.map((display) => (display.id === displayId ? { ...display, content: newContent } : display)))
  }

  return (
    <AuthGuard allowedRoles={["admin"]} className="container mx-auto p-6 space-y-6">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="displays" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="displays">Display Management</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Alerts</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="displays" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <span>Display Status (73 Screens)</span>
                </CardTitle>
                <CardDescription>Monitor and control all digital displays across the hospital</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displays.map((display) => (
                    <Card key={display.id} className="border-l-4 border-l-blue-400">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{display.location}</CardTitle>
                            <Badge
                              variant={display.status === "online" ? "default" : "destructive"}
                              className={display.status === "online" ? "bg-green-500" : ""}
                            >
                              {display.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">Current: {display.content}</p>
                        <Select onValueChange={(value) => handleDisplayUpdate(display.id, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Change content" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Queue Display">Queue Display</SelectItem>
                            <SelectItem value="Surgery Status">Surgery Status</SelectItem>
                            <SelectItem value="Department Info">Department Info</SelectItem>
                            <SelectItem value="Drug Inventory">Drug Inventory</SelectItem>
                            <SelectItem value="Emergency Alert">Emergency Alert</SelectItem>
                            <SelectItem value="Health Education">Health Education</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Emergency Alert System</span>
                </CardTitle>
                <CardDescription>Broadcast emergency alerts to all displays instantly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-type">Alert Type</Label>
                    <Select
                      value={emergencyAlert.type}
                      onValueChange={(value) => setEmergencyAlert({ ...emergencyAlert, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select alert type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Code Blue">Code Blue - Cardiac Emergency</SelectItem>
                        <SelectItem value="Code Red">Code Red - Fire Emergency</SelectItem>
                        <SelectItem value="Code Pink">Code Pink - Child Abduction</SelectItem>
                        <SelectItem value="Code Yellow">Code Yellow - Bomb Threat</SelectItem>
                        <SelectItem value="Code Green">Code Green - Emergency Activation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Ward 3A, OT Complex"
                      value={emergencyAlert.location}
                      onChange={(e) => setEmergencyAlert({ ...emergencyAlert, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Additional Details (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional information about the emergency"
                    value={emergencyAlert.description}
                    onChange={(e) => setEmergencyAlert({ ...emergencyAlert, description: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleEmergencyAlert}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!emergencyAlert.type || !emergencyAlert.location}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Broadcast Emergency Alert
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Emergency Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Code Blue - Ward 3A</p>
                      <p className="text-sm text-red-600">2 minutes ago</p>
                    </div>
                    <Badge variant="destructive">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Code Red - OT Complex</p>
                      <p className="text-sm text-gray-600">15 minutes ago</p>
                    </div>
                    <Badge variant="outline">Resolved</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage announcements and educational content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="announcement">New Announcement</Label>
                  <Textarea
                    id="announcement"
                    placeholder="Enter announcement text..."
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                  />
                </div>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Publish Announcement
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Content</CardTitle>
                <CardDescription>Currently displayed content across all screens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Health Education: Hand Hygiene</p>
                      <p className="text-sm text-gray-600">Playing on 25 screens</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Department Staff Directory</p>
                      <p className="text-sm text-gray-600">Playing on 15 screens</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Displays</CardTitle>
                  <Monitor className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">73</div>
                  <p className="text-xs text-muted-foreground">Across all departments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Online Displays</CardTitle>
                  <Monitor className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">71</div>
                  <p className="text-xs text-muted-foreground">97% uptime</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Patients</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">180</div>
                  <p className="text-xs text-muted-foreground">+12 from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emergency Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time monitoring of display network health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Network Connectivity</span>
                    <span className="text-sm text-green-600">99.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Content Sync Rate</span>
                    <span className="text-sm text-green-600">98.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Response Time</span>
                    <span className="text-sm text-blue-600">1.2s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm text-yellow-600">0.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </AuthGuard>
  )
}