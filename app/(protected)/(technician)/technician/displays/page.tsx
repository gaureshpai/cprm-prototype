"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor, Power, RotateCcw, Search, Filter } from "lucide-react"

interface Display {
  id: string
  location: string
  status: string
  content: string
  uptime: string
  lastUpdate: string
}

export default function DisplaysPage() {
  const [displays, setDisplays] = useState<Display[]>([])
  const [filteredDisplays, setFilteredDisplays] = useState<Display[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDisplays()
  }, [])

  useEffect(() => {
    filterDisplays()
  }, [displays, searchTerm, statusFilter])

  const fetchDisplays = async () => {
    try {
      const response = await fetch("/api/displays")
      const data = await response.json()
      setDisplays(data)
    } catch (error) {
      console.error("Error fetching displays:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterDisplays = () => {
    let filtered = displays

    if (searchTerm) {
      filtered = filtered.filter(
        (display) =>
          display.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          display.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((display) => display.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredDisplays(filtered)
  }

  const handleRestartDisplay = async (id: string) => {
    try {
      await fetch(`/api/displays/${id}/restart`, { method: "POST" })
      fetchDisplays()
    } catch (error) {
      console.error("Error restarting display:", error)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/displays/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchDisplays()
    } catch (error) {
      console.error("Error updating display status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Display Management</h1>
          <p className="text-gray-600">Monitor and control all hospital displays</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Total: {displays.length}
          </Badge>
          <Badge className="bg-green-500 text-sm">Online: {displays.filter((d) => d.status === "Online").length}</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search displays by location or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDisplays.map((display) => (
          <Card key={display.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{display.location}</CardTitle>
                </div>
                <Badge className={`${getStatusColor(display.status)} text-white`}>{display.status}</Badge>
              </div>
              <CardDescription>{display.content}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Uptime:</span>
                  <div className="text-green-600">{display.uptime}</div>
                </div>
                <div>
                  <span className="font-medium">Last Update:</span>
                  <div className="text-gray-600">{display.lastUpdate}</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleRestartDisplay(display.id)} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restart
                </Button>
                <Button
                  size="sm"
                  variant={display.status === "Online" ? "destructive" : "default"}
                  onClick={() => handleUpdateStatus(display.id, display.status === "Online" ? "Offline" : "Online")}
                  className="flex-1"
                >
                  <Power className="h-4 w-4 mr-1" />
                  {display.status === "Online" ? "Turn Off" : "Turn On"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDisplays.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No displays found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}
