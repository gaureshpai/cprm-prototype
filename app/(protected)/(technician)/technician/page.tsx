"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Monitor, Wifi, AlertTriangle, CheckCircle, RefreshCw, Settings, Activity, Zap } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { mockTechnicianData as mockData } from "@/lib/mock-data"
import { getAlertSeverityColor, getStatusColor } from "@/lib/functions"

export default function TechnicianDashboard() {
  const [currentDate] = useState(new Date())

  const getUptimeColor = (uptime: string) => {
    const percentage = Number.parseFloat(uptime.replace("%", ""))
    if (percentage >= 99) return "text-green-600"
    if (percentage >= 95) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <AuthGuard allowedRoles={["technician"]} className="container mx-auto p-6 space-y-6">
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Technician Dashboard</h1>
              <p className="text-gray-500">
                {currentDate.toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh All Displays
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Displays</CardTitle>
                <Monitor className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.networkStats.totalDisplays}</div>
                <p className="text-xs text-muted-foreground">Across all departments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockData.networkStats.onlineDisplays}</div>
                <p className="text-xs text-muted-foreground">
                  {((mockData.networkStats.onlineDisplays / mockData.networkStats.totalDisplays) * 100).toFixed(1)}%
                  uptime
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{mockData.networkStats.offlineDisplays}</div>
                <p className="text-xs text-muted-foreground">
                  {mockData.networkStats.maintenanceDisplays} in maintenance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Health</CardTitle>
                <Wifi className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockData.networkStats.networkUptime}</div>
                <p className="text-xs text-muted-foreground">Avg response: {mockData.networkStats.avgResponseTime}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="displays" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white">
              <TabsTrigger value="displays">Display Status</TabsTrigger>
              <TabsTrigger value="alerts">System Alerts</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="displays" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-blue-600" />
                    <span>Display Network Status</span>
                  </CardTitle>
                  <CardDescription>Real-time status of all 73 displays across the hospital</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockData.displays.map((display) => (
                      <Card key={display.id} className="border-l-4 border-l-blue-400">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{display.location}</CardTitle>
                              <p className="text-sm text-gray-600">Display #{display.id}</p>
                            </div>
                            <Badge className={getStatusColor(display.status)}>{display.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Content:</span>
                            <span className="text-gray-600">{display.content}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Uptime:</span>
                            <span className={getUptimeColor(display.uptime)}>{display.uptime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Last Update:</span>
                            <span className="text-gray-600">{display.lastUpdate}</span>
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Settings className="h-3 w-3 mr-1" />
                              Configure
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Restart
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    <span>System Alerts</span>
                  </CardTitle>
                  <CardDescription>Recent system events and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.systemAlerts.map((alert) => (
                      <div key={alert.id} className={`p-4 border rounded-lg ${getAlertSeverityColor(alert.severity)}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {alert.type}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${alert.severity === "high"
                                    ? "border-red-500 text-red-700"
                                    : alert.severity === "medium"
                                      ? "border-yellow-500 text-yellow-700"
                                      : alert.severity === "low"
                                        ? "border-blue-500 text-blue-700"
                                        : "border-green-500 text-green-700"
                                  }`}
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="font-medium">{alert.message}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500">{alert.time}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acknowledge
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3 mr-1" />
                            Investigate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span>Network Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Network Uptime</span>
                        <span className="text-sm text-green-600">{mockData.networkStats.networkUptime}</span>
                      </div>
                      <Progress value={99.2} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Average Response Time</span>
                        <span className="text-sm text-blue-600">{mockData.networkStats.avgResponseTime}</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Error Rate</span>
                        <span className="text-sm text-yellow-600">{mockData.networkStats.errorRate}</span>
                      </div>
                      <Progress value={8} className="h-2 bg-red-100" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <span>System Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Data Transferred Today</span>
                      <span className="text-sm text-blue-600">{mockData.networkStats.dataTransferred}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Connections</span>
                      <span className="text-sm text-green-600">{mockData.networkStats.onlineDisplays}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Failed Connections</span>
                      <span className="text-sm text-red-600">{mockData.networkStats.offlineDisplays}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Maintenance Mode</span>
                      <span className="text-sm text-blue-600">{mockData.networkStats.maintenanceDisplays}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Health Overview</CardTitle>
                  <CardDescription>Overall system performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">Excellent</div>
                      <p className="text-sm text-green-700">Network Health</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">Good</div>
                      <p className="text-sm text-blue-700">Response Time</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-600">Monitor</div>
                      <p className="text-sm text-yellow-700">Error Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
