'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Heart, Clock, Users, AlertTriangle, Monitor, Pill, Activity, MapPin, Bell, Shield, Sliders } from "lucide-react"
import Papa from 'papaparse'

type DrugInventory = {
    drug_id: string
    drug_name: string
    stock_qty: string
    reorder_level: string
    status: string
    last_updated: string
}

type TokenQueue = {
    token_id: string
    dept_id: string
    patient_name: string
    status: string
    timestamp: string
    estimated_wait: number
}

type Department = {
    dept_id: string
    department_name: string
    location: string
    current_tokens: number
    avg_wait_time: number
}

type BloodBank = {
    blood_id: string
    blood_type: string
    units_available: string
    critical_level: string
    status: string
    expiry_date: string
}

type EmergencyAlert = {
    alert_id: string
    code_type: string
    department: string
    timestamp: string
    status: string
    severity: string
}

type OTStatus = {
    ot_id: string
    patient_name: string
    procedure: string
    status: string
    progress: number
    start_time: string
    estimated_end: string
    surgeon: string
}

type HospitalData = {
    drugInventory: DrugInventory[]
    tokenQueue: TokenQueue[]
    departments: Department[]
    bloodBank: BloodBank[]
    emergencyAlerts: EmergencyAlert[]
    otStatus: OTStatus[]
}

const CSV_URLS = {
    drugInventory: '/data/drug_inventory.csv',
    tokenQueue: '/data/token_queue.csv',
    departments: '/data/departments.csv',
    bloodBank: '/data/blood_bank.csv',
    emergencyAlerts: '/data/emergency_alerts.csv',
    otStatus: '/data/ot_status.csv'
}

const DEFAULT_DATA: HospitalData = {
    drugInventory: [],
    tokenQueue: [],
    departments: [],
    bloodBank: [],
    emergencyAlerts: [],
    otStatus: []
}

async function fetchCSVData<T>(url: string): Promise<T[]> {
    try {
        const response = await fetch(url)
        const text = await response.text()
        const result = Papa.parse<T>(text, {
            header: true,
            skipEmptyLines: true
        })
        return result.data
    } catch (error) {
        console.error(`Error fetching CSV from ${url}:`, error)
        return []
    }
}

async function fetchAllData(): Promise<HospitalData> {
    const [
        drugInventory,
        tokenQueue,
        departments,
        bloodBank,
        emergencyAlerts,
        otStatus
    ] = await Promise.all([
        fetchCSVData<DrugInventory>(CSV_URLS.drugInventory),
        fetchCSVData<TokenQueue>(CSV_URLS.tokenQueue),
        fetchCSVData<Department>(CSV_URLS.departments),
        fetchCSVData<BloodBank>(CSV_URLS.bloodBank),
        fetchCSVData<EmergencyAlert>(CSV_URLS.emergencyAlerts),
        fetchCSVData<OTStatus>(CSV_URLS.otStatus)
    ])

    tokenQueue.forEach(t => t.estimated_wait = Number(t.estimated_wait) || 0)
    departments.forEach(d => {
        d.current_tokens = Number(d.current_tokens) || 0
        d.avg_wait_time = Number(d.avg_wait_time) || 0
    })
    otStatus.forEach(ot => ot.progress = Number(ot.progress) || 0)

    return {
        drugInventory,
        tokenQueue,
        departments,
        bloodBank,
        emergencyAlerts,
        otStatus
    }
}

