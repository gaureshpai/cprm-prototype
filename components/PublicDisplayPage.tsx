"use client"

import { useState, useEffect, useTransition } from "react"
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
}

export default function PublicDisplayPage({ displayId, displayData }: PublicDisplayProps) {
    const [data, setData] = useState<DisplayData>({
        tokenQueue: [],
        departments: [],
        emergencyAlerts: [],
        drugInventory: [],
    })
    const [currentTime, setCurrentTime] = useState(new Date())
    const [emergencyAlert, setEmergencyAlert] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        fetchDisplayData()
        const dataInterval = setInterval(() => {
            fetchDisplayData(false) 
        }, 5000) 

        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000)

        return () => {
            clearInterval(dataInterval)
            clearInterval(timeInterval)
        }
    }, [displayId])

    const fetchDisplayData = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true)

            startTransition(async () => {
                const displayData = await getDisplayDataAction(displayId)
                setData(displayData)
                setLastUpdate(new Date())

                const activeEmergencyAlert = displayData.emergencyAlerts.find((alert) => alert.priority >= 4)

                if (activeEmergencyAlert) {
                    setEmergencyAlert(activeEmergencyAlert)
                    setTimeout(() => setEmergencyAlert(null), 2 * 60 * 1000) 
                }
            })
        } catch (error) {
            console.error("Error fetching display data:", error)
        } finally {
            if (showLoading) setIsLoading(false)
        }
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

    const contentType = displayData?.content || "Mixed Dashboard"

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
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
                            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh every 5 seconds
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{currentTime.toLocaleTimeString()}</div>
                        <div className="text-lg text-gray-600">{currentTime.toLocaleDateString()}</div>
                        <Badge className={`mt-2 ${displayData?.status === "online" ? "bg-green-500" : "bg-red-500"}`}>
                            {displayData?.status || "Unknown"}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(contentType === "Token Queue" || contentType === "Mixed Dashboard") && data.tokenQueue.length > 0 && (
                    <Card className="shadow-lg">
                        <CardHeader className="bg-blue-600 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Users className="h-6 w-6" />
                                <span>Current Queue</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
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
                        </CardContent>
                    </Card>
                )}
                {(contentType === "Department Status" || contentType === "Mixed Dashboard") && data.departments.length > 0 && (
                    <Card className="shadow-lg">
                        <CardHeader className="bg-green-600 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Activity className="h-6 w-6" />
                                <span>Department Status</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
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
                        </CardContent>
                    </Card>
                )}
                {(contentType === "Drug Inventory" || contentType === "Mixed Dashboard") && data.drugInventory.length > 0 && (
                    <Card className="shadow-lg lg:col-span-2">
                        <CardHeader className="bg-red-600 text-white">
                            <CardTitle className="flex items-center space-x-2 text-2xl">
                                <Pill className="h-6 w-6" />
                                <span>Critical Stock Alerts</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </CardContent>
                    </Card>
                )}
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
            <div className="mt-8 text-center text-gray-500">
                <p>© 2025 Wenlock Hospital • UDAL Fellowship Challenge</p>
                <p className="text-sm mt-1">Real-time updates every 5 seconds • Patient privacy protected</p>
                <p className="text-xs mt-1">
                    Uptime: {displayData?.uptime || "N/A"} | Last Update:{" "}
                    {displayData?.lastUpdate ? new Date(displayData.lastUpdate).toLocaleString() : "N/A"}
                </p>
            </div>
        </div>
    )
}