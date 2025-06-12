"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
    Activity,
    Thermometer,
    Heart,
    AlertTriangle,
    Users,
    Calendar,
    Edit,
    Stethoscope,
    Droplets,
    RefreshCw,
} from "lucide-react"
import type { NurseDashboardData, Patient } from "@/lib/nurse-service"
import {
    updatePatientAction,
    updatePatientVitalsAction,
    administerMedicationAction,
    completeTaskAction,
    refreshDashboardAction,
} from "@/lib/nurse-actions"
import { EmergencyAlertsModal } from "./emergency-alerts-modal"
import { getConditionColor, getSurgeryStatusColor } from "@/lib/functions"

export default function NurseDashboardContent({ initialData }: { initialData: NurseDashboardData }) {
    const { toast } = useToast()
    const [patients, setPatients] = useState(initialData.patients)
    const [surgeries, setSurgeries] = useState(initialData.surgeries)
    const [tasks, setTasks] = useState(initialData.tasks)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false)
    const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [currentDate] = useState(new Date())
    const [isEmergencyAlertsModalOpen, setIsEmergencyAlertsModalOpen] = useState(false)

    const [patientForm, setPatientForm] = useState({
        name: "",
        age: "",
        gender: "",
        condition: "",
        notes: "",
    })

    const [vitalsForm, setVitalsForm] = useState({
        temp: "",
        bp: "",
        pulse: "",
        spo2: "",
        notes: "",
    })

    const handleRefreshDashboard = async () => {
        setIsRefreshing(true)
        try {
            const result = await refreshDashboardAction()
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Dashboard refreshed successfully",
                })

                window.location.reload()
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to refresh dashboard",
                variant: "destructive",
            })
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleUpdatePatient = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPatient) return

        try {
            const result = await updatePatientAction(selectedPatient.id, patientForm)

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Patient details updated successfully",
                })

                setPatients(
                    patients.map((p) =>
                        p.id === selectedPatient.id
                            ? {
                                ...p,
                                name: patientForm.name,
                                age: Number.parseInt(patientForm.age),
                                gender: patientForm.gender,
                                condition: patientForm.condition,
                                notes: patientForm.notes,
                            }
                            : p,
                    ),
                )

                setIsPatientDialogOpen(false)
                setPatientForm({ name: "", age: "", gender: "", condition: "", notes: "" })
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to update patient details",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error updating patient:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        }
    }

    const handleUpdateVitals = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPatient) return

        try {
            const result = await updatePatientVitalsAction(selectedPatient.id, vitalsForm)

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Patient vitals updated successfully",
                })

                setPatients(
                    patients.map((p) =>
                        p.id === selectedPatient.id
                            ? {
                                ...p,
                                vitals: {
                                    ...p.vitals,
                                    temp: vitalsForm.temp,
                                    bp: vitalsForm.bp,
                                    pulse: vitalsForm.pulse,
                                    spo2: vitalsForm.spo2,
                                    lastUpdated: new Date().toISOString(),
                                },
                            }
                            : p,
                    ),
                )

                setIsVitalsDialogOpen(false)
                setVitalsForm({ temp: "", bp: "", pulse: "", spo2: "", notes: "" })
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to update vitals",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error updating vitals:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        }
    }

    const openPatientDialog = (patient: Patient) => {
        setSelectedPatient(patient)
        setPatientForm({
            name: patient.name,
            age: patient.age.toString(),
            gender: patient.gender,
            condition: patient.condition,
            notes: patient.notes || "",
        })
        setIsPatientDialogOpen(true)
    }

    const openVitalsDialog = (patient: Patient) => {
        setSelectedPatient(patient)
        setVitalsForm({
            temp: patient.vitals.temp,
            bp: patient.vitals.bp,
            pulse: patient.vitals.pulse,
            spo2: patient.vitals.spo2,
            notes: "",
        })
        setIsVitalsDialogOpen(true)
    }

    const criticalPatients = patients.filter((p) => p.condition.toLowerCase() === "critical")
    const todaySurgeries = surgeries.filter((s) => s.status !== "cancelled")

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Nurse Dashboard</h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        {currentDate.toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={handleRefreshDashboard}
                        disabled={isRefreshing}
                        className="w-full sm:w-auto"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEmergencyAlertsModalOpen(true)}
                        className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                    >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Emergency Alerts
                    </Button>
                </div>
            </div>

            <EmergencyAlertsModal isOpen={isEmergencyAlertsModalOpen} onClose={() => setIsEmergencyAlertsModalOpen(false)} />

            {criticalPatients.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        <strong>Critical Patients:</strong> {criticalPatients.length} patients require immediate attention.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patients.length}</div>
                        <p className="text-xs text-muted-foreground">{criticalPatients.length} critical</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Surgeries</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todaySurgeries.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {surgeries.filter((s) => s.status === "in-progress").length} in progress
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="patients" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-white">
                    <TabsTrigger value="patients">Patients</TabsTrigger>
                    <TabsTrigger value="surgeries">OT Updates</TabsTrigger>
                </TabsList>

                <TabsContent value="patients" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <span>Patient Details</span>
                            </CardTitle>
                            <CardDescription>Monitor and update patient information from database</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {patients.map((patient) => (
                                    <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                                            {patient.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                                                        <CardDescription>
                                                            {patient.age} yrs • {patient.gender} • Bed {patient.bed}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Badge className={getConditionColor(patient.condition)}>
                                                    {patient.condition}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="font-medium">Doctor:</span>
                                                    <div className="text-gray-600">{patient.doctor}</div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Department:</span>
                                                    <div className="text-gray-600">{patient.department}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Thermometer className="h-4 w-4 text-red-500" />
                                                    <div>
                                                        <div className="font-medium">Temp</div>
                                                        <div className="text-gray-600">{patient.vitals.temp}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Heart className="h-4 w-4 text-red-500" />
                                                    <div>
                                                        <div className="font-medium">BP</div>
                                                        <div className="text-gray-600">{patient.vitals.bp}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Activity className="h-4 w-4 text-blue-500" />
                                                    <div>
                                                        <div className="font-medium">Pulse</div>
                                                        <div className="text-gray-600">{patient.vitals.pulse}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Droplets className="h-4 w-4 text-blue-500" />
                                                    <div>
                                                        <div className="font-medium">SpO2</div>
                                                        <div className="text-gray-600">{patient.vitals.spo2}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => openPatientDialog(patient)}
                                                    className="flex-1"
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Update Details
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openVitalsDialog(patient)}
                                                    className="flex-1"
                                                >
                                                    <Stethoscope className="h-4 w-4 mr-1" />
                                                    Update Vitals
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="surgeries" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <span>Operating Theater Updates</span>
                            </CardTitle>
                            <CardDescription>Live surgery schedule from OT management system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {todaySurgeries.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No surgeries scheduled</h3>
                                        <p className="text-gray-600">No surgeries are scheduled for today.</p>
                                    </div>
                                ) : (
                                    todaySurgeries.map((surgery) => (
                                        <div key={surgery.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-center w-20">
                                                    <p className="font-medium text-gray-900">{surgery.scheduledTime}</p>
                                                    <p className="text-xs text-gray-500">{surgery.estimatedDuration}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{surgery.patientName}</p>
                                                    <p className="text-sm text-gray-600">{surgery.procedure}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {surgery.surgeon} • {surgery.theater}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={getSurgeryStatusColor(surgery.status)}>
                                                {surgery.status.replace("-", " ")}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Patient Details</DialogTitle>
                        <DialogDescription>Update patient information in the database</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdatePatient} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Patient Name</Label>
                                <Input
                                    id="name"
                                    value={patientForm.name}
                                    onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={patientForm.age}
                                    onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    title="gender"
                                    id="gender"
                                    value={patientForm.gender}
                                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <select
                                    title="condition"
                                    id="condition"
                                    value={patientForm.condition}
                                    onChange={(e) => setPatientForm({ ...patientForm, condition: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Select Condition</option>
                                    <option value="Stable">Stable</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Improving">Improving</option>
                                    <option value="Discharged">Discharged</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={patientForm.notes}
                                onChange={(e) => setPatientForm({ ...patientForm, notes: e.target.value })}
                                placeholder="Additional notes about the patient..."
                                rows={3}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Update Patient Details
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isVitalsDialogOpen} onOpenChange={setIsVitalsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Vitals - {selectedPatient?.name}</DialogTitle>
                        <DialogDescription>Update patient vital signs in the database</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateVitals} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="temp">Temperature</Label>
                                <Input
                                    id="temp"
                                    value={vitalsForm.temp}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, temp: e.target.value })}
                                    placeholder="98.6°F"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bp">Blood Pressure</Label>
                                <Input
                                    id="bp"
                                    value={vitalsForm.bp}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })}
                                    placeholder="120/80"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pulse">Pulse</Label>
                                <Input
                                    id="pulse"
                                    value={vitalsForm.pulse}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: e.target.value })}
                                    placeholder="72 bpm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spo2">SpO2</Label>
                                <Input
                                    id="spo2"
                                    value={vitalsForm.spo2}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })}
                                    placeholder="98%"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vitalsNotes">Notes (Optional)</Label>
                            <Textarea
                                id="vitalsNotes"
                                value={vitalsForm.notes}
                                onChange={(e) => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
                                placeholder="Any observations about the vitals..."
                                rows={3}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Update Vitals
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}