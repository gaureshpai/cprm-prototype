"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Monitor, Settings, Power, Edit, Plus, Users, Activity, AlertTriangle, Pill } from 'lucide-react'
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

interface Display {
  id: string
  location: string
  status: string
  content: string
  uptime: string
  lastUpdate: string
  isActive: boolean
  config?: any
}

const CONTENT_TYPES = [
  { value: "Token Queue", label: "Token Queue", icon: Users, description: "Patient queue and waiting times" },
  { value: "Department Status", label: "Department Status", icon: Activity, description: "Department occupancy and status" },
  { value: "Emergency Alerts", label: "Emergency Alerts", icon: AlertTriangle, description: "Critical alerts and codes" },
  { value: "Drug Inventory", label: "Drug Inventory", icon: Pill, description: "Medication stock levels" },
  { value: "Mixed Dashboard", label: "Mixed Dashboard", icon: Monitor, description: "Combined information display" }
]

export default function DisplayManagement() {
  const [displays, setDisplays] = useState<Display[]>([])
  const [selectedDisplay, setSelectedDisplay] = useState<Display | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form states
  const [editForm, setEditForm] = useState({
    location: '',
    content: '',
    status: '',
    config: {}
  })

  const [createForm, setCreateForm] = useState({
    location: '',
    content: 'Token Queue',
    status: 'offline'
  })

  useEffect(() => {
    fetchDisplays()
    const interval = setInterval(fetchDisplays, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDisplays = async () => {
    try {
      // Mock data for demonstration - replace with actual API call
      const mockDisplays: Display[] = Array.from({ length: 73 }, (_, i) => ({
        id: `display-${i + 1}`,
        location: `${getLocationName(i + 1)}`,
        status: Math.random() > 0.3 ? 'online' : Math.random() > 0.5 ? 'offline' : 'warning',
        content: getRandomContent(),
        uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
        lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        isActive: true,
        config: {}
      }))

      setDisplays(mockDisplays)
    } catch (error) {
      console.error('Error fetching displays:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLocationName = (index: number) => {
    const locations = [
      "Main Lobby", "Emergency Ward", "ICU Wing A", "ICU Wing B", "OT Complex 1", "OT Complex 2",
      "Cardiology Dept", "Neurology Dept", "Pediatrics Ward", "Maternity Ward", "Pharmacy Main",
      "Pharmacy Emergency", "Blood Bank", "Laboratory", "Radiology", "Cafeteria", "Admin Office",
      "Reception Desk", "Waiting Area A", "Waiting Area B", "Corridor 1A", "Corridor 1B",
      "Corridor 2A", "Corridor 2B", "Elevator Bank 1", "Elevator Bank 2", "Parking Entrance"
    ]

    if (index <= locations.length) {
      return locations[index - 1]
    }
    return `Ward ${Math.ceil((index - locations.length) / 4)} - Room ${((index - locations.length - 1) % 4) + 1}`
  }

  const getRandomContent = () => {
    const contents = ["Token Queue", "Department Status", "Emergency Alerts", "Drug Inventory", "Mixed Dashboard"]
    return contents[Math.floor(Math.random() * contents.length)]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'offline': return 'Offline'
      case 'warning': return 'Warning'
      default: return 'Unknown'
    }
  }

  const handleEditDisplay = (display: Display) => {
    setSelectedDisplay(display)
    setEditForm({
      location: display.location,
      content: display.content,
      status: display.status,
      config: display.config || {}
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateDisplay = async () => {
    if (!selectedDisplay) return

    try {
      // Mock update - replace with actual API call
      const updatedDisplays = displays.map(d =>
        d.id === selectedDisplay.id
          ? { ...d, ...editForm, lastUpdate: new Date().toISOString() }
          : d
      )
      setDisplays(updatedDisplays)
      setIsEditDialogOpen(false)
      setSelectedDisplay(null)
    } catch (error) {
      console.error('Error updating display:', error)
    }
  }

  const handleCreateDisplay = async () => {
    try {
      // Mock create - replace with actual API call
      const newDisplay: Display = {
        id: `display-${displays.length + 1}`,
        ...createForm,
        uptime: '0m',
        lastUpdate: new Date().toISOString(),
        isActive: true,
        config: {}
      }
      setDisplays([...displays, newDisplay])
      setIsCreateDialogOpen(false)
      setCreateForm({ location: '', content: 'Token Queue', status: 'offline' })
    } catch (error) {
      console.error('Error creating display:', error)
    }
  }

  const handleRestartDisplay = async (displayId: string) => {
    try {
      // Mock restart - replace with actual API call
      const updatedDisplays = displays.map(d =>
        d.id === displayId
          ? { ...d, status: 'online', uptime: '0m', lastUpdate: new Date().toISOString() }
          : d
      )
      setDisplays(updatedDisplays)
    } catch (error) {
      console.error('Error restarting display:', error)
    }
  }

  const onlineDisplays = displays.filter(d => d.status === 'online').length
  const offlineDisplays = displays.filter(d => d.status === 'offline').length
  const warningDisplays = displays.filter(d => d.status === 'warning').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthGuard allowedRoles={["admin"]} className="p-6 space-y-6">
      <Navbar />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Display Management</h1>
          <p className="text-gray-600">Manage all 73 hospital display screens</p>
        </div>
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-location">Location</Label>
                <Input
                  id="create-location"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  placeholder="Enter display location"
                />
              </div>
              <div>
                <Label htmlFor="create-content">Content Type</Label>
                <Select value={createForm.content} onValueChange={(value) => setCreateForm({ ...createForm, content: value })}>
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
              <div>
                <Label htmlFor="create-status">Initial Status</Label>
                <Select value={createForm.status} onValueChange={(value) => setCreateForm({ ...createForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDisplay}>
                  Create Display
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
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

      {/* Displays Grid */}
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
                <p className="text-sm text-gray-600">
                  {new Date(display.lastUpdate).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditDisplay(display)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRestartDisplay(display.id)}
                  className="flex-1"
                >
                  <Power className="h-4 w-4 mr-1" />
                  Restart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Display: {selectedDisplay?.location}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content Type</Label>
              <Select value={editForm.content} onValueChange={(value) => setEditForm({ ...editForm, content: value })}>
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
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateDisplay}>
                Update Display
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  )
}