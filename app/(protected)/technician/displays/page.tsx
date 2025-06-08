"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Monitor, Power, Edit, Plus, Users, Activity, AlertTriangle, Pill, Trash2, RefreshCw } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  getAllDisplaysAction,
  createDisplayAction,
  updateDisplayAction,
  deleteDisplayAction,
  restartDisplayAction,
  seedDisplaysAction,
  type DisplayData,
} from "@/lib/display-actions"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

const CONTENT_TYPES = [
  { value: "Token Queue", label: "Token Queue", icon: Users, description: "Patient queue and waiting times" },
  { value: "Department Status", label: "Department Status", icon: Activity, description: "Department occupancy and status" },
  { value: "Emergency Alerts", label: "Emergency Alerts", icon: AlertTriangle, description: "Critical alerts and codes" },
  { value: "Drug Inventory", label: "Drug Inventory", icon: Pill, description: "Medication stock levels" },
  { value: "Mixed Dashboard", label: "Mixed Dashboard", icon: Monitor, description: "Combined information display" },
]

export default function DisplayManagement() {
  const [displays, setDisplays] = useState<DisplayData[]>([])
  const [selectedDisplay, setSelectedDisplay] = useState<DisplayData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const [editForm, setEditForm] = useState({
    location: "",
    content: "",
    status: "",
  })

  const [createForm, setCreateForm] = useState({
    location: "",
    content: "Token Queue",
    status: "offline",
  })

  useEffect(() => {
    fetchDisplays()
    const interval = setInterval(() => {
      fetchDisplays(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchDisplays = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)

      startTransition(async () => {
        const result = await getAllDisplaysAction()

        if (result.success && result.data) {
          setDisplays(result.data)
          setLastUpdate(new Date())
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to fetch displays",
            variant: "destructive",
          })
        }
      })
    } catch (error) {
      console.error("Error fetching displays:", error)
      toast({
        title: "Error",
        description: "Failed to fetch displays",
        variant: "destructive",
      })
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online"
      case "offline":
        return "Offline"
      case "warning":
        return "Warning"
      default:
        return "Unknown"
    }
  }

  const handleEditDisplay = (display: DisplayData) => {
    setSelectedDisplay(display)
    setEditForm({
      location: display.location,
      content: display.content,
      status: display.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateDisplay = async (formData: FormData) => {
    if (!selectedDisplay) return

    startTransition(async () => {
      const result = await updateDisplayAction(selectedDisplay.id, formData)

      if (result.success && result.data) {
        setDisplays(displays.map((d) => (d.id === selectedDisplay.id ? result.data! : d)))
        setIsEditDialogOpen(false)
        setSelectedDisplay(null)
        toast({
          title: "Success",
          description: "Display updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update display",
          variant: "destructive",
        })
      }
    })
  }

  const handleCreateDisplay = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createDisplayAction(formData)

      if (result.success && result.data) {
        setDisplays([...displays, result.data])
        setIsCreateDialogOpen(false)
        setCreateForm({ location: "", content: "Token Queue", status: "offline" })
        toast({
          title: "Success",
          description: "Display created successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create display",
          variant: "destructive",
        })
      }
    })
  }

  const handleDeleteDisplay = async (displayId: string) => {
    if (!confirm("Are you sure you want to delete this display?")) return

    startTransition(async () => {
      const result = await deleteDisplayAction(displayId)

      if (result.success) {
        setDisplays(displays.filter((d) => d.id !== displayId))
        toast({
          title: "Success",
          description: "Display deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete display",
          variant: "destructive",
        })
      }
    })
  }

  const handleSeedDisplays = async () => {
    if (!confirm("This will create 73 sample displays. Continue?")) return

    startTransition(async () => {
      const result = await seedDisplaysAction()

      if (result.success) {
        await fetchDisplays()
        toast({
          title: "Success",
          description: "Successfully seeded 73 displays",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to seed displays",
          variant: "destructive",
        })
      }
    })
  }

  const onlineDisplays = displays.filter((d) => d.status === "online").length
  const offlineDisplays = displays.filter((d) => d.status === "offline").length
  const warningDisplays = displays.filter((d) => d.status === "warning").length

  return (
    <AuthGuard allowedRoles={["admin"]} className="p-6 space-y-6">
      <Navbar />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Display Management</h1>
          <p className="text-gray-600">
            Manage all {displays.length} hospital display screens
            {isPending && <span className="ml-2 text-blue-600">• Updating...</span>}
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh every 5 seconds
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fetchDisplays()} disabled={isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {displays.length === 0 && (
            <Button variant="outline" onClick={handleSeedDisplays} disabled={isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Seed Data
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Display
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Display</DialogTitle>
              </DialogHeader>
              <form action={handleCreateDisplay} className="space-y-4">
                <div>
                  <Label htmlFor="create-location">Location</Label>
                  <Input
                    id="create-location"
                    name="location"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    placeholder="Enter display location"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-content">Content Type</Label>
                  <Select
                    name="content"
                    value={createForm.content}
                    onValueChange={(value) => setCreateForm({ ...createForm, content: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Display"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Displays</p>
                <p className="text-3xl font-bold">{displays.length}</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-3xl font-bold text-green-600">{onlineDisplays}</p>
              </div>
              <div className="h-8 w-8 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offline</p>
                <p className="text-3xl font-bold text-red-600">{offlineDisplays}</p>
              </div>
              <div className="h-8 w-8 bg-red-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warning</p>
                <p className="text-3xl font-bold text-yellow-600">{warningDisplays}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displays.map((display) => (
          <Card key={display.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{display.location}</CardTitle>
                <Badge className={`${getStatusColor(display.status)} text-white`}>
                  {getStatusText(display.status)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">ID: {display.id}</p>
              <Link href={`/display/${display.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                View display
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Content Type</p>
                <p className="text-sm text-gray-600">{display.content}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-sm text-gray-600">{display.uptime}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Update</p>
                <p className="text-sm text-gray-600">{new Date(display.lastUpdate).toLocaleString()}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEditDisplay(display)} className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteDisplay(display.id)}
                  className="text-red-600 hover:text-red-700"
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Display: {selectedDisplay?.location}</DialogTitle>
          </DialogHeader>
          <form action={handleUpdateDisplay} className="space-y-4">
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                name="location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content Type</Label>
              <Select name="content" value={editForm.content} onValueChange={(value) => setEditForm({ ...editForm, content: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Display"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  )
}