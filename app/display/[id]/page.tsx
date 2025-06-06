"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Activity, AlertTriangle, Heart } from "lucide-react"
import { fetchCSVData, anonymizePatientData, CSV_DATA_SOURCES } from "@/lib/csv-data-integration"
import { applyPrivacyFilter, logDataAccess } from "@/lib/privacy-compliance"
import { EmergencyBroadcastSystem, type EmergencyAlert } from "@/lib/emergency-alerts"

interface PublicDisplayProps {
  params: { id: string }
}

export default function PublicDisplayPage({ params }: PublicDisplayProps) {
  const [displayData, setDisplayData] = useState<any>({
    tokenQueue: [],
    departments: [],
    emergencyAlerts: [],
    drugInventory: [],
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlert | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDisplayData()
    const interval = setInterval(fetchDisplayData, 30000) // Refresh every 30 seconds
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000)

    // Subscribe to emergency alerts
    const emergencySystem = EmergencyBroadcastSystem.getInstance()
    const handleEmergencyAlert = (alert: EmergencyAlert) => {
      if (alert.broadcastTo.includes(params.id) || alert.broadcastTo.includes("all")) {
        setEmergencyAlert(alert)
        // Auto-clear alert after 2 minutes for display
        setTimeout(() => setEmergencyAlert(null), 2 * 60 * 1000)
      }
    }
    emergencySystem.subscribe(handleEmergencyAlert)

    return () => {
      clearInterval(interval)
      clearInterval(timeInterval)
      emergencySystem.unsubscribe(handleEmergencyAlert)
    }
  }, [params.id])

  const fetchDisplayData = async () => {
    try {
      const [tokenData, deptData, alertData, drugData] = await Promise.all([
        fetchCSVData(CSV_DATA_SOURCES.tokenQueue),
        fetchCSVData(CSV_DATA_SOURCES.departments),
        fetchCSVData(CSV_DATA_SOURCES.emergencyAlerts),
        fetchCSVData(CSV_DATA_SOURCES.drugInventory),
      ])

      // Apply privacy filters for public display
      const privateTokenData = applyPrivacyFilter(anonymizePatientData(tokenData), "PUBLIC_DISPLAY")

      setDisplayData({
        tokenQueue: privateTokenData.slice(0, 10), // Show only next 10 tokens
        departments: deptData,
        emergencyAlerts: alertData.filter((alert: any) => alert.status === "Active"),
        drugInventory: drugData.filter((drug: any) => drug.status === "Critical"),
      })

      // Log data access for compliance
      logDataAccess("public_display", "token_queue", "view")
    } catch (error) {
      console.error("Error fetching display data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDisplayLocation = (displayId: string) => {
    const locations: Record<string, string> = {
      "1": "Main Lobby",
      "2": "OT Complex",
      "3": "Cardiology Wing",
      "4": "Pharmacy",
      "5": "Emergency Ward",
      "6": "ICU",
      "7": "Pediatrics",
      "8": "Maternity Ward",
    }
    return locations[displayId] || `Display ${displayId}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading display data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      {/* Emergency Alert Overlay */}
      {emergencyAlert && (
        <div className="fixed inset-0 bg-red-600 bg-opacity-95 z-50 flex items-center justify-center">
          <div className="text-center text-white">
            <AlertTriangle className="h-24 w-24 mx-auto mb-4 animate-pulse" />
            <h1 className="text-6xl font-bold mb-4">{emergencyAlert.codeType}</h1>
            <p className="text-2xl mb-2">{emergencyAlert.location}</p>
            <p className="text-xl">{emergencyAlert.message}</p>
            <div className="mt-8 text-lg">
              <p>Please follow emergency procedures</p>
              <p>Staff report to designated areas immediately</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Wenlock Hospital</h1>
            <p className="text-xl text-gray-600">{getDisplayLocation(params.id)}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{currentTime.toLocaleTimeString()}</div>
            <div className="text-lg text-gray-600">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Token Queue */}
        <Card className="shadow-lg">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Users className="h-6 w-6" />
              <span>Current Queue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {displayData.tokenQueue.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No patients in queue</p>
                </div>
              ) : (
                displayData.tokenQueue.map((token: any, index: number) => (
                  <div
                    key={token.token_id}
                    className={`flex justify-between items-center p-4 rounded-lg ${
                      index === 0 ? "bg-green-100 border-2 border-green-500" : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <div className="text-2xl font-bold">Token #{token.token_id}</div>
                      <div className="text-lg text-gray-600">{token.display_name || token.patient_name}</div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`text-lg px-3 py-1 ${
                          token.status === "In Progress"
                            ? "bg-blue-500"
                            : token.status === "Waiting"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                        }`}
                      >
                        {token.status}
                      </Badge>
                      {index === 0 && <div className="text-green-600 font-semibold mt-1">NOW SERVING</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department Status */}
        <Card className="shadow-lg">
          <CardHeader className="bg-green-600 text-white">
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Activity className="h-6 w-6" />
              <span>Department Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {displayData.departments.map((dept: any) => (
                <div key={dept.dept_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-lg font-semibold">{dept.department_name}</div>
                    <div className="text-gray-600">{dept.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.floor(Math.random() * 10) + 1} {/* Current tokens - would come from real data */}
                    </div>
                    <div className="text-sm text-gray-500">patients waiting</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        {displayData.drugInventory.length > 0 && (
          <Card className="shadow-lg lg:col-span-2">
            <CardHeader className="bg-red-600 text-white">
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <AlertTriangle className="h-6 w-6" />
                <span>Critical Stock Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayData.drugInventory.map((drug: any) => (
                  <Alert key={drug.drug_id} className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>{drug.drug_name}</strong> - Critical stock level
                      <br />
                      <span className="text-sm">Contact pharmacy immediately</span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hospital Information */}
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader className="bg-gray-600 text-white">
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Heart className="h-6 w-6" />
              <span>Hospital Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="text-lg font-semibold mb-2">Emergency</h3>
                <p className="text-2xl font-bold text-red-600">108</p>
                <p className="text-gray-600">24/7 Emergency Services</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">General Inquiry</h3>
                <p className="text-2xl font-bold text-blue-600">0824-2444444</p>
                <p className="text-gray-600">Reception & Information</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Visiting Hours</h3>
                <p className="text-lg font-bold text-green-600">4:00 PM - 7:00 PM</p>
                <p className="text-gray-600">Daily visiting hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500">
        <p>© 2025 Wenlock Hospital • UDAL Fellowship Challenge</p>
        <p className="text-sm mt-1">Real-time updates every 30 seconds • Patient privacy protected</p>
      </div>
    </div>
  )
}