export default function EnhancedDisplaySystem() {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [currentViewIndex, setCurrentViewIndex] = useState(0)
    const [data, setData] = useState<HospitalData>(DEFAULT_DATA)
    const [lastUpdate, setLastUpdate] = useState(new Date())
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'syncing'>('connected')
    const [isAutoRotating, setIsAutoRotating] = useState(true)
    const [rotationInterval, setRotationInterval] = useState(30)
    const [isAdminMode, setIsAdminMode] = useState(false)

    const VIEWS = [
        { id: "overview", name: "Overview", icon: <Monitor className="h-4 w-4" /> },
        { id: "queue", name: "Queue", icon: <Users className="h-4 w-4" /> },
        { id: "ot", name: "OT Status", icon: <Activity className="h-4 w-4" /> },
        { id: "emergency", name: "Emergency", icon: <AlertTriangle className="h-4 w-4" /> },
        { id: "inventory", name: "Inventory", icon: <Pill className="h-4 w-4" /> },
        { id: "departments", name: "Departments", icon: <MapPin className="h-4 w-4" /> },
        { id: "education", name: "Health Education", icon: <Heart className="h-4 w-4" /> }
    ]

    useEffect(() => {
        const loadData = async () => {
            setConnectionStatus('syncing')
            try {
                const newData = await fetchAllData()
                setData(newData)
                setLastUpdate(new Date())
                setConnectionStatus('connected')
            } catch (error) {
                console.error("Error loading data:", error)
                setConnectionStatus('disconnected')
            }
        }

        loadData()

        const timeTimer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timeTimer)
    }, [])

    useEffect(() => {
        if (!isAutoRotating) return

        const viewTimer = setInterval(() => {
            setCurrentViewIndex(prev => (prev + 1) % VIEWS.length)
        }, rotationInterval * 1000)

        return () => clearInterval(viewTimer)
    }, [isAutoRotating, rotationInterval, VIEWS.length])

    useEffect(() => {
        const updateData = async () => {
            setConnectionStatus('syncing')
            try {
                const newData = await fetchAllData()
                setData(newData)
                setLastUpdate(new Date())
                setConnectionStatus('connected')
            } catch (error) {
                console.error("Error updating data:", error)
                setConnectionStatus('disconnected')
            }
        }

        const dataTimer = setInterval(updateData, 15000)
        return () => clearInterval(dataTimer)
    }, [])

    const getActiveAlerts = () => data.emergencyAlerts.filter(alert => alert.status === 'Active')
    const hasActiveAlerts = getActiveAlerts().length > 0

    const getCriticalItems = () => {
        const criticalDrugs = data.drugInventory.filter(drug => drug.status === 'Critical')
        const criticalBlood = data.bloodBank.filter(blood => blood.status === 'Critical')
        return [...criticalDrugs, ...criticalBlood]
    }

    const renderOverviewView = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-5xl font-bold text-blue-600 mb-2">Hospital Overview</h1>
                <p className="text-xl text-gray-600">Real-time system status</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 border-blue-400">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Tokens</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {data.tokenQueue.filter(t => t.status !== 'Completed').length}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-green-400">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active OTs</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {data.otStatus.filter(ot => ot.status === 'In Progress').length}/4
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-red-400">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Critical Items</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {getCriticalItems().length}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-purple-400">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Alerts</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {getActiveAlerts().length}
                                </p>
                            </div>
                            <Shield className="h-8 w-8 text-purple-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Department Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.departments.map(dept => (
                                <div key={dept.dept_id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{dept.department_name}</p>
                                        <p className="text-sm text-gray-600">{dept.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{dept.current_tokens} tokens</p>
                                        <p className="text-sm text-gray-600">{dept.avg_wait_time}min avg</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Blood Bank Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.bloodBank.map(blood => (
                                <div key={blood.blood_id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{blood.blood_type}</p>
                                        <p className="text-sm text-gray-600">
                                            Expires: {new Date(blood.expiry_date || '').toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{blood.units_available} units</p>
                                        <Badge variant={blood.status === 'Critical' ? 'destructive' : 'secondary'}>
                                            {blood.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

    const renderQueueView = () => {
        const activeTokens = data.tokenQueue.filter(t => t.status !== 'Completed').slice(0, 4)

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-blue-600 mb-2">Patient Queue</h1>
                    <p className="text-xl text-gray-600">Current wait times and status</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {activeTokens.map((token, index) => {
                        const department = data.departments.find(d => d.dept_id === token.dept_id)
                        const statusColor = token.status === 'Current' ? 'green' :
                            token.status === 'Next' ? 'yellow' : 'gray'

                        return (
                            <Card key={token.token_id} className={`border-4 border-${statusColor}-400 bg-${statusColor}-50`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`text-3xl font-bold px-4 py-2 rounded-lg bg-${statusColor}-500 text-white`}>
                                                {token.token_id}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">{token.patient_name}</h2>
                                                <p className="text-lg text-gray-600">{department?.department_name}</p>
                                                <p className="text-sm text-gray-500">{department?.location}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className={`text-lg px-3 py-1 border-${statusColor}-500 text-${statusColor}-700`}>
                                                {token.status}
                                            </Badge>
                                            {token.estimated_wait !== undefined && token.estimated_wait > 0 && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Est. wait: {token.estimated_wait} min
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderOTView = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-5xl font-bold text-blue-600 mb-2">Operation Theater Status</h1>
                <p className="text-xl text-gray-600">Live surgical department updates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.otStatus.map((ot) => (
                    <Card key={ot.ot_id} className="border-4 border-blue-400">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">{ot.ot_id}</CardTitle>
                            <Badge variant="outline" className={`text-lg px-3 py-1 ${ot.status === "In Progress" ? "border-green-500 text-green-700 bg-green-100" :
                                ot.status === "Pre-Op" ? "border-yellow-500 text-yellow-700 bg-yellow-100" :
                                    ot.status === "Post-Op" ? "border-blue-500 text-blue-700 bg-blue-100" :
                                        "border-gray-500 text-gray-700 bg-gray-100"
                                }`}>
                                {ot.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-center">
                                <p className="text-lg font-medium">Patient: {ot.patient_name}</p>
                                <p className="text-md text-gray-600">Procedure: {ot.procedure}</p>
                                <p className="text-sm text-gray-500">Surgeon: {ot.surgeon}</p>
                            </div>

                            {ot.status === "In Progress" && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>{ot.progress}%</span>
                                    </div>
                                    <Progress value={ot.progress} className="h-3" />
                                </div>
                            )}

                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Start: {ot.start_time}</span>
                                <span>Est. End: {ot.estimated_end}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )

    const renderEmergencyView = () => {
        const activeAlerts = getActiveAlerts()

        return (
            <div className="space-y-6">
                {activeAlerts.length > 0 ? (
                    <Card className="border-4 border-red-500 bg-red-50 animate-pulse">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-center space-x-4">
                                <AlertTriangle className="h-16 w-16 text-red-600" />
                                <div className="text-center">
                                    <h1 className="text-6xl font-bold text-red-600 mb-2">{activeAlerts[0].code_type}</h1>
                                    <p className="text-3xl text-red-700">Location: {activeAlerts[0].department}</p>
                                    <p className="text-xl text-red-600">
                                        Alert issued at {new Date(activeAlerts[0].timestamp).toLocaleTimeString()}
                                    </p>
                                    <Badge variant="destructive" className="text-lg px-4 py-2 mt-2">
                                        {activeAlerts[0].severity} PRIORITY
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-4 border-green-500 bg-green-50">
                        <CardContent className="p-8 text-center">
                            <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h1 className="text-5xl font-bold text-green-600 mb-2">All Clear</h1>
                            <p className="text-2xl text-green-700">No active emergency alerts</p>
                        </CardContent>
                    </Card>
                )}

                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Emergency Response Codes</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { code: "Code Blue", desc: "Cardiac/Respiratory Emergency", color: "blue" },
                            { code: "Code Red", desc: "Fire Emergency", color: "red" },
                            { code: "Code Pink", desc: "Child Abduction", color: "pink" },
                            { code: "Code Yellow", desc: "Bomb Threat", color: "yellow" }
                        ].map(emergency => (
                            <Card key={emergency.code} className={`border-2 border-${emergency.color}-400`}>
                                <CardContent className="p-4 text-center">
                                    <h3 className={`font-bold text-${emergency.color}-600 text-lg`}>{emergency.code}</h3>
                                    <p className="text-sm text-gray-600">{emergency.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderInventoryView = () => {
        const criticalItems = getCriticalItems()

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-blue-600 mb-2">Critical Inventory Alerts</h1>
                    <p className="text-xl text-gray-600">Items requiring immediate attention</p>
                </div>

                {criticalItems.length > 0 ? (
                    <div className="space-y-4">
                        {data.drugInventory.filter(drug => drug.status === 'Critical').map((drug) => (
                            <Card key={drug.drug_id} className="border-4 border-red-400 bg-red-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <Pill className="h-12 w-12 text-red-600" />
                                            <div>
                                                <h2 className="text-3xl font-bold">{drug.drug_name}</h2>
                                                <p className="text-xl text-gray-600">{drug.stock_qty} units remaining</p>
                                                <p className="text-sm text-gray-500">
                                                    Reorder level: {drug.reorder_level} units
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Last updated: {new Date(drug.last_updated || '').toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="destructive" className="text-xl px-4 py-2">
                                            {drug.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {data.bloodBank.filter(blood => blood.status === 'Critical').map((blood) => (
                            <Card key={blood.blood_id} className="border-4 border-red-400 bg-red-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <Heart className="h-12 w-12 text-red-600" />
                                            <div>
                                                <h2 className="text-3xl font-bold">Blood Type: {blood.blood_type}</h2>
                                                <p className="text-xl text-gray-600">Only {blood.units_available} units available</p>
                                                <p className="text-sm text-gray-500">
                                                    Critical level: {blood.critical_level} units
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Expires: {new Date(blood.expiry_date || '').toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="destructive" className="text-xl px-4 py-2">
                                            {blood.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-4 border-green-500 bg-green-50">
                        <CardContent className="p-8 text-center">
                            <Pill className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h1 className="text-4xl font-bold text-green-600 mb-2">All Inventory Levels Normal</h1>
                            <p className="text-xl text-green-700">No critical shortages detected</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    const getCurrentView = () => {
        // Emergency alerts override normal rotation when active
        // if (hasActiveAlerts && VIEWS[currentViewIndex].id !== 'emergency') {
        //     return renderEmergencyView()
        // }

        switch (VIEWS[currentViewIndex].id) {
            case "overview": return renderOverviewView()
            case "queue": return renderQueueView()
            case "ot": return renderOTView()
            case "emergency": return renderEmergencyView()
            case "inventory": return renderInventoryView()
            case "departments": return renderDepartmentView()
            case "education": return renderEducationView()
            default: return renderOverviewView()
        }
    }

    const renderDepartmentView = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-5xl font-bold text-blue-600 mb-2">Department Information</h1>
                <p className="text-xl text-gray-600">Detailed department status and resources</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.departments.map(dept => (
                    <Card key={dept.dept_id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-2xl">{dept.department_name}</CardTitle>
                            <Badge variant="outline" className="w-fit">
                                {dept.dept_id}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium">{dept.location}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Tokens:</span>
                                <span className="font-medium">{dept.current_tokens}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Avg Wait Time:</span>
                                <span className="font-medium">{dept.avg_wait_time} min</span>
                            </div>
                            <div className="pt-4">
                                <Progress value={(dept.current_tokens / 10) * 100} className="h-2" />
                                <p className="text-sm text-gray-600 text-center mt-1">
                                    {dept.current_tokens}/10 capacity
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )

    const renderEducationView = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-5xl font-bold text-blue-600 mb-2">Health Education</h1>
                <p className="text-xl text-gray-600">Important health information for patients</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <Heart className="h-5 w-5" />
                            Heart Health Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Exercise for at least 30 minutes daily</li>
                            <li>Eat a balanced diet low in saturated fats</li>
                            <li>Monitor your blood pressure regularly</li>
                            <li>Avoid smoking and limit alcohol consumption</li>
                            <li>Manage stress through relaxation techniques</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-2 border-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Pill className="h-5 w-5" />
                            Medication Safety
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Always take medications as prescribed</li>
                            <li>Keep an updated list of all your medications</li>
                            <li>Store medicines in a cool, dry place</li>
                            <li>Never share prescription medications</li>
                            <li>Ask your doctor about potential side effects</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-2 border-yellow-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-700">
                            <Shield className="h-5 w-5" />
                            Preventive Care
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Schedule regular health check-ups</li>
                            <li>Stay up-to-date with vaccinations</li>
                            <li>Practice good hygiene to prevent infections</li>
                            <li>Get adequate sleep (7-9 hours for adults)</li>
                            <li>Maintain a healthy weight</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-2 border-red-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Emergency Signs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Chest pain or pressure</li>
                            <li>Difficulty breathing</li>
                            <li>Sudden severe headache</li>
                            <li>Uncontrolled bleeding</li>
                            <li>Sudden weakness or numbness</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <Heart className="h-12 w-12 text-blue-600" />
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">WENLOCK HOSPITAL</h1>
                        <p className="text-xl text-gray-600">Unified Display & Alert System</p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    {isAdminMode && (
                        <Button
                            variant="outline"
                            onClick={() => setIsAutoRotating(!isAutoRotating)}
                            className="flex items-center gap-2"
                        >
                            <Sliders className="h-4 w-4" />
                            {isAutoRotating ? 'Pause Rotation' : 'Resume Rotation'}
                        </Button>
                    )}

                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                            connectionStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                            }`} />
                        <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
                    </div>

                    <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{currentTime.toLocaleTimeString("en-IN")}</p>
                        <p className="text-lg text-gray-600">{currentTime.toLocaleDateString("en-IN")}</p>
                    </div>
                </div>
            </header>

            {isAdminMode && (
                <div className="mb-6 p-4 bg-white rounded-lg shadow">
                    <div className="flex justify-between items-center">
                        <ToggleGroup
                            type="single"
                            value={VIEWS[currentViewIndex].id}
                            onValueChange={(value: any) => {
                                const index = VIEWS.findIndex(v => v.id === value)
                                if (index >= 0) setCurrentViewIndex(index)
                            }}
                            className="flex-wrap justify-start"
                        >
                            {VIEWS.map(view => (
                                <ToggleGroupItem key={view.id} value={view.id} className="flex items-center gap-2">
                                    {view.icon}
                                    {view.name}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Rotation:</span>
                                <select
                                    title="Rotation Interval"
                                    value={rotationInterval}
                                    onChange={(e) => setRotationInterval(Number(e.target.value))}
                                    className="border rounded px-2 py-1 text-sm"
                                >
                                    <option value="10">10s</option>
                                    <option value="20">20s</option>
                                    <option value="30">30s</option>
                                    <option value="60">1m</option>
                                    <option value="120">2m</option>
                                </select>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => setIsAdminMode(false)}
                                className="text-red-600"
                            >
                                Exit Admin
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-center mb-4">
                <div className="flex space-x-2">
                    {VIEWS.map((_, index) => (
                        <div
                            key={index}
                            className={`w-3 h-3 rounded-full transition-colors ${index === currentViewIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
            </div>

            {hasActiveAlerts && (
                <div className="mb-4">
                    <Card className="border-2 border-red-500 bg-red-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-center space-x-2 text-red-700">
                                <Bell className="h-5 w-5 animate-pulse" />
                                <span className="font-bold">EMERGENCY ALERT ACTIVE</span>
                                <Bell className="h-5 w-5 animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <main className="mb-8">
                {getCurrentView()}
            </main>

            <footer className="border-t pt-4">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-8 text-lg text-gray-600">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>{data.tokenQueue.filter(t => t.status !== 'Completed').length} Active Tokens</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Monitor className="h-5 w-5" />
                            <span>{data.otStatus.filter(ot => ot.status === 'In Progress').length}/4 OTs Active</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span>{getCriticalItems().length} Critical Items</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-gray-500">
                            <p>Last Updated: {lastUpdate.toLocaleTimeString()}</p>
                            <p>Current View: {VIEWS[currentViewIndex].name}</p>
                        </div>
                        {!isAdminMode && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsAdminMode(true)}
                                className="mt-1 text-blue-600"
                            >
                                Admin Access
                            </Button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    )
}