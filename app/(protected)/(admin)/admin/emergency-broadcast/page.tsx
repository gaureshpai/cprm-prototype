"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, AirplayIcon as Broadcast, CheckCircle, Clock, X } from "lucide-react"
import { EmergencyBroadcastSystem, EMERGENCY_CODES, type EmergencyAlert } from "@/lib/emergency-alerts"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

export default function EmergencyBroadcastPage() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    codeType: "Code Blue" as keyof typeof EMERGENCY_CODES,
    department: "",
    location: "",
    message: "",
    severity: "critical" as "critical" | "high" | "medium" | "low",
    broadcastTo: ["all"] as string[],
  })

  const emergencySystem = EmergencyBroadcastSystem.getInstance()

  useEffect(() => {
    const handleAlert = (alert: EmergencyAlert) => {
      setAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)])
    }

    emergencySystem.subscribe(handleAlert)
    setAlerts(emergencySystem.getActiveAlerts())

    return () => {
      emergencySystem.unsubscribe(handleAlert)
    }
  }, [])

  const handleCreateAlert = () => {
    if (!newAlert.department || !newAlert.location) return

    const alert = emergencySystem.broadcastAlert({
      codeType: newAlert.codeType,
      department: newAlert.department,
      location: newAlert.location,
      message: newAlert.message || EMERGENCY_CODES[newAlert.codeType].description,
      severity: newAlert.severity,
      status: "active",
      broadcastTo: newAlert.broadcastTo,
    })

    setIsCreateDialogOpen(false)
    setNewAlert({
      codeType: "Code Blue",
      department: "",
      location: "",
      message: "",
      severity: "critical",
      broadcastTo: ["all"],
    })
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    emergencySystem.acknowledgeAlert(alertId)
  }

  const handleResolveAlert = (alertId: string) => {
    emergencySystem.resolveAlert(alertId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-500 text-white"
      case "acknowledged":
        return "bg-yellow-500 text-white"
      case "resolved":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const activeAlerts = alerts.filter((alert) => alert.status === "active")

  return (
    <AuthGuard allowedRoles={["admin"]} className="container mx-auto p-6 space-y-6">
      <Navbar />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Emergency Broadcast System</h1>
          <p className="text-gray-600">Manage hospital-wide emergency alerts and codes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Active Alerts: {activeAlerts.length}
          </Badge>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Broadcast className="h-4 w-4 mr-2" />
            Broadcast Alert
          </Button>
        </div>
      </div>
      {activeAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Active Emergency Alerts:</strong> {activeAlerts.length} alerts are currently active and broadcasting
            to displays.
          </AlertDescription>
        </Alert>
      )}
      {isCreateDialogOpen && (
        <Card className="border-2 border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Broadcast className="h-5 w-5 text-red-600" />
                <span>Create Emergency Alert</span>
              </span>
              <Button variant="ghost" size="sm" onClick={() => setIsCreateDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>This will immediately broadcast to all selected displays</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Emergency Code</Label>
                <Select
                  value={newAlert.codeType}
                  onValueChange={(value) =>
                    setNewAlert({ ...newAlert, codeType: value as keyof typeof EMERGENCY_CODES })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EMERGENCY_CODES).map(([code, details]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${details.color}`}></div>
                          <span>{code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={newAlert.severity}
                  onValueChange={(value) => setNewAlert({ ...newAlert, severity: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={newAlert.department}
                  onChange={(e) => setNewAlert({ ...newAlert, department: e.target.value })}
                  placeholder="e.g., Emergency Ward"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={newAlert.location}
                  onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                  placeholder="e.g., Block A, Floor 2, Room 205"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Message (Optional)</Label>
              <Textarea
                value={newAlert.message}
                onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                placeholder={EMERGENCY_CODES[newAlert.codeType].description}
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleCreateAlert}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={!newAlert.department || !newAlert.location}
              >
                <Broadcast className="h-4 w-4 mr-2" />
                Broadcast Alert
              </Button>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>Emergency Code Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(EMERGENCY_CODES).map(([code, details]) => (
              <div key={code} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-4 h-4 rounded-full ${details.color}`}></div>
                  <span className="font-semibold">{code}</span>
                  <Badge className={getSeverityColor(details.priority)}>{details.priority}</Badge>
                </div>
                <p className="text-sm text-gray-600">{details.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Alert History</span>
            <Badge variant="outline">{alerts.length}</Badge>
          </CardTitle>
          <CardDescription>Recent emergency alerts and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No emergency alerts</h3>
                <p className="text-gray-600">All systems operational. No active emergency alerts.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${EMERGENCY_CODES[alert.codeType].color}`}></div>
                      <span className="font-semibold">{alert.codeType}</span>
                      <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                      <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      <strong>Location:</strong> {alert.department} - {alert.location}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      <strong>Message:</strong> {alert.message}
                    </div>
                    <div className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="flex space-x-2">
                    {alert.status === "active" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert.id)}>
                          Acknowledge
                        </Button>
                        <Button size="sm" onClick={() => handleResolveAlert(alert.id)}>
                          Resolve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AuthGuard>
  )
}
