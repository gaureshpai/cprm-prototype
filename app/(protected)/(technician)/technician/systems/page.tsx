"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Server, Wifi, Database, Activity, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

interface SystemAlert {
  id: string
  type: string
  message: string
  severity: string
  time: string
  resolved: boolean
}

interface SystemStats {
  totalDisplays: number
  onlineDisplays: number
  offlineDisplays: number
  maintenanceDisplays: number
  networkUptime: string
  avgResponseTime: string
  dataTransferred: string
  errorRate: string
}

export default function SystemsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSystemData()
    const interval = setInterval(fetchSystemData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemData = async () => {
    try {
      const [alertsResponse, statsResponse] = await Promise.all([
        fetch("/api/system/alerts"),
        fetch("/api/system/stats"),
      ])

      const alertsData = await alertsResponse.json()
      const statsData = await statsResponse.json()

      setAlerts(alertsData)
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching system data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolveAlert = async (id: string) => {
    try {
      await fetch(`/api/system/alerts/${id}/resolve`, { method: "POST" })
      fetchSystemData()
    } catch (error) {
      console.error("Error resolving alert:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      case "info":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return <XCircle className="h-4 w-4" />
      case "medium":
        return <AlertTriangle className="h-4 w-4" />
      case "low":
        return <Activity className="h-4 w-4" />
      case "info":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard allowedRoles={["technician"]} className="container mx-auto p-6 space-y-6">
      <Navbar />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-600">Monitor system health and performance</p>
        </div>
        <Button onClick={fetchSystemData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Uptime</CardTitle>
              <Wifi className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.networkUptime}</div>
              <Progress value={Number.parseFloat(stats.networkUptime)} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Displays</CardTitle>
              <Server className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.onlineDisplays}/{stats.totalDisplays}
              </div>
              <Progress value={(stats.onlineDisplays / stats.totalDisplays) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
              <p className="text-xs text-gray-600 mt-1">Average response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
              <Database className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dataTransferred}</div>
              <p className="text-xs text-gray-600 mt-1">Today's usage</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>System Alerts</span>
            <Badge variant="outline">{alerts.filter((a) => !a.resolved).length} Active</Badge>
          </CardTitle>
          <CardDescription>Monitor and resolve system alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All systems operational</h3>
                <p className="text-gray-600">No active alerts at this time.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <Alert key={alert.id} className={alert.resolved ? "opacity-60" : ""}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${getSeverityColor(alert.severity)} text-white`}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                          <Badge className={`${getSeverityColor(alert.severity)} text-white text-xs`}>
                            {alert.severity}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-green-600 text-xs">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <AlertDescription className="text-sm">{alert.message}</AlertDescription>
                        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AuthGuard>
  )
}
