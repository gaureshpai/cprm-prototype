"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Clock, Users, Plus, RefreshCw, CheckCircle, X, Phone } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import {
    getAllActiveTokensAction,
    getTokenQueueByDepartmentAction,
    getTokenQueueStatsAction,
    createTokenAction,
    updateTokenStatusAction,
    cancelTokenAction,
    type TokenQueueData,
    type TokenQueueStats,
} from "@/lib/token-queue-actions"
import { getAllDepartmentsAction, type DepartmentData } from "@/lib/department-actions"
import { getAllPatientsAction } from "@/lib/patient-actions"

interface PatientData {
    id: string
    name: string
    age?: number
    gender?: string
    phone?: string
    condition?: string
}

export default function TokenQueuePage() {
    const [tokens, setTokens] = useState<TokenQueueData[]>([])
    const [departments, setDepartments] = useState<DepartmentData[]>([])
    const [patients, setPatients] = useState<PatientData[]>([])
    const [filteredPatients, setFilteredPatients] = useState<PatientData[]>([])
    const [stats, setStats] = useState<TokenQueueStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedDepartment, setSelectedDepartment] = useState("all")
    const [selectedPatient, setSelectedPatient] = useState("")
    const [patientSearch, setPatientSearch] = useState("")
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    useEffect(() => {
        loadTokenQueueData()
        loadDepartments()
        loadPatients()
    }, [])

    useEffect(() => {
        loadTokensByDepartment()
    }, [selectedDepartment])

    useEffect(() => {
        if (patientSearch.trim() === "") {
            setFilteredPatients(patients.slice(0, 20))
        } else {
            const filtered = patients.filter(
                (patient) =>
                    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                    patient.id.toLowerCase().includes(patientSearch.toLowerCase()),
            )
            setFilteredPatients(filtered.slice(0, 10))
        }
    }, [patientSearch, patients])

    const loadTokenQueueData = async () => {
        try {
            setLoading(true)
            startTransition(async () => {
                const [tokensResult, statsResult] = await Promise.all([getAllActiveTokensAction(), getTokenQueueStatsAction()])

                if (tokensResult.success && tokensResult.data) {
                    setTokens(tokensResult.data)
                }

                if (statsResult.success && statsResult.data) {
                    setStats(statsResult.data)
                }
            })
        } catch (error) {
            console.error("Error loading token queue data:", error)
            toast({
                title: "Error",
                description: "Failed to load token queue data",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const loadDepartments = async () => {
        try {
            const result = await getAllDepartmentsAction()
            if (result.success && result.data) {
                setDepartments(result.data.filter((dept) => dept.status === "Active"))
            }
        } catch (error) {
            console.error("Error loading departments:", error)
        }
    }

    const loadPatients = async () => {
        try {
            const result = await getAllPatientsAction(1, -100)
            console.log("Patients result:", result)

            if (result.success && result.data) {
                if (result.data.patients && Array.isArray(result.data.patients)) {
                    const patientList = result.data.patients.map((patient: any) => ({
                        id: patient.id,
                        name: patient.name,
                        age: patient.age,
                        gender: patient.gender,
                        phone: patient.phone,
                        condition: patient.condition,
                    }))
                    setPatients(patientList)
                    setFilteredPatients(patientList.slice(0, 20))
                } else if (Array.isArray(result.data)) {
                    setPatients(result.data)
                    setFilteredPatients(result.data.slice(0, 20))
                } else {
                    console.warn("Unexpected patients data structure:", result.data)
                    setPatients([])
                    setFilteredPatients([])
                }
            } else {
                console.warn("Failed to load patients:", result.error)
                setPatients([])
                setFilteredPatients([])
            }
        } catch (error) {
            console.error("Error loading patients:", error)
            setPatients([])
            setFilteredPatients([])
            toast({
                title: "Warning",
                description: "Failed to load patients list",
                variant: "destructive",
            })
        }
    }

    const loadTokensByDepartment = async () => {
        try {
            const result = await getTokenQueueByDepartmentAction(selectedDepartment)
            if (result.success && result.data) {
                setTokens(
                    result.data.filter(
                        (token) => token.status === "Waiting" || token.status === "Called" || token.status === "In Progress",
                    ),
                )
            }
        } catch (error) {
            console.error("Error loading tokens by department:", error)
        }
    }

    const handleCreateToken = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)

        const selectedPatientData = patients.find((p) => p.id === selectedPatient)
        if (!selectedPatientData) {
            toast({
                title: "Error",
                description: "Please select a valid patient",
                variant: "destructive",
            })
            return
        }

        formData.set("patientId", selectedPatientData.id)
        formData.set("patientName", selectedPatientData.name)

        try {
            startTransition(async () => {
                const result = await createTokenAction(formData)

                if (result.success) {
                    toast({
                        title: "Success",
                        description: `Token ${result.data?.tokenNumber} created successfully for ${selectedPatientData.name}`,
                    })
                    setIsCreateDialogOpen(false)
                    setSelectedPatient("")
                    setPatientSearch("")
                    await loadTokenQueueData()
                    await loadTokensByDepartment()
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to create token",
                        variant: "destructive",
                    })
                }
            })
        } catch (error) {
            console.error("Error creating token:", error)
            toast({
                title: "Error",
                description: "Failed to create token",
                variant: "destructive",
            })
        }
    }

    const handleUpdateTokenStatus = async (tokenId: string, status: TokenQueueData["status"]) => {
        try {
            startTransition(async () => {
                const result = await updateTokenStatusAction(tokenId, status)

                if (result.success) {
                    toast({
                        title: "Success",
                        description: `Token status updated to ${status}`,
                    })
                    await loadTokenQueueData()
                    await loadTokensByDepartment()
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to update token status",
                        variant: "destructive",
                    })
                }
            })
        } catch (error) {
            console.error("Error updating token status:", error)
            toast({
                title: "Error",
                description: "Failed to update token status",
                variant: "destructive",
            })
        }
    }

    const handleCancelToken = async (tokenId: string) => {
        try {
            startTransition(async () => {
                const result = await cancelTokenAction(tokenId)

                if (result.success) {
                    toast({
                        title: "Success",
                        description: "Token cancelled successfully",
                    })
                    await loadTokenQueueData()
                    await loadTokensByDepartment()
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to cancel token",
                        variant: "destructive",
                    })
                }
            })
        } catch (error) {
            console.error("Error cancelling token:", error)
            toast({
                title: "Error",
                description: "Failed to cancel token",
                variant: "destructive",
            })
        }
    }

    const getStatusColor = (status: TokenQueueData["status"]) => {
        switch (status) {
            case "Waiting":
                return "bg-yellow-500 text-white"
            case "Called":
                return "bg-blue-500 text-white"
            case "In Progress":
                return "bg-green-500 text-white"
            case "Completed":
                return "bg-gray-500 text-white"
            case "Cancelled":
                return "bg-red-500 text-white"
            default:
                return "bg-gray-500 text-white"
        }
    }

    const getPriorityColor = (priority: TokenQueueData["priority"]) => {
        switch (priority) {
            case "Emergency":
                return "bg-red-100 text-red-800 border-red-200"
            case "Urgent":
                return "bg-orange-100 text-orange-800 border-orange-200"
            case "Normal":
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const selectedPatientData = patients.find((p) => p.id === selectedPatient)

    return (
        <AuthGuard allowedRoles={["nurse", "admin"]} className="container mx-auto p-6 space-y-6">
            <Navbar />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Token Queue Management</h1>
                    <p className="text-gray-600">Manage patient queues and appointments</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={loadTokenQueueData} disabled={isPending}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Token
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Token</DialogTitle>
                                <DialogDescription>Generate a new token for patient queue management</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateToken} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="patientSelect">Select Patient</Label>
                                    <Select value={selectedPatient} onValueChange={setSelectedPatient} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a patient from search results" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredPatients.length > 0 ? (
                                                filteredPatients.map((patient) => (
                                                    <SelectItem key={patient.id} value={patient.id}>
                                                        {patient.name} (ID: {patient.id}){patient.age && ` - Age: ${patient.age}`}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="px-2 py-1.5 text-sm text-gray-500">
                                                    {patientSearch ? "No patients found matching your search" : "Start typing to search patients"}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500">
                                        Showing {filteredPatients.length} patient(s)
                                        {patients.length > 0 && ` out of ${patients.length} total`}
                                    </p>
                                </div>

                                {selectedPatientData && (
                                    <div className="p-3 bg-blue-50 rounded-lg border">
                                        <h4 className="font-medium text-blue-900">Selected Patient Details</h4>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                            <div>
                                                <span className="text-blue-700">Name:</span> {selectedPatientData.name}
                                            </div>
                                            <div>
                                                <span className="text-blue-700">ID:</span> {selectedPatientData.id}
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Age:</span> {selectedPatientData.age || "N/A"}
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Gender:</span> {selectedPatientData.gender || "N/A"}
                                            </div>
                                            {selectedPatientData.phone && (
                                                <div>
                                                    <span className="text-blue-700">Phone:</span> {selectedPatientData.phone}
                                                </div>
                                            )}
                                            {selectedPatientData.condition && (
                                                <div>
                                                    <span className="text-blue-700">Condition:</span> {selectedPatientData.condition}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="departmentId">Department</Label>
                                        <Select
                                            name="departmentId"
                                            required
                                            value={selectedDepartment !== "all" ? selectedDepartment : undefined}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select name="priority" defaultValue="Normal">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Normal">Normal</SelectItem>
                                                <SelectItem value="Urgent">Urgent</SelectItem>
                                                <SelectItem value="Emergency">Emergency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateDialogOpen(false)
                                            setSelectedPatient("")
                                            setPatientSearch("")
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending || !selectedPatient}>
                                        {isPending ? "Creating..." : "Create Token"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalTokens || 0}</div>
                        <p className="text-xs text-muted-foreground">All departments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Waiting</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats?.waitingTokens || 0}</div>
                        <p className="text-xs text-muted-foreground">In queue</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.inProgressTokens || 0}</div>
                        <p className="text-xs text-muted-foreground">Being served</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats?.averageWaitTime || 0)} min</div>
                        <p className="text-xs text-muted-foreground">Average wait</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center space-x-4">
                <Label htmlFor="departmentFilter">Select Department:</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-64">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Token Queue</CardTitle>
                    <CardDescription>
                        Current tokens in queue for{" "}
                        {selectedDepartment === "all"
                            ? "all departments"
                            : departments.find((d) => d.id === selectedDepartment)?.name}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tokens.length > 0 ? (
                            tokens
                                .sort((a, b) => {
                                    const priorityOrder = { Emergency: 3, Urgent: 2, Normal: 1 }
                                    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
                                    if (priorityDiff !== 0) return priorityDiff

                                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                                })
                                .map((token) => (
                                    <div
                                        key={token.id}
                                        className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">{token.tokenNumber}</div>
                                                <Badge className={getPriorityColor(token.priority)}>{token.priority}</Badge>
                                            </div>
                                            <div>
                                                <p className="font-medium">{token.patientName}</p>
                                                <p className="text-sm text-gray-600">Patient ID: {token.patientId}</p>
                                                <p className="text-sm text-gray-600">{token.departmentName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <Badge className={getStatusColor(token.status)}>{token.status}</Badge>
                                                <p className="text-sm text-gray-600 mt-1">Wait: {token.estimatedWaitTime} min</p>
                                                <p className="text-xs text-gray-500">
                                                    Created: {new Date(token.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>

                                            <div className="flex space-x-2">
                                                {token.status === "Waiting" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateTokenStatus(token.id, "Called")}
                                                        disabled={isPending}
                                                    >
                                                        <Phone className="h-4 w-4 mr-1" />
                                                        Call
                                                    </Button>
                                                )}

                                                {token.status === "Called" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateTokenStatus(token.id, "In Progress")}
                                                        disabled={isPending}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Start
                                                    </Button>
                                                )}

                                                {token.status === "In Progress" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUpdateTokenStatus(token.id, "Completed")}
                                                        disabled={isPending}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Complete
                                                    </Button>
                                                )}

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:text-red-700"
                                                            disabled={isPending}
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Cancel
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Cancel Token</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to cancel token {token.tokenNumber} for {token.patientName}? This
                                                                action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>No, Keep Token</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleCancelToken(token.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Yes, Cancel Token
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (loading || !tokens.length) ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Loading tokens</h3>
                                    <p className="text-gray-600">Please wait, tokens are being fetched...</p>
                                </div>
                        ): (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No active tokens</h3>
                                <p className="text-gray-600">
                                    {selectedDepartment === "all"
                                        ? "No tokens in queue for any department"
                                        : `No tokens in queue for ${departments.find((d) => d.id === selectedDepartment)?.name}`}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AuthGuard>
    )
}