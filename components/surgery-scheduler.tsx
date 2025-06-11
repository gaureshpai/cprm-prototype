"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, User, MapPin, FileText, AlertTriangle, X, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { scheduleSurgeryAction } from "@/lib/ot-actions"
import { useAuth } from "@/hooks/use-auth"
import { Doctor, Patient, SurgerySchedulerProps } from "@/lib/helpers"
import { getPriorityColor } from "@/lib/functions"

export function SurgeryScheduler({ onSuccess, onCancel, availableTheaters }: SurgerySchedulerProps) {
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<Patient[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [selectedDoctors, setSelectedDoctors] = useState<string[]>([])
    const [doctorSearchTerm, setDoctorSearchTerm] = useState("")
    const [formData, setFormData] = useState({
        patientId: "",
        theaterId: "",
        date: "",
        time: "",
        procedure: "",
        estimatedDuration: "",
        priority: "normal",
        notes: "",
    })

    const { toast } = useToast()
    const { user } = useAuth()

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch("/api/patients")
                if (response.ok) {
                    const patientsData = await response.json()
                    const formattedPatients: Patient[] = patientsData.map((patient: any) => ({
                        id: patient.id,
                        name: patient.name,
                        age: patient.age,
                        condition: patient.condition || "General consultation",
                        priority: patient.condition?.toLowerCase().includes("critical")
                            ? "critical"
                            : patient.condition?.toLowerCase().includes("urgent") ||
                                patient.condition?.toLowerCase().includes("emergency")
                                ? "high"
                                : patient.condition?.toLowerCase().includes("severe")
                                    ? "medium"
                                    : "low",
                    }))
                    setPatients(formattedPatients)
                } else {
                    throw new Error("Failed to fetch patients")
                }
            } catch (error) {
                console.error("Error fetching patients:", error)
                toast({
                    title: "Warning",
                    description: "Could not load patient data. Using fallback data.",
                    variant: "destructive",
                })
                setPatients([
                    {
                        id: "fallback-1",
                        name: "Emergency Patient",
                        condition: "Requires immediate attention",
                        priority: "critical",
                    },
                    { id: "fallback-2", name: "Scheduled Patient", condition: "Routine procedure", priority: "medium" },
                ])
            }
        }

        const fetchDoctors = async () => {
            try {
                const response = await fetch("/api/doctors")
                if (response.ok) {
                    const doctorsData = await response.json()
                    setDoctors(doctorsData)
                    
                    if (user?.role === "doctor") {
                        const currentDoctor = doctorsData.find((doc: Doctor) => doc.name === user.name)
                        if (currentDoctor) {
                            setSelectedDoctors([currentDoctor.id])
                        }
                    }
                } else {
                    throw new Error("Failed to fetch doctors")
                }
            } catch (error) {
                console.error("Error fetching doctors:", error)
                toast({
                    title: "Warning",
                    description: "Could not load doctor data.",
                    variant: "destructive",
                })
                
                setDoctors([
                    { id: "doctor-1", name: "Dr. Smith", department: "Surgery" },
                    { id: "doctor-2", name: "Dr. Johnson", department: "Cardiology" },
                    { id: "doctor-3", name: "Dr. Williams", department: "Orthopedics" },
                ])
            }
        }

        fetchPatients()
        fetchDoctors()
    }, [toast, user])

    const filteredPatients = patients.filter(
        (patient) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const filteredDoctors = doctors.filter(
        (doctor) =>
            doctor.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
            (doctor.department && doctor.department.toLowerCase().includes(doctorSearchTerm.toLowerCase())),
    )

    const selectedPatient = patients.find((p) => p.id === formData.patientId)
    const selectedTheater = availableTheaters.find((t) => t.id === formData.theaterId)

    const handleDoctorToggle = (doctorId: string) => {
        setSelectedDoctors((prev) => (prev.includes(doctorId) ? prev.filter((id) => id !== doctorId) : [...prev, doctorId]))
    }

    const removeDoctorSelection = (doctorId: string) => {
        setSelectedDoctors((prev) => prev.filter((id) => id !== doctorId))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (
            !formData.patientId ||
            selectedDoctors.length === 0 ||
            !formData.theaterId ||
            !formData.date ||
            !formData.time ||
            !formData.procedure
        ) {
            toast({
                title: "Error",
                description: "Please fill in all required fields including at least one doctor",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            const scheduledDateTime = new Date(`${formData.date}T${formData.time}`)

            if (scheduledDateTime <= new Date()) {
                toast({
                    title: "Error",
                    description: "Cannot schedule surgery in the past",
                    variant: "destructive",
                })
                setLoading(false)
                return
            }
            
            const response = await fetch("/api/theaters/check-conflict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    theaterId: formData.theaterId,
                    scheduledTime: scheduledDateTime.toISOString(),
                    estimatedDuration: formData.estimatedDuration,
                }),
            })

            if (response.ok) {
                const { hasConflict } = await response.json()
                if (hasConflict) {
                    toast({
                        title: "Scheduling Conflict",
                        description:
                            "This theater is already booked for the selected time. Please choose a different time or theater.",
                        variant: "destructive",
                    })
                    setLoading(false)
                    return
                }
            }

            const formDataToSubmit = new FormData()
            formDataToSubmit.append("patientId", formData.patientId)
            formDataToSubmit.append("theaterId", formData.theaterId)
            formDataToSubmit.append("procedure", formData.procedure)
            formDataToSubmit.append("surgeonId", selectedDoctors[0]) 
            formDataToSubmit.append("surgeonIds", JSON.stringify(selectedDoctors)) 
            formDataToSubmit.append("scheduledTime", scheduledDateTime.toISOString())
            formDataToSubmit.append("estimatedDuration", formData.estimatedDuration)
            formDataToSubmit.append("priority", formData.priority)
            formDataToSubmit.append("notes", formData.notes)

            const result = await scheduleSurgeryAction(formDataToSubmit)

            if (result.success) {
                toast({
                    title: "Success",
                    description: `Surgery scheduled successfully for ${selectedPatient?.name}`,
                })
                onSuccess()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to schedule surgery",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error scheduling surgery:", error)
            toast({
                title: "Error",
                description: "Failed to schedule surgery",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="patient-search">Select Patient *</Label>
                        <Input
                            id="patient-search"
                            placeholder="Search patients by name or condition..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <div className="max-h-40 overflow-y-auto border rounded-md">
                                {filteredPatients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${formData.patientId === patient.id ? "bg-blue-50 border-blue-200" : ""
                                            }`}
                                        onClick={() => {
                                            setFormData({ ...formData, patientId: patient.id })
                                            setSearchTerm("")
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{patient.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {patient.age && `Age: ${patient.age} • `}
                                                    {patient.condition}
                                                </p>
                                            </div>
                                            <Badge className={getPriorityColor(patient.priority)}>{patient.priority}</Badge>
                                        </div>
                                    </div>
                                ))}
                                {filteredPatients.length === 0 && (
                                    <div className="p-3 text-center text-gray-500">No patients found matching your search</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="doctor-search">Select Doctors/Surgeons *</Label>

                        {selectedDoctors.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                {selectedDoctors.map((doctorId) => {
                                    const doctor = doctors.find((d) => d.id === doctorId)
                                    return doctor ? (
                                        <div key={doctorId} className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                                            <User className="h-3 w-3" />
                                            <span className="text-sm font-medium">{doctor.name}</span>
                                            {doctor.department && <span className="text-xs text-gray-600">({doctor.department})</span>}
                                            <button
                                                title="Remove"
                                                type="button"
                                                onClick={() => removeDoctorSelection(doctorId)}
                                                className="ml-1 text-gray-500 hover:text-red-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : null
                                })}
                            </div>
                        )}

                        <Input
                            id="doctor-search"
                            placeholder="Search doctors by name or department..."
                            value={doctorSearchTerm}
                            onChange={(e) => setDoctorSearchTerm(e.target.value)}
                        />

                        {doctorSearchTerm && (
                            <div className="max-h-60 overflow-y-auto border rounded-md">
                                {filteredDoctors.map((doctor) => (
                                    <div key={doctor.id} className="p-3 border-b hover:bg-gray-50 flex items-center space-x-3">
                                        <Checkbox
                                            id={`doctor-${doctor.id}`}
                                            checked={selectedDoctors.includes(doctor.id)}
                                            onCheckedChange={() => handleDoctorToggle(doctor.id)}
                                        />
                                        <label htmlFor={`doctor-${doctor.id}`} className="flex-1 cursor-pointer">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{doctor.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {doctor.department && `Department: ${doctor.department}`}
                                                        {doctor.email && ` • ${doctor.email}`}
                                                    </p>
                                                </div>
                                                {selectedDoctors.includes(doctor.id) && (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                        Selected
                                                    </Badge>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                ))}
                                {filteredDoctors.length === 0 && (
                                    <div className="p-3 text-center text-gray-500">No doctors found matching your search</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="theater">Operating Theater *</Label>
                        <Select
                            value={formData.theaterId}
                            onValueChange={(value) => setFormData({ ...formData, theaterId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select available theater" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTheaters.length > 0 ? (
                                    availableTheaters
                                        .filter((theater) => theater.status === "available")
                                        .map((theater) => (
                                            <SelectItem key={theater.id} value={theater.id}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{theater.name}</span>
                                                    <Badge variant="outline" className="ml-2 text-green-600">
                                                        Available
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))
                                ) : (
                                    <SelectItem value="no-theaters" disabled>
                                        No theaters available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {availableTheaters.length === 0 && (
                            <p className="text-sm text-orange-600 flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                No theaters currently available for scheduling
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time *</Label>
                            <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="procedure">Procedure *</Label>
                        <Input
                            id="procedure"
                            placeholder="e.g., Appendectomy, Gallbladder Surgery"
                            value={formData.procedure}
                            onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Estimated Duration</Label>
                            <Select
                                value={formData.estimatedDuration}
                                onValueChange={(value) => setFormData({ ...formData, estimatedDuration: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.5 hours">30 minutes</SelectItem>
                                    <SelectItem value="1 hours">1 hour</SelectItem>
                                    <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                                    <SelectItem value="2 hours">2 hours</SelectItem>
                                    <SelectItem value="3 hours">3 hours</SelectItem>
                                    <SelectItem value="4 hours">4 hours</SelectItem>
                                    <SelectItem value="5 hours">5+ hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any special instructions or notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || availableTheaters.length === 0 || selectedDoctors.length === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? "Scheduling..." : "Schedule Surgery"}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <FileText className="mr-2 h-5 w-5" />
                            Surgery Summary
                        </CardTitle>
                        <CardDescription>Review the surgery details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedPatient && (
                            <div className="flex items-center space-x-3">
                                <User className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="font-medium">{selectedPatient.name}</p>
                                    <p className="text-sm text-gray-600">{selectedPatient.condition}</p>
                                    <Badge className={getPriorityColor(selectedPatient.priority)}>{selectedPatient.priority}</Badge>
                                </div>
                            </div>
                        )}

                        {selectedDoctors.length > 0 && (
                            <div className="flex items-start space-x-3">
                                <Users className="h-4 w-4 text-gray-500 mt-1" />
                                <div className="flex-1">
                                    <p className="font-medium">Medical Team ({selectedDoctors.length})</p>
                                    <div className="space-y-1">
                                        {selectedDoctors.map((doctorId, index) => {
                                            const doctor = doctors.find((d) => d.id === doctorId)
                                            return doctor ? (
                                                <div key={doctorId} className="text-sm text-gray-600">
                                                    <span className="font-medium">{index === 0 ? "Primary Surgeon: " : "Assistant: "}</span>
                                                    {doctor.name}
                                                    {doctor.department && ` (${doctor.department})`}
                                                </div>
                                            ) : null
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedTheater && (
                            <div className="flex items-center space-x-3">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="font-medium">{selectedTheater.name}</p>
                                    {selectedTheater.lastCleaned && (
                                        <p className="text-sm text-gray-600">Last cleaned: {selectedTheater.lastCleaned}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {formData.date && formData.time && (
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="font-medium">
                                        {new Date(`${formData.date}T${formData.time}`).toLocaleDateString("en-IN", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(`${formData.date}T${formData.time}`).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {formData.procedure && (
                            <div className="flex items-center space-x-3">
                                <AlertTriangle className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="font-medium">{formData.procedure}</p>
                                    {formData.estimatedDuration && (
                                        <p className="text-sm text-gray-600">Duration: {formData.estimatedDuration}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {formData.priority !== "normal" && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <div className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                                    <span className="text-sm font-medium text-yellow-800">
                                        {formData.priority.toUpperCase()} Priority Surgery
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Available Theaters ({availableTheaters.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {availableTheaters.length > 0 ? (
                            availableTheaters.map((theater) => (
                                <div key={theater.id} className="flex items-center justify-between text-sm">
                                    <span>{theater.name}</span>
                                    <Badge variant="outline" className="text-green-600">
                                        Available
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No theaters currently available</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}