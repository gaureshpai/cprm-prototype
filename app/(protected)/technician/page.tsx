import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Monitor,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Wrench,
  Clock,
  MapPin,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { getSystemAnalyticsAction, getRecentEmergencyAlertsAction } from "@/lib/content-actions"
import { getAllDisplaysAction } from "@/lib/display-actions"
import { getOTStatus } from "@/lib/ot-service"
import { EmergencyAlert, OTTheater } from "@/lib/helpers"
import { getAlertSeverityColor } from "@/lib/functions"

async function getTechnicianData() {
  try {
    const [analyticsResult, alertsResult, displaysResult, otData] = await Promise.all([
      getSystemAnalyticsAction(),
      getRecentEmergencyAlertsAction(),
      getAllDisplaysAction(),
      getOTStatus(), 
    ])

    return {
      analytics: analyticsResult.success ? analyticsResult.data : null,
      alerts: alertsResult.success ? alertsResult.data : [],
      displays: displaysResult.success ? displaysResult.data : [],
      otData: otData, 
    }
  } catch (error) {
    console.error("Error fetching technician data:", error)
    return {
      analytics: null,
      alerts: [],
      displays: [],
      otData: { theaters: [], todaySchedule: [], emergencyQueue: [] },
    }
  }
}

export default async function TechnicianDashboard() {
  const { analytics, alerts, displays, otData } = await getTechnicianData()
  const currentDate = new Date()
  
  const maintenanceTheaters = otData.theaters.filter((theater: OTTheater) => theater.status === "maintenance")

  return (
    <AuthGuard allowedRoles={["technician", "admin"]} className="container mx-auto p-6 space-y-6">
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
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
          </div>

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Displays</CardTitle>
                  <Monitor className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.displays.total}</div>
                  <p className="text-xs text-muted-foreground">Across all departments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Online</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{analytics.displays.online}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Issues</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {analytics.displays.offline + analytics.displays.warning}
                  </div>
                  <p className="text-xs text-muted-foreground">{analytics.displays.warning} warnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network Health</CardTitle>
                  <Zap className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{analytics.performance.networkConnectivity}%</div>
                  <p className="text-xs text-muted-foreground">{analytics.performance.responseTime}s avg response</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="maintenance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6 bg-white">
              <TabsTrigger value="maintenance">OT Maintenance</TabsTrigger>
              <TabsTrigger value="alerts">Emergency Alerts</TabsTrigger>
              <TabsTrigger value="performance">System Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="maintenance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    <span>Operating Theaters - Maintenance Status</span>
                  </CardTitle>
                  <CardDescription>Theaters currently under maintenance with detailed notes</CardDescription>
                </CardHeader>
                <CardContent>
                  {maintenanceTheaters.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium">All Operating Theaters Operational</p>
                      <p className="text-sm">No theaters currently under maintenance</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {maintenanceTheaters.map((theater: OTTheater) => (
                        <Card key={theater.id} className="border-l-4 border-l-orange-400">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{theater.name}</CardTitle>
                                <p className="text-sm text-gray-600">Under Maintenance</p>
                              </div>
                              <Badge className="bg-orange-100 text-orange-800 capitalize">{theater.status}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Wrench className="h-4 w-4 text-orange-600" />
                                <span className="font-medium">Maintenance Type:</span>
                                <span className="text-gray-600">
                                  {theater.maintenanceType || "General Maintenance"}
                                </span>
                              </div>

                              {theater.estimatedCompletion && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Clock className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">Expected Completion:</span>
                                  <span className="text-gray-600">{theater.estimatedCompletion}</span>
                                </div>
                              )}

                              {theater.lastCleaned && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">Last Cleaned:</span>
                                  <span className="text-gray-600">{theater.lastCleaned}</span>
                                </div>
                              )}
                            </div>

                            {theater.maintenanceType && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">Maintenance Notes:</p>
                                <p className="text-sm text-gray-600">
                                  {theater.maintenanceType === "Equipment Check"
                                    ? "Routine equipment inspection and calibration in progress"
                                    : theater.maintenanceType}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-blue-600" />
                    <span>All Operating Theaters Status</span>
                  </CardTitle>
                  <CardDescription>Complete overview of all theater statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otData.theaters.map((theater: OTTheater) => (
                      <Card
                        key={theater.id}
                        className={`border-l-4 ${theater.status === "occupied"
                            ? "border-l-red-400"
                            : theater.status === "maintenance"
                              ? "border-l-orange-400"
                              : theater.status === "booked"
                                ? "border-l-blue-400"
                                : theater.status === "cleaning"
                                  ? "border-l-purple-400"
                                  : "border-l-green-400"
                          }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{theater.name}</CardTitle>
                              <p className="text-xs text-gray-600">ID: {theater.id}</p>
                            </div>
                            <Badge
                              className={`text-xs capitalize ${theater.status === "occupied"
                                  ? "bg-red-100 text-red-800"
                                  : theater.status === "maintenance"
                                    ? "bg-orange-100 text-orange-800"
                                    : theater.status === "booked"
                                      ? "bg-blue-100 text-blue-800"
                                      : theater.status === "cleaning"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-green-100 text-green-800"
                                }`}
                            >
                              {theater.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="text-xs space-y-1">
                          {theater.currentSurgery && (
                            <div className="bg-red-50 p-2 rounded">
                              <p className="font-medium">Current Surgery:</p>
                              <p>Patient: {theater.currentSurgery.patient}</p>
                              <p>Procedure: {theater.currentSurgery.procedure}</p>
                              <p>Surgeon: {theater.currentSurgery.surgeon}</p>
                              <div className="mt-1">
                                <Progress value={theater.currentSurgery.progress} className="h-1" />
                                <p className="text-xs mt-1">{theater.currentSurgery.progress}% Complete</p>
                              </div>
                            </div>
                          )}

                          {theater.nextSurgery && (
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="font-medium">Next Surgery:</p>
                              <p>Patient: {theater.nextSurgery.patient}</p>
                              <p>Procedure: {theater.nextSurgery.procedure}</p>
                              <p>Scheduled: {theater.nextSurgery.scheduledTime}</p>
                            </div>
                          )}

                          {theater.lastCleaned && (
                            <div className="bg-green-50 p-2 rounded">
                              <p className="font-medium">Status: {theater.lastCleaned}</p>
                            </div>
                          )}

                          {theater.maintenanceType && (
                            <div className="bg-orange-50 p-2 rounded">
                              <p className="font-medium">Maintenance: {theater.maintenanceType}</p>
                              {theater.estimatedCompletion && <p>ETA: {theater.estimatedCompletion}</p>}
                            </div>
                          )}
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
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span>Emergency Alerts</span>
                  </CardTitle>
                  <CardDescription>Recent emergency alerts and system notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {!alerts || alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium">No Active Emergency Alerts</p>
                      <p className="text-sm">All systems operating normally</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {alerts &&
                        alerts.map((alert: EmergencyAlert) => (
                          <div
                            key={alert.id}
                            className={`p-4 border rounded-lg ${getAlertSeverityColor(alert.priority.toString())}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${alert.codeType === "Code Red"
                                        ? "border-red-500 text-red-700"
                                        : alert.codeType === "Code Blue"
                                          ? "border-blue-500 text-blue-700"
                                          : "border-yellow-500 text-yellow-700"
                                      }`}
                                  >
                                    {alert.codeType}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${alert.active ? "border-red-500 text-red-700" : "border-green-500 text-green-700"
                                      }`}
                                  >
                                    {alert.active ? "Active" : "Resolved"}
                                  </Badge>
                                </div>
                                <p className="font-medium mb-1">{alert.message}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{alert.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(alert.createdAt).toLocaleString("en-IN")}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {analytics && (
                <>
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
                            <span className="text-sm font-medium">Network Connectivity</span>
                            <span className="text-sm text-green-600">{analytics.performance.networkConnectivity}%</span>
                          </div>
                          <Progress value={analytics.performance.networkConnectivity} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Content Sync Rate</span>
                            <span className="text-sm text-blue-600">{analytics.performance.contentSyncRate}%</span>
                          </div>
                          <Progress value={analytics.performance.contentSyncRate} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Error Rate</span>
                            <span className="text-sm text-yellow-600">
                              {analytics.performance.errorRate.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={analytics.performance.errorRate} className="h-2" max={10} />
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
                          <span className="text-sm font-medium">Response Time</span>
                          <span className="text-sm text-blue-600">{analytics.performance.responseTime}s</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Active Displays</span>
                          <span className="text-sm text-green-600">{analytics.displays.online}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Failed Displays</span>
                          <span className="text-sm text-red-600">{analytics.displays.offline}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Warning Status</span>
                          <span className="text-sm text-yellow-600">{analytics.displays.warning}</span>
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
                          <div className="text-2xl font-bold text-green-600">
                            {analytics.performance.networkConnectivity >= 95 ? "Excellent" : "Good"}
                          </div>
                          <p className="text-sm text-green-700">Network Health</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">
                            {analytics.performance.responseTime <= 2 ? "Good" : "Fair"}
                          </div>
                          <p className="text-sm text-blue-700">Response Time</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-2xl font-bold text-yellow-600">
                            {analytics.performance.errorRate <= 1 ? "Good" : "Monitor"}
                          </div>
                          <p className="text-sm text-yellow-700">Error Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}