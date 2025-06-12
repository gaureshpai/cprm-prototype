"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Activity, AlertTriangle, Heart, Pill, Droplets } from "lucide-react"
import { getDisplayDataAction } from "@/lib/display-actions"
import { getOTStatus } from "@/lib/ot-service"
import type { DisplayData, PublicDisplayProps } from "@/lib/helpers"

export default function PublicDisplayPage({ displayId, displayData }: PublicDisplayProps) {
    const [data, setData] = useState<DisplayData>({
        tokenQueue: [],
        departments: [],
        emergencyAlerts: [],
        drugInventory: [],
        bloodBank: [],
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

    const getDashboardSections = (contentType: string): string[] => {
        switch (contentType) {
            case "Mixed Dashboard":
                return ["tokenQueue", "departments", "otStatus", "drugInventory", "bloodBank", "hospitalInfo"]
            case "Patient Dashboard":
                return ["tokenQueue", "departments", "hospitalInfo"]
            case "Staff Dashboard":
                return ["tokenQueue", "departments", "otStatus", "drugInventory", "bloodBank"]
            default:
                return ["tokenQueue", "departments", "drugInventory", "hospitalInfo"]
        }
    }

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
            }
        } catch (error) {
            console.error("Error sending heartbeat:", error)
            setHeartbeatError(`Connection error: ${error}`)
        }
    }

    const sendOfflineSignal = async () => {
        try {
            await sendHeartbeat("offline")
        } catch (error) {
            console.error("Error sending offline signal:", error)
        }
    }

    useEffect(() => {
        const handleVisibilityChange = () => {
            const visible = !document.hidden
            setIsVisible(visible)

            if (visible) {
                sendHeartbeat("online")

                if (!heartbeatIntervalRef.current) {
                    heartbeatIntervalRef.current = setInterval(() => sendHeartbeat("online"), 15000)
                }
                if (!dataIntervalRef.current) {
                    dataIntervalRef.current = setInterval(() => fetchDisplayData(false), 5000)
                }
                if (!rotationIntervalRef.current && isDashboardType(data.contentType)) {
                    startContentRotation()
                }
            } else {
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

    const isDashboardType = (contentType?: string): boolean => {
        return contentType === "Mixed Dashboard" || contentType === "Patient Dashboard" || contentType === "Staff Dashboard"
    }

    useEffect(() => {
        if (isDashboardType(data.contentType)) {
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

        const sections = getDashboardSections(data.contentType || "Mixed Dashboard")
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
                const [displayData, otData] = await Promise.all([getDisplayDataAction(displayId), getOTStatus()])

                setData({
                    ...displayData,
                    otStatus: otData,
                })
                setLastUpdate(new Date())
            })
        } catch (error) {
            console.error("Error fetching display data:", error)
        } finally {
            if (showLoading) setIsLoading(false)
        }
    }

    const contentType = data.contentType || displayData?.content || "Mixed Dashboard"

    const shouldShowTokenQueue = () => {
        if (contentType === "Token Queue" || contentType === "Department Token Queue") return true
        if (isDashboardType(contentType)) {
            return activeSection === "tokenQueue"
        }
        return false
    }

    const shouldShowDepartments = () => {
        if (contentType === "Department Status") return true
        if (isDashboardType(contentType)) {
            return activeSection === "departments"
        }
        return false
    }

    const shouldShowDrugInventory = () => {
        if (contentType === "Drug Inventory") return true
        if (contentType === "Patient Dashboard") return false
        if (isDashboardType(contentType)) {
            return activeSection === "drugInventory"
        }
        return false
    }

    const shouldShowBloodBank = () => {
        if (contentType === "Blood Bank") return true
        if (contentType === "Patient Dashboard") return false
        if (isDashboardType(contentType)) {
            return activeSection === "bloodBank"
        }
        return false
    }

    const shouldShowHospitalInfo = () => {
        if (contentType === "Hospital Info") return true
        if (contentType === "Staff Dashboard") return false
        if (isDashboardType(contentType)) {
            return activeSection === "hospitalInfo"
        }
        return false
    }

    const shouldShowOTStatus = () => {
        if (contentType === "OT Status") return true
        if (contentType === "Patient Dashboard") return false
        if (isDashboardType(contentType)) {
            return activeSection === "otStatus"
        }
        return false
    }

    const hasEmergencyAlerts = data.emergencyAlerts && data.emergencyAlerts.length > 0

    const getDashboardDisplayName = (type: string): string => {
        switch (type) {
            case "Mixed Dashboard":
                return "Mixed Dashboard"
            case "Patient Dashboard":
                return "Patient Dashboard"
            case "Staff Dashboard":
                return "Staff Dashboard"
            case "Department Token Queue":
                return "Department Token Queue"
            default:
                return type
        }
    }

    const getDisplayTokens = () => {
        const statusPriority: Record<string, number> = {
            "in progress": 1,
            "called": 2,
            "waiting": 3
        };

        const sortedTokens = [...data.tokenQueue].sort((a, b) => {
            const statusA = String(a.status || '').toLowerCase();
            const statusB = String(b.status || '').toLowerCase();

            const priorityA = statusPriority[statusA] || 999;
            const priorityB = statusPriority[statusB] || 999;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            const tokenIdA = Number(a.token_id) || 0;
            const tokenIdB = Number(b.token_id) || 0;
            return tokenIdA - tokenIdB;
        });

        if (contentType === "Department Token Queue") {
            return sortedTokens.slice(0, 4);
        }
        return sortedTokens;
    };

    const displayTokens = getDisplayTokens()

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
                            Display ID: {displayId} | Content: {getDashboardDisplayName(contentType)}
                            {isPending && <span className="ml-2 text-blue-600">• Updating...</span>}
                        </p>
                        <p className="text-xs text-gray-400">
                            Last updated: {lastUpdate?.toLocaleTimeString("en-US")} • Auto-refresh every 5 seconds
                        </p>
                        {isDashboardType(contentType) && (
                            <p className="text-xs text-blue-600">
                                Currently showing: {activeSection.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}{" "}
                                • Auto-rotating every 15 seconds
                            </p>
                        )}
                        {contentType === "Department Token Queue" && (
                            <p className="text-xs text-purple-600">Department-specific display • Showing top 4 tokens only</p>
                        )}
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
                {shouldShowTokenQueue() && (
                    <Card className="shadow-lg lg:col-span-2 min-h-[400px]">
                        <CardHeader className="bg-blue-600 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Users className="h-6 w-6" />
                                <span>{contentType === "Department Token Queue" ? "Department Queue (Top 4)" : "Current Queue"}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {displayTokens.length > 0 ? (
                                <div className="space-y-4">
                                    {displayTokens.map((token, index) => (
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
                                                    className={`text-lg px-3 py-1 ${token.status === "in progress"
                                                            ? "bg-blue-500"
                                                            : token.status === "waiting"
                                                                ? "bg-yellow-500"
                                                                : "bg-gray-500"
                                                        }`}
                                                >
                                                    {token.status === "in progress"
                                                        ? "In Progress"
                                                        : token.status === "waiting"
                                                            ? "Waiting"
                                                            : token.status}
                                                </Badge>
                                                {token.estimated_time && (
                                                    <div className="text-sm text-gray-500 mt-1">ETA: {token.estimated_time}</div>
                                                )}
                                                {index === 0 && <div className="text-green-600 font-semibold mt-1">NOW SERVING</div>}
                                                {contentType === "Department Token Queue" && index < 3 && (
                                                    <div className="text-blue-600 text-xs mt-1">Position: {index + 1}</div>
                                                )}
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

                {shouldShowDepartments() && (
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

                {shouldShowDrugInventory() && (
                    <Card className="shadow-lg lg:col-span-2 min-h-[400px]">
                        <CardHeader className="bg-red-600 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Pill className="h-6 w-6" />
                                <span>Critical Drug Alerts</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {data.drugInventory.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.drugInventory?.map((drug: any) => (
                                        <Alert key={drug.drug_id} className="border-red-200 bg-red-50">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                            <AlertDescription className="text-red-800">
                                                <strong>{drug.drug_name}</strong> - {drug.status == "low" ? "Low Stock level" : "Out Of Stock "}
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
                                        <h3 className="text-2xl font-semibold mb-2">No Critical Drug Alerts</h3>
                                        <p className="text-lg">All medications are currently well stocked.</p>
                                        <p className="text-sm mt-2">Critical alerts will appear here when stock is low.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {shouldShowBloodBank() && (
                    <Card className="shadow-lg lg:col-span-2 min-h-[400px]">
                        <CardHeader className="bg-red-800 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Droplets className="h-6 w-6" />
                                <span>Blood Bank Alerts</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {data.bloodBank.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {data.bloodBank?.map((blood: any) => (
                                        <Alert key={blood.blood_id} className="border-red-300 bg-red-100">
                                            <Droplets className="h-4 w-4 text-red-700" />
                                            <AlertDescription className="text-red-900">
                                                <strong>{blood.blood_type} Blood</strong>
                                                <br />
                                                <span className="text-sm">Available: {blood.units_available} units</span>
                                                <br />
                                                <span className="text-sm">Critical Level: {blood.critical_level} units</span>
                                                <br />
                                                <span className="text-sm font-semibold text-red-800">{blood.status} - Contact Blood Bank</span>
                                                <br />
                                                <span className="text-xs text-red-700">Expires: {blood.expiry_date}</span>
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center text-gray-500">
                                        <Droplets className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-2xl font-semibold mb-2">No Blood Bank Alerts</h3>
                                        <p className="text-lg">All blood types are currently well stocked.</p>
                                        <p className="text-sm mt-2">Critical alerts will appear here when stock is low.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {shouldShowOTStatus() && (
                    <Card className="shadow-lg lg:col-span-2 min-h-[400px]">
                        <CardHeader className="bg-purple-600 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Activity className="h-6 w-6" />
                                <span>Operating Theater Status</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {data.otStatus?.theaters && data.otStatus.theaters.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.otStatus.theaters.map((theater) => (
                                        <div
                                            key={theater.id}
                                            className={`p-4 rounded-lg border-2 ${theater.status === "occupied"
                                                    ? "bg-red-50 border-red-200"
                                                    : theater.status === "available"
                                                        ? "bg-green-50 border-green-200"
                                                        : theater.status === "maintenance"
                                                            ? "bg-yellow-50 border-yellow-200"
                                                            : theater.status === "booked"
                                                                ? "bg-blue-50 border-blue-200"
                                                                : "bg-gray-50 border-gray-200"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-semibold text-lg">{theater.name}</h3>
                                                <Badge
                                                    className={`${theater.status === "occupied"
                                                            ? "bg-red-500"
                                                            : theater.status === "available"
                                                                ? "bg-green-500"
                                                                : theater.status === "maintenance"
                                                                    ? "bg-yellow-500"
                                                                    : theater.status === "booked"
                                                                        ? "bg-blue-500"
                                                                        : "bg-gray-500"
                                                        }`}
                                                >
                                                    {theater.status === "occupied"
                                                        ? "In Use"
                                                        : theater.status === "available"
                                                            ? "Available"
                                                            : theater.status === "maintenance"
                                                                ? "Maintenance"
                                                                : theater.status === "booked"
                                                                    ? "Scheduled"
                                                                    : theater.status === "cleaning"
                                                                        ? "Cleaning"
                                                                        : theater.status}
                                                </Badge>
                                            </div>

                                            {theater.currentSurgery && (
                                                <div className="space-y-2">
                                                    <div className="text-sm">
                                                        <strong>Current Surgery:</strong>
                                                        <p className="text-gray-700">{theater.currentSurgery.procedure}</p>
                                                        <p className="text-gray-600">Patient: {theater.currentSurgery.patient}</p>
                                                        <p className="text-gray-600">Surgeon: {theater.currentSurgery.surgeon}</p>
                                                    </div>
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>Started: {theater.currentSurgery.startTime}</span>
                                                        <span>Elapsed: {theater.currentSurgery.elapsed}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${theater.currentSurgery.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 text-center">
                                                        Progress: {theater.currentSurgery.progress}%
                                                    </div>
                                                </div>
                                            )}

                                            {theater.nextSurgery && (
                                                <div className="space-y-2">
                                                    <div className="text-sm">
                                                        <strong>Next Surgery:</strong>
                                                        <p className="text-gray-700">{theater.nextSurgery.procedure}</p>
                                                        <p className="text-gray-600">Patient: {theater.nextSurgery.patient}</p>
                                                        <p className="text-gray-600">Scheduled: {theater.nextSurgery.scheduledTime}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {theater.status === "available" && theater.lastCleaned && (
                                                <div className="text-sm text-green-600">
                                                    <p>✓ {theater.lastCleaned}</p>
                                                </div>
                                            )}

                                            {theater.status === "maintenance" && theater.maintenanceType && (
                                                <div className="text-sm text-yellow-600">
                                                    <p>🔧 {theater.maintenanceType}</p>
                                                    {theater.estimatedCompletion && <p>Est. completion: {theater.estimatedCompletion}</p>}
                                                </div>
                                            )}

                                            {theater.status === "cleaning" && theater.estimatedCompletion && (
                                                <div className="text-sm text-blue-600">
                                                    <p>🧹 Cleaning in progress</p>
                                                    <p>Est. completion: {theater.estimatedCompletion}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center text-gray-500">
                                        <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-2xl font-semibold mb-2">No OT Data Available</h3>
                                        <p className="text-lg">Operating theater information is currently unavailable.</p>
                                        <p className="text-sm mt-2">Status will be displayed when data is available.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {shouldShowHospitalInfo() && (
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
                    {displayData?.lastUpdate ? new Date(displayData.lastUpdate).toLocaleString("en-US") : "N/A"}
                </p>
            </div>
        </div>
    )
}