"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Activity, AlertTriangle, Heart, Pill } from "lucide-react"
import { getDisplayDataAction } from "@/lib/display-actions"

interface PublicDisplayProps {
    displayId: string
    displayData?: {
        id: string
        location: string
        status: string
        content: string
        uptime: string
        lastUpdate: string
        isActive: boolean
        config?: any
    }
}

interface DisplayData {
    tokenQueue: Array<{
        token_id: string
        patient_name: string
        display_name?: string | null
        status: string
        department: string
        priority: number
        estimated_time?: string | null
    }>
    departments: Array<{
        dept_id: string
        department_name: string
        location: string
        current_tokens: number
    }>
    emergencyAlerts: Array<{
        id: string
        codeType: string
        location: string
        message: string
        priority: number
    }>
    drugInventory: Array<{
        drug_id: string
        drug_name: string
        current_stock: number
        min_stock: number
        status: string
    }>
    contentType?: string
}

export default function PublicDisplayPage({ displayId, displayData }: PublicDisplayProps) {
    const [data, setData] = useState<DisplayData>({
        tokenQueue: [],
        departments: [],
        emergencyAlerts: [],
        drugInventory: [],
        contentType: "Mixed Dashboard",
    })
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [isPending, startTransition] = useTransition()
    const [heartbeatError, setHeartbeatError] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const [activeSection, setActiveSection] = useState<string>("tokenQueue")
    const [isLoading, setIsLoading] = useState(true)

    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const dataIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const timeIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const sendHeartbeat = async (status: "online" | "offline" = "online") => {
        try {
            const response = await fetch("/api/displays/heartbeat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    displayId,
                    status,
                    timestamp: new Date().toISOString(),
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                setHeartbeatError(`Heartbeat failed: ${data.error || response.statusText}`)
            } else {
                setHeartbeatError(null)
                console.log(`Heartbeat sent: ${status}`)
            }
        } catch (error) {
            console.error("Error sending heartbeat:", error)
            setHeartbeatError(`Connection error: ${error}`)
        }
    }

    const sendOfflineSignal = async () => {
        try {
            await sendHeartbeat("offline")
            console.log("Offline signal sent")
        } catch (error) {
            console.error("Error sending offline signal:", error)
        }
    }

    useEffect(() => {
        const handleVisibilityChange = () => {
            const visible = !document.hidden
            setIsVisible(visible)

            if (visible) {
                console.log("Page became visible - sending online heartbeat")
                sendHeartbeat("online")

                if (!heartbeatIntervalRef.current) {
                    heartbeatIntervalRef.current = setInterval(() => sendHeartbeat("online"), 15000)
                }
                if (!dataIntervalRef.current) {
                    dataIntervalRef.current = setInterval(() => fetchDisplayData(false), 5000)
                }
                if (!rotationIntervalRef.current && data.contentType === "Mixed Dashboard") {
                    startContentRotation()
                }
            } else {
                console.log("Page became hidden - sending offline signal")
                sendOfflineSignal()

                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current)
                    heartbeatIntervalRef.current = null
                }
                if (dataIntervalRef.current) {
                    clearInterval(dataIntervalRef.current)
                    dataIntervalRef.current = null
                }
                if (rotationIntervalRef.current) {
                    clearInterval(rotationIntervalRef.current)
                    rotationIntervalRef.current = null
                }
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
        }
    }, [displayId, data.contentType])

    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log("Page unloading - sending offline signal")

            navigator.sendBeacon(
                "/api/displays/heartbeat",
                JSON.stringify({
                    displayId,
                    status: "offline",
                    timestamp: new Date().toISOString(),
                }),
            )
        }

        const handleUnload = () => {
            sendOfflineSignal()
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        window.addEventListener("unload", handleUnload)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
            window.removeEventListener("unload", handleUnload)

            sendOfflineSignal()
        }
    }, [displayId])

    useEffect(() => {
        sendHeartbeat("online")

        heartbeatIntervalRef.current = setInterval(() => {
            if (!document.hidden) {
                sendHeartbeat("online")
            }
        }, 15000)

        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current)
            }

            sendOfflineSignal()
        }
    }, [displayId])

    useEffect(() => {
        fetchDisplayData()

        dataIntervalRef.current = setInterval(() => {
            if (!document.hidden) {
                fetchDisplayData(false)
            }
        }, 5000)

        timeIntervalRef.current = setInterval(() => setCurrentTime(new Date()), 1000)

        return () => {
            if (dataIntervalRef.current) {
                clearInterval(dataIntervalRef.current)
            }
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current)
            }
            if (rotationIntervalRef.current) {
                clearInterval(rotationIntervalRef.current)
            }
        }
    }, [displayId])
    
    useEffect(() => {
        if (data.contentType === "Mixed Dashboard") {
            startContentRotation()
        } else if (rotationIntervalRef.current) {
            clearInterval(rotationIntervalRef.current)
            rotationIntervalRef.current = null
        }

        return () => {
            if (rotationIntervalRef.current) {
                clearInterval(rotationIntervalRef.current)
                rotationIntervalRef.current = null
            }
        }
    }, [data.contentType])

    const startContentRotation = () => {
        if (rotationIntervalRef.current) {
            clearInterval(rotationIntervalRef.current)
        }
        
        const sections = ["tokenQueue", "departments", "drugInventory", "hospitalInfo"]
        let currentIndex = sections.indexOf(activeSection)
        if (currentIndex === -1) currentIndex = 0
        
        setActiveSection(sections[currentIndex])
        
        rotationIntervalRef.current = setInterval(() => {
            currentIndex = (currentIndex + 1) % sections.length
            setActiveSection(sections[currentIndex])
        }, 15000)
    }

    const fetchDisplayData = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true)

            startTransition(async () => {
                const displayData = await getDisplayDataAction(displayId)
                setData(displayData)
                setLastUpdate(new Date())
            })
        } catch (error) {
            console.error("Error fetching display data:", error)
        } finally {
            if (showLoading) setIsLoading(false)
        }
    }

    const contentType = data.contentType || displayData?.content || "Mixed Dashboard"
    
    const shouldShowTokenQueue =
        contentType === "Token Queue" || (contentType === "Mixed Dashboard" && activeSection === "tokenQueue")
    const shouldShowDepartments =
        contentType === "Department Status" || (contentType === "Mixed Dashboard" && activeSection === "departments")
    const shouldShowDrugInventory =
        contentType === "Drug Inventory" || (contentType === "Mixed Dashboard" && activeSection === "drugInventory")
    const shouldShowHospitalInfo =
        contentType === "Hospital Info" || (contentType === "Mixed Dashboard" && activeSection === "hospitalInfo")
    
    const hasEmergencyAlerts = data.emergencyAlerts && data.emergencyAlerts.length > 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 relative">
            {heartbeatError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{heartbeatError}</AlertDescription>
                </Alert>
            )}

            {!isVisible && (
                <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        Display is hidden or in background - status set to offline
                    </AlertDescription>
                </Alert>
            )}

            {hasEmergencyAlerts && (
                <div className="fixed top-4 right-4 z-50 w-80">
                    <Card className="border-2 border-red-500 bg-red-50 shadow-lg">
                        <CardHeader className="p-3 bg-red-600 text-white">
                            <CardTitle className="text-sm font-bold flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2 animate-pulse" />
                                Emergency Alerts ({data.emergencyAlerts.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 max-h-32 overflow-y-auto">
                            <div className="space-y-2">
                                {data.emergencyAlerts.map((alert) => (
                                    <div key={alert.id} className="bg-red-100 p-2 rounded">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Badge className="bg-red-600">{alert.codeType}</Badge>
                                            <span className="font-bold text-sm">{alert.location}</span>
                                        </div>
                                        <p className="text-xs text-red-800">{alert.message}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Wenlock Hospital</h1>
                        <p className="text-xl text-gray-600">{displayData?.location || `Display ${displayId}`}</p>
                        <p className="text-sm text-gray-500">
                            Display ID: {displayId} | Content: {contentType}
                            {isPending && <span className="ml-2 text-blue-600">• Updating...</span>}
                        </p>
                        <p className="text-xs text-gray-400">
                            Last updated: {lastUpdate?.toLocaleTimeString("en-US")} • Auto-refresh every 5 seconds
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{currentTime?.toLocaleTimeString("en-US")}</div>
                        <div className="text-lg text-gray-600">{currentTime?.toLocaleDateString("en-US")}</div>
                        <Badge className={`mt-2 ${isVisible ? "bg-green-500" : "bg-red-500"}`}>
                            {isVisible ? "Active" : "Hidden"}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {shouldShowTokenQueue && (
                    <Card className="shadow-lg lg:col-span-2 min-h-[400px]">
                        <CardHeader className="bg-blue-600 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Users className="h-6 w-6" />
                                <span>Current Queue</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {data.tokenQueue.length > 0 ? (
                                <div className="space-y-4">
                                    {data.tokenQueue.map((token, index) => (
                                        <div
                                            key={token.token_id}
                                            className={`flex justify-between items-center p-4 rounded-lg ${index === 0 ? "bg-green-100 border-2 border-green-500" : "bg-gray-50"
                                                }`}
                                        >
                                            <div>
                                                <div className="text-2xl font-bold">Token #{token.token_id}</div>
                                                <div className="text-lg text-gray-600">{token.display_name || token.patient_name}</div>
                                                <div className="text-sm text-gray-500">{token.department}</div>
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    className={`text-lg px-3 py-1 ${token.status === "in_progress"
                                                        ? "bg-blue-500"
                                                        : token.status === "waiting"
                                                            ? "bg-yellow-500"
                                                            : "bg-gray-500"
                                                        }`}
                                                >
                                                    {token.status === "in_progress" ? "In Progress" : "Waiting"}
                                                </Badge>
                                                {token.estimated_time && (
                                                    <div className="text-sm text-gray-500 mt-1">ETA: {token.estimated_time}</div>
                                                )}
                                                {index === 0 && <div className="text-green-600 font-semibold mt-1">NOW SERVING</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center text-gray-500">
                                        <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-2xl font-semibold mb-2">No Patients in Queue</h3>
                                        <p className="text-lg">The queue is currently empty.</p>
                                        <p className="text-sm mt-2">New tokens will appear here when patients arrive.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {shouldShowDepartments && (
                    <Card className="shadow-lg lg:col-span-2 min-h-[400px]">
                        <CardHeader className="bg-green-600 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Activity className="h-6 w-6" />
                                <span>Department Status</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {data.departments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.departments.map((dept) => (
                                        <div key={dept.dept_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="text-lg font-semibold">{dept.department_name}</div>
                                                <div className="text-gray-600">{dept.location}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600">{dept.current_tokens}</div>
                                                <div className="text-sm text-gray-500">patients waiting</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center text-gray-500">
                                        <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-2xl font-semibold mb-2">No Department Data</h3>
                                        <p className="text-lg">Department information is currently unavailable.</p>
                                        <p className="text-sm mt-2">Status will be displayed when data is available.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {shouldShowDrugInventory && (
                    <Card className="shadow-lg lg:col-span-2 min-h-[400px]">
                        <CardHeader className="bg-red-600 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Pill className="h-6 w-6" />
                                <span>Critical Stock Alerts</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {data.drugInventory.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.drugInventory.map((drug) => (
                                        <Alert key={drug.drug_id} className="border-red-200 bg-red-50">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                            <AlertDescription className="text-red-800">
                                                <strong>{drug.drug_name}</strong> - Critical stock level
                                                <br />
                                                <span className="text-sm">
                                                    Current: {drug.current_stock} | Min: {drug.min_stock}
                                                </span>
                                                <br />
                                                <span className="text-sm">Contact pharmacy immediately</span>
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center text-gray-500">
                                        <Pill className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-2xl font-semibold mb-2">No Critical Stock Alerts</h3>
                                        <p className="text-lg">All medications are currently well stocked.</p>
                                        <p className="text-sm mt-2">Critical alerts will appear here when stock is low.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {shouldShowHospitalInfo && (
                    <Card className="shadow-lg lg:col-span-2 min-h-[400px]">
                        <CardHeader className="bg-gray-600 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Heart className="h-6 w-6" />
                                <span>Hospital Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2 text-blue-700">Key Departments</h3>
                                    <ul className="space-y-2">
                                        <li className="flex justify-between">
                                            <span>Emergency</span>
                                            <span>Ground Floor, Block A</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Outpatient</span>
                                            <span>First Floor, Block B</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Radiology</span>
                                            <span>Ground Floor, Block C</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Laboratory</span>
                                            <span>Second Floor, Block B</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2 text-green-700">Hospital Services</h3>
                                    <ul className="space-y-2">
                                        <li className="flex justify-between">
                                            <span>Pharmacy</span>
                                            <span>24/7 Service</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Cafeteria</span>
                                            <span>7:00 AM - 9:00 PM</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>ATM</span>
                                            <span>Near Main Entrance</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Ambulance</span>
                                            <span>108 / 0824-2444445</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="mt-8 text-center text-gray-500">
                <p>© 2025 Wenlock Hospital • UDAL Fellowship Challenge</p>
                <p className="text-sm mt-1">Real-time updates every 5 seconds • Patient privacy protected</p>
                <p className="text-xs mt-1">
                    Uptime: {displayData?.uptime || "N/A"} | Last Update:{" "}
                    {displayData?.lastUpdate ? new Date(displayData.lastUpdate).toLocaleString("en-US") : "N/A"}
                </p>
            </div>
        </div>
    )
}