"use client"

import type React from "react"
import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Monitor, Users, AlertTriangle, Plus, Trash2, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"
import { getAllDisplaysAction } from "@/lib/display-actions"
import type { DisplayData } from "@/lib/helpers"
import {
  getAllContentAction,
  getAllAnnouncementsAction,
  createAnnouncementAction,
  deleteAnnouncementAction,
  resolveAnnouncementAction, 
  createEmergencyAlertAction,
  getRecentEmergencyAlertsAction,
  resolveEmergencyAlertAction,
  getSystemAnalyticsAction,
  type ContentItem,
  type Announcement,
  type EmergencyAlert,
} from "@/lib/content-actions"
import { useToast } from "@/hooks/use-toast"

export default function AdminPanel() {
  const [displays, setDisplays] = useState<DisplayData[]>([])
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [announcementsLoading, setAnnouncementsLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(true)
  const [emergencyAlertsLoading, setEmergencyAlertsLoading] = useState(true)

  const [isPending, startTransition] = useTransition()
  const { user } = useAuth()
  const { toast } = useToast()

  const [emergencyAlert, setEmergencyAlert] = useState({
    type: "",
    location: "",
    description: "",
  })
  const [newAnnouncement, setNewAnnouncement] = useState("")
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false)

  useEffect(() => {
    fetchInitialData()

    const interval = setInterval(() => {
      fetchRealTimeData()
    }, 100000)

    return () => clearInterval(interval)
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)

      startTransition(async () => {
        const displaysResult = await getAllDisplaysAction()
        if (displaysResult.success && displaysResult.data) {
          setDisplays(displaysResult.data)
        }

        setContentLoading(true)
        const contentResult = await getAllContentAction()
        if (contentResult.success && contentResult.data) {
          setContentItems(contentResult.data)
        }
        setContentLoading(false)

        setAnnouncementsLoading(true)
        const announcementsResult = await getAllAnnouncementsAction()
        if (announcementsResult.success && announcementsResult.data) {
          setAnnouncements(announcementsResult.data)
        }
        setAnnouncementsLoading(false)

        setEmergencyAlertsLoading(true)
        const alertsResult = await getRecentEmergencyAlertsAction()
        if (alertsResult.success && alertsResult.data) {
          setEmergencyAlerts(alertsResult.data)
        }
        setEmergencyAlertsLoading(false)

        const analyticsResult = await getSystemAnalyticsAction()
        if (analyticsResult.success && analyticsResult.data) {
          setAnalytics(analyticsResult.data)
        }
      })
    } catch (error) {
      console.error("Error fetching initial data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRealTimeData = async () => {
    try {
      startTransition(async () => {
        const alertsResult = await getRecentEmergencyAlertsAction()
        if (alertsResult.success && alertsResult.data) {
          setEmergencyAlerts(alertsResult.data)
        }

        const analyticsResult = await getSystemAnalyticsAction()
        if (analyticsResult.success && analyticsResult.data) {
          setAnalytics(analyticsResult.data)
        }

        const displaysResult = await getAllDisplaysAction()
        if (displaysResult.success && displaysResult.data) {
          setDisplays(displaysResult.data)
        }
      })
    } catch (error) {
      console.error("Error fetching real-time data:", error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true)
      const announcementsResult = await getAllAnnouncementsAction()
      if (announcementsResult.success && announcementsResult.data) {
        setAnnouncements(announcementsResult.data)
      }
    } catch (error) {
      console.error("Error fetching announcements:", error)
    } finally {
      setAnnouncementsLoading(false)
    }
  }

  const handleEmergencyAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!emergencyAlert.type || !emergencyAlert.location) {
      toast({
        title: "Error",
        description: "Alert type and location are required",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("type", emergencyAlert.type)
      formData.append("location", emergencyAlert.location)
      formData.append("description", emergencyAlert.description)

      const result = await createEmergencyAlertAction(formData)

      if (result.success) {
        toast({
          title: "Emergency Alert Sent",
          description: `${emergencyAlert.type} alert at ${emergencyAlert.location}`,
          variant: "default",
        })
        setEmergencyAlert({ type: "", location: "", description: "" })

        fetchRealTimeData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send emergency alert",
          variant: "destructive",
        })
      }
    })
  }

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!newAnnouncement.trim()) {
      toast({
        title: "Error",
        description: "Announcement text is required",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("text", newAnnouncement)
      formData.append("createdBy", user?.name || "admin")

      const result = await createAnnouncementAction(formData)

      if (result.success) {
        toast({
          title: "Announcement Published",
          description: "Your announcement has been published successfully",
          variant: "default",
        })
        setNewAnnouncement("")
        setIsAnnouncementDialogOpen(false)

        fetchAnnouncements()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to publish announcement",
          variant: "destructive",
        })
      }
    })
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return

    startTransition(async () => {
      const result = await deleteAnnouncementAction(id)

      if (result.success) {
        toast({
          title: "Announcement Deleted",
          description: "The announcement has been removed",
          variant: "default",
        })

        fetchAnnouncements()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete announcement",
          variant: "destructive",
        })
      }
    })
  }

  const handleResolveAnnouncement = async (id: string) => {
    startTransition(async () => {
      const result = await resolveAnnouncementAction(id)

      if (result.success) {
        toast({
          title: "Announcement Resolved",
          description: "The announcement has been marked as resolved",
          variant: "default",
        })

        fetchAnnouncements()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resolve announcement",
          variant: "destructive",
        })
      }
    })
  }

  const handleResolveAlert = async (id: string) => {
    startTransition(async () => {
      const result = await resolveEmergencyAlertAction(id)

      if (result.success) {
        toast({
          title: "Alert Resolved",
          description: "The emergency alert has been marked as resolved",
          variant: "default",
        })

        fetchRealTimeData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resolve alert",
          variant: "destructive",
        })
      }
    })
  }

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  )

  return (
    <AuthGuard allowedRoles={["admin"]} className="container mx-auto p-6 space-y-6">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage announcements and educational content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Announcement</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="announcement">Announcement Text</Label>
                        <Textarea
                          id="announcement"
                          placeholder="Enter announcement text..."
                          value={newAnnouncement}
                          onChange={(e) => setNewAnnouncement(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              return false
                            }
                          }}
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            setIsAnnouncementDialogOpen(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isPending || !newAnnouncement.trim()}
                          onClick={(e) => {
                            handlePublishAnnouncement(e)
                          }}
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            "Publish Announcement"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Announcements</CardTitle>
                <CardDescription>Currently published announcements</CardDescription>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-3">
                    {announcements.length > 0 ? (
                      announcements.map((announcement) => (
                        <div
                          key={announcement.id}
                          className={`flex justify-between items-start p-4 rounded-lg border transition-colors hover:bg-gray-50`}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{announcement.text}</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              Created by {announcement.createdBy} on{" "}
                              {new Date(announcement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {!announcement.resolved ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResolveAnnouncement(announcement.id)}
                                  className="border-green-600 text-green-600 hover:bg-green-50"
                                >
                                Resolve <CheckCircle className="h-2 w-2" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                disabled={isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">No active announcements</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Content Types</CardTitle>
                <CardDescription>Currently displayed content across all screens</CardDescription>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-3">
                    {contentItems.length > 0 ? (
                      contentItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-600">Active on {item.activeScreens} screens</p>
                          </div>
                          <Badge variant="outline">{item.type}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">No active content found</p>
                    )}
                  </div>
                )}
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
                  <div className="text-2xl font-bold">{analytics?.displays?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all departments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Online Displays</CardTitle>
                  <Monitor className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.displays?.online || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Patients</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.patients?.daily || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.patients?.change > 0 ? "+" : ""}
                    {analytics?.patients?.change || 0} from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emergency Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.alerts?.weekly || 0}</div>
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
                    <span className="text-sm text-green-600">{analytics?.performance?.networkConnectivity || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Content Sync Rate</span>
                    <span className="text-sm text-green-600">{analytics?.performance?.contentSyncRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Response Time</span>
                    <span className="text-sm text-blue-600">{analytics?.performance?.responseTime || 0}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm text-yellow-600">{analytics?.performance?.errorRate || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center text-red-700">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Emergency Alert System
                </CardTitle>
                <CardDescription>Send critical alerts to all hospital displays immediately</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <form onSubmit={handleEmergencyAlert} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-type">Alert Type</Label>
                    <Select
                      value={emergencyAlert.type}
                      onValueChange={(value) => setEmergencyAlert({ ...emergencyAlert, type: value })}
                      required
                    >
                      <SelectTrigger id="alert-type">
                        <SelectValue placeholder="Select alert type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Code Blue">Code Blue (Medical Emergency)</SelectItem>
                        <SelectItem value="Code Red">Code Red (Fire)</SelectItem>
                        <SelectItem value="Code Black">Code Black (Bomb Threat)</SelectItem>
                        <SelectItem value="Code Orange">Code Orange (External Disaster)</SelectItem>
                        <SelectItem value="Code Silver">Code Silver (Active Shooter)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alert-location">Location</Label>
                    <Input
                      id="alert-location"
                      placeholder="Enter location"
                      value={emergencyAlert.location}
                      onChange={(e) => setEmergencyAlert({ ...emergencyAlert, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alert-description">Additional Details (Optional)</Label>
                    <Textarea
                      id="alert-description"
                      placeholder="Enter additional details..."
                      value={emergencyAlert.description}
                      onChange={(e) => setEmergencyAlert({ ...emergencyAlert, description: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          return false
                        }
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isPending || !emergencyAlert.type || !emergencyAlert.location}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Alert...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Send Emergency Alert
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-sm text-gray-500 text-center">
                  This will immediately broadcast the alert to all hospital displays and notify relevant staff.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Emergency Alerts</CardTitle>
                <CardDescription>History of emergency alerts sent in the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {emergencyAlertsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-3">
                    {emergencyAlerts.length > 0 ? (
                      emergencyAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`flex justify-between items-center p-3 rounded-lg ${alert.active ? "bg-red-50 border border-red-200" : "bg-gray-50"
                            }`}
                        >
                          <div>
                            <div className="flex items-center">
                              <Badge
                                className={`mr-2 ${alert.codeType === "Code Blue"
                                    ? "bg-blue-600"
                                    : alert.codeType === "Code Red"
                                      ? "bg-red-600"
                                      : alert.codeType === "Code Black"
                                        ? "bg-black"
                                        : alert.codeType === "Code Orange"
                                          ? "bg-orange-600"
                                          : "bg-gray-600"
                                  }`}
                              >
                                {alert.codeType}
                              </Badge>
                              <p className="font-medium">{alert.location}</p>
                            </div>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                            <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {alert.active ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolveAlert(alert.id)}
                                disabled={isPending}
                                className="border-green-600 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            ) : (
                              <Badge variant="outline" className="border-green-600 text-green-600">
                                Resolved
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">No emergency alerts found</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </AuthGuard>
  )
}