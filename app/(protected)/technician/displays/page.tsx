"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Monitor, Edit, Plus, Users, Activity, Pill, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getAllDisplaysAction,
  updateDisplayAction,
  seedDisplaysAction,
} from "@/lib/display-actions"
import type { DisplayData } from "@/lib/display-service"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { getStatusColor, getStatusText } from "@/lib/functions"
import { getAllDepartmentsAction, type DepartmentData } from "@/lib/department-actions"

const CONTENT_TYPES = [
  { value: "Token Queue", label: "Token Queue", icon: Users, description: "Patient queue and waiting times" },
  {
    value: "Department Status",
    label: "Department Status",
    icon: Activity,
    description: "Department occupancy and status",
  },
  { value: "Drug Inventory", label: "Drug Inventory", icon: Pill, description: "Medication stock levels" },
  { value: "Mixed Dashboard", label: "Mixed Dashboard", icon: Monitor, description: "Combined information display" },
  {
    value: "Patient Dashboard",
    label: "Patient Dashboard",
    icon: Monitor,
    description: "Combined information display for patients",
  },
  {
    value: "Staff Dashboard",
    label: "Staff Dashboard",
    icon: Monitor,
    description: "Combined information display for Staffs",
  },
  { value: "OT Status", label: "OT Status", icon: Monitor, description: "OT status and scheduling" },
  { value: "Blood Bank", label: "Blood Bank", icon: Monitor, description: "Blood bank inventory" },
  {
    value: "Department Token Queue",
    label: "Department Token Queue",
    icon: Users,
    description: "Department-specific token queue (top 4 only)",
  },
]

const STATUS_OPTIONS = [{ value: "offline", label: "Offline" }]

export default function DisplayManagement() {
  const [displays, setDisplays] = useState<DisplayData[]>([])
  const [departments, setDepartments] = useState<DepartmentData[]>([])
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
    status: "offline",
    departmentId: "",
  })

  const [createForm, setCreateForm] = useState({
    location: "",
    content: "Token Queue",
    status: "offline",
    departmentId: "",
  })

  useEffect(() => {
    fetchDisplays()
    loadDepartments()
    const interval = setInterval(() => {
      fetchDisplays(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadDepartments = async () => {
    try {
      const result = await getAllDepartmentsAction()
      if (result.success && result.data) {
        setDepartments(result.data.filter((dept) => dept.status === "Active"))
      }
    } catch (error) {
      console.error("Error loading departments:", error)
    }
  }

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

  const handleEditDisplay = (display: DisplayData) => {
    setSelectedDisplay(display)
    setEditForm({
      location: display.location,
      content: display.content,
      status: display.status,
      departmentId: display.config?.departmentId || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateDisplay = async (formData: FormData) => {
    if (!selectedDisplay) return
    
    if (editForm.content === "Department Token Queue" && editForm.departmentId) {
      formData.set("config", JSON.stringify({ departmentId: editForm.departmentId }))
    }

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

  const isDepartmentSpecific = (contentType: string) => contentType === "Department Token Queue"

  return (
    <AuthGuard allowedRoles={["technician","admin"]} className="p-6 space-y-6">
      <Navbar />
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
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

        <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0">
          <Button variant="outline" onClick={() => fetchDisplays()} disabled={isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {displays.length === 0 && (
            <Button variant="outline" onClick={handleSeedDisplays} disabled={isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Seed Data
            </Button>
          )}
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
              <Link
                href={`/display/${display.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View display
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Content Type</p>
                <p className="text-sm text-gray-600">{display.content}</p>
                {display.config?.departmentId && (
                  <p className="text-xs text-blue-600">
                    Department:{" "}
                    {departments.find((d) => d.id === display.config.departmentId)?.name || display.config.departmentId}
                  </p>
                )}
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xs md:max-w-2xl">
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
              <Select
                name="content"
                value={editForm.content}
                onValueChange={(value) => setEditForm({ ...editForm, content: value })}
              >
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
            {isDepartmentSpecific(editForm.content) && (
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Select
                  value={editForm.departmentId}
                  onValueChange={(value) => setEditForm({ ...editForm, departmentId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                name="status"
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
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