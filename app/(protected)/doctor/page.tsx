"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  FileText,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  User,
  Pill,
  Loader2,
  Bell,
  X,
  Package,
  AlertCircle,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import {
  getDoctorAppointmentsAction,
  getDoctorPatientsAction,
  searchPatientsAction,
  createPrescriptionAction,
  getDoctorStatsAction,
  getAllDrugsForSelectionAction,
  updateAppointmentStatusAction,
  type PatientData,
  type AppointmentData,
} from "@/lib/doctor-actions"
import {
  getDoctorNotificationsAction,
  markNotificationReadAction,
  type NotificationData,
} from "@/lib/notification-actions"

interface Medication {
  id: string
  drugName: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  isCustom: boolean 
}

interface DrugOption {
  id: string
  drugName: string
  currentStock: number
  minStock: number
  status: string
  category?: string | null
  expiryDate?: Date | null
  location: string
  isAvailable: boolean
}

export default function DoctorDashboard() {
  const [currentDate] = useState(new Date())
  const { user } = useAuth()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [patients, setPatients] = useState<PatientData[]>([])
  const [stats, setStats] = useState<any>(null)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(true)

  
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
  const [patientSearch, setPatientSearch] = useState("")
  const [searchResults, setSearchResults] = useState<PatientData[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [availableDrugs, setAvailableDrugs] = useState<DrugOption[]>([])
  const [drugSearchQuery, setDrugSearchQuery] = useState("")

  
  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  
  useEffect(() => {
    if (dialogOpen) {
      loadAvailableDrugs()
    }
  }, [dialogOpen])

  
  useEffect(() => {
    if (drugSearchQuery.length >= 2) {
      loadAvailableDrugs(drugSearchQuery)
    } else if (drugSearchQuery.length === 0) {
      loadAvailableDrugs()
    }
  }, [drugSearchQuery])

  const loadDashboardData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      startTransition(async () => {
        const [appointmentsResult, patientsResult, statsResult, notificationsResult] = await Promise.all([
          getDoctorAppointmentsAction(user.id),
          getDoctorPatientsAction(user.id, 10),
          getDoctorStatsAction(user.id),
          getDoctorNotificationsAction(user.id),
        ])

        if (appointmentsResult.success && appointmentsResult.data) {
          setAppointments(appointmentsResult.data)
        }

        if (patientsResult.success && patientsResult.data) {
          setPatients(patientsResult.data)
        }

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data)
        }

        if (notificationsResult.success && notificationsResult.data) {
          setNotifications(notificationsResult.data)
        }
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableDrugs = async (query?: string) => {
    try {
      const result = await getAllDrugsForSelectionAction(query)
      if (result.success && result.data) {
        setAvailableDrugs(result.data)
      }
    } catch (error) {
      console.error("Error loading available drugs:", error)
    }
  }

  
  const handlePatientSearch = async (query: string) => {
    setPatientSearch(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const result = await searchPatientsAction(query, 10)
      if (result.success && result.data) {
        setSearchResults(result.data)
      }
    } catch (error) {
      console.error("Error searching patients:", error)
    }
  }

  
  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      drugName: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      isCustom: false,
    }
    setMedications([...medications, newMedication])
  }

  const updateMedication = (id: string, field: keyof Medication, value: string | boolean) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, [field]: value } : med)))
  }

  const removeMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id))
  }

  const handleDrugSelection = (medicationId: string, drugName: string) => {
    const isCustom = drugName === "OTHER"
    updateMedication(medicationId, "drugName", isCustom ? "" : drugName)
    updateMedication(medicationId, "isCustom", isCustom)
  }

  
  const handleSubmitPrescription = async () => {
    if (!selectedPatient || !user?.id) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      })
      return
    }

    if (medications.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one medication",
        variant: "destructive",
      })
      return
    }

    
    const invalidMedications = medications.filter((med) => !med.drugName.trim())
    if (invalidMedications.length > 0) {
      toast({
        title: "Error",
        description: "Please provide names for all medications",
        variant: "destructive",
      })
      return
    }

    try {
      startTransition(async () => {
        const formData = new FormData()
        formData.append("patientId", selectedPatient.id)
        formData.append("doctorId", user.id)
        formData.append("diagnosis", diagnosis)
        formData.append("notes", notes)
        formData.append("followUpDate", followUpDate)

        medications.forEach((med, index) => {
          formData.append(`medications[${index}][drugName]`, med.drugName)
          formData.append(`medications[${index}][dosage]`, med.dosage)
          formData.append(`medications[${index}][frequency]`, med.frequency)
          formData.append(`medications[${index}][duration]`, med.duration)
          formData.append(`medications[${index}][instructions]`, med.instructions)
        })

        const result = await createPrescriptionAction(formData)

        if (result.success) {
          toast({
            title: "Success",
            description: `Prescription created for ${selectedPatient.name}`,
          })

          
          setSelectedPatient(null)
          setMedications([])
          setDiagnosis("")
          setNotes("")
          setFollowUpDate("")
          setPatientSearch("")
          setSearchResults([])
          setDialogOpen(false)

          
          loadDashboardData()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create prescription",
            variant: "destructive",
          })
        }
      })
    } catch (error) {
      console.error("Error creating prescription:", error)
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      })
    }
  }

  
  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      startTransition(async () => {
        const result = await updateAppointmentStatusAction(appointmentId, status)
        if (result.success) {
          toast({
            title: "Success",
            description: "Appointment status updated",
          })
          loadDashboardData()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update appointment",
            variant: "destructive",
          })
        }
      })
    } catch (error) {
      console.error("Error updating appointment:", error)
    }
  }

  
  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      const result = await markNotificationReadAction(notificationId)
      if (result.success) {
        setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleDismissNotification = (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "appointment":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "prescription":
        return <Pill className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationBgColor = (type: string, priority: string) => {
    if (priority === "high") {
      return "bg-red-50 border-red-200"
    }
    switch (type) {
      case "emergency":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "appointment":
        return "bg-blue-50 border-blue-200"
      case "prescription":
        return "bg-green-50 border-green-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getDrugStockBadge = (drug: DrugOption) => {
    if (drug.currentStock <= 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Out of Stock
        </Badge>
      )
    } else if (drug.currentStock <= drug.minStock) {
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
          Low Stock ({drug.currentStock})
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
          In Stock ({drug.currentStock})
        </Badge>
      )
    }
  }

  return (
    <AuthGuard allowedRoles={["doctor"]} className="container mx-auto p-6 space-y-6">
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-500">
                Welcome, Dr. {user?.name} •{" "}
                {currentDate.toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="mr-2 h-4 w-4" />
                  New Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Create New Prescription</span>
                  </DialogTitle>
                  <DialogDescription>Create a new prescription for a patient</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!selectedPatient ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search patient by name or ID..."
                              className="pl-10"
                              value={patientSearch}
                              onChange={(e) => handlePatientSearch(e.target.value)}
                            />
                          </div>

                          {searchResults.length > 0 && (
                            <div className="border rounded-lg max-h-40 overflow-y-auto">
                              {searchResults.map((patient) => (
                                <div
                                  key={patient.id}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                  onClick={() => {
                                    setSelectedPatient(patient)
                                    setSearchResults([])
                                  }}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">{patient.name}</p>
                                      <p className="text-sm text-gray-600">
                                        {patient.id} • {patient.age} yrs, {patient.gender}
                                      </p>
                                    </div>
                                    <Badge variant="outline">{patient.condition}</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{selectedPatient.name}</p>
                              <p className="text-sm text-gray-600">
                                {selectedPatient.id} • {selectedPatient.age} yrs, {selectedPatient.gender}
                              </p>
                              {selectedPatient.allergies.length > 0 && (
                                <p className="text-sm text-red-600">
                                  Allergies: {selectedPatient.allergies.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                            Change Patient
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Diagnosis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Enter diagnosis..."
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        rows={3}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Medications</CardTitle>
                        <Button onClick={addMedication} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Medication
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {medications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Pill className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No medications added yet</p>
                          <p className="text-sm">Click "Add Medication" to start</p>
                        </div>
                      ) : (
                        medications.map((medication, index) => (
                          <Card key={medication.id} className="border-l-4 border-l-blue-400">
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium">Medication {index + 1}</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMedication(medication.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                  <Label>Medication Name</Label>
                                  {!medication.isCustom ? (
                                    <div className="space-y-2">
                                      <Select
                                        value={medication.drugName}
                                        onValueChange={(value) => handleDrugSelection(medication.id, value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select medication from inventory" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                          <div className="p-2 border-b">
                                            <div className="relative">
                                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                              <Input
                                                placeholder="Search drugs..."
                                                className="pl-7 h-8 text-sm"
                                                value={drugSearchQuery}
                                                onChange={(e) => setDrugSearchQuery(e.target.value)}
                                              />
                                            </div>
                                          </div>

                                          {availableDrugs.length > 0 ? (
                                            <>
                                              {availableDrugs.map((drug) => (
                                                <SelectItem key={drug.id} value={drug.drugName}>
                                                  <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center space-x-2">
                                                      <Package className="h-3 w-3" />
                                                      <span>{drug.drugName}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 ml-2">
                                                      {getDrugStockBadge(drug)}
                                                      {drug.category && (
                                                        <Badge variant="outline" className="text-xs">
                                                          {drug.category}
                                                        </Badge>
                                                      )}
                                                    </div>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                              <SelectItem value="OTHER" className="border-t">
                                                <div className="flex items-center space-x-2 text-orange-600">
                                                  <AlertCircle className="h-3 w-3" />
                                                  <span>Other (Enter manually)</span>
                                                </div>
                                              </SelectItem>
                                            </>
                                          ) : (
                                            <SelectItem value="OTHER">
                                              <div className="flex items-center space-x-2 text-orange-600">
                                                <AlertCircle className="h-3 w-3" />
                                                <span>No drugs found - Enter manually</span>
                                              </div>
                                            </SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>

                                      {medication.drugName &&
                                        availableDrugs.find((d) => d.drugName === medication.drugName) && (
                                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                            <div className="flex items-center justify-between">
                                              <span>
                                                Stock:{" "}
                                                {
                                                  availableDrugs.find((d) => d.drugName === medication.drugName)
                                                    ?.currentStock
                                                }{" "}
                                                units
                                              </span>
                                              <span>
                                                Location:{" "}
                                                {
                                                  availableDrugs.find((d) => d.drugName === medication.drugName)
                                                    ?.location
                                                }
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2 text-orange-600 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Custom medication (not in inventory)</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDrugSelection(medication.id, "")}
                                          className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                                        >
                                          Back to inventory
                                        </Button>
                                      </div>
                                      <Input
                                        placeholder="Enter medication name"
                                        value={medication.drugName}
                                        onChange={(e) => updateMedication(medication.id, "drugName", e.target.value)}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label>Dosage</Label>
                                  <Input
                                    placeholder="e.g., 1 tablet"
                                    value={medication.dosage}
                                    onChange={(e) => updateMedication(medication.id, "dosage", e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Frequency</Label>
                                  <Select
                                    value={medication.frequency}
                                    onValueChange={(value) => updateMedication(medication.id, "frequency", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1-0-0">Once daily (Morning)</SelectItem>
                                      <SelectItem value="0-1-0">Once daily (Afternoon)</SelectItem>
                                      <SelectItem value="0-0-1">Once daily (Evening)</SelectItem>
                                      <SelectItem value="1-0-1">Twice daily</SelectItem>
                                      <SelectItem value="1-1-1">Three times daily</SelectItem>
                                      <SelectItem value="1-1-1-1">Four times daily</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Duration</Label>
                                  <Select
                                    value={medication.duration}
                                    onValueChange={(value) => updateMedication(medication.id, "duration", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="3 days">3 days</SelectItem>
                                      <SelectItem value="5 days">5 days</SelectItem>
                                      <SelectItem value="7 days">1 week</SelectItem>
                                      <SelectItem value="14 days">2 weeks</SelectItem>
                                      <SelectItem value="30 days">1 month</SelectItem>
                                      <SelectItem value="90 days">3 months</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Special Instructions</Label>
                                  <Input
                                    placeholder="e.g., Take with food, Before meals"
                                    value={medication.instructions}
                                    onChange={(e) => updateMedication(medication.id, "instructions", e.target.value)}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Follow-up</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label>Next Appointment Date</Label>
                          <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Additional Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Any additional instructions or notes..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitPrescription}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Prescription"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
                <p className="text-xs text-muted-foreground">In the system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
                <FileText className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingPrescriptions || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting pharmacy</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="patients" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white">
              <TabsTrigger value="patients">Recent Patients</TabsTrigger>
              <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="patients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Recent Patients</span>
                  </CardTitle>
                  <CardDescription>All patients in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-gray-600">
                                {patient.age} yrs, {patient.gender} • {patient.condition}
                              </p>
                              {patient.allergies.length > 0 && (
                                <p className="text-sm text-red-600">Allergies: {patient.allergies.join(", ")}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "N/A"}
                            </span>
                            <Button size="sm" variant="outline">
                              View Records
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No recent patients</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    <span>Alerts & Notifications</span>
                  </CardTitle>
                  <CardDescription>Important updates requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border rounded-lg ${getNotificationBgColor(notification.type, notification.priority)} ${!notification.read ? "border-l-4 border-l-blue-500" : ""
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p
                                    className={`font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}
                                  >
                                    {notification.title}
                                  </p>
                                  {notification.priority === "high" && (
                                    <Badge variant="destructive" className="text-xs">
                                      High Priority
                                    </Badge>
                                  )}
                                  {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full"></div>}
                                </div>
                                <p className={`text-sm mt-1 ${!notification.read ? "text-gray-700" : "text-gray-600"}`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </span>
                                  <div className="flex space-x-2">
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMarkNotificationRead(notification.id)}
                                        className="text-xs"
                                      >
                                        Mark as Read
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDismissNotification(notification.id)}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No notifications at this time</p>
                        <p className="text-sm">You're all caught up!</p>
                      </div>
                    )}
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