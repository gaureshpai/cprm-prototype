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
  Clock,
  Phone,
  MapPin,
  Activity,
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
import { getDoctorNotificationsAction, type NotificationData } from "@/lib/notification-actions"
import { getStatusColor } from "@/lib/functions"

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
    if (user?.name) {
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
    if (!user?.name) return

    try {
      setLoading(true)
      startTransition(async () => {
        const [appointmentsResult, patientsResult, statsResult, notificationsResult] = await Promise.all([
          getDoctorAppointmentsAction(user.name),
          getDoctorPatientsAction(user.name, 10),
          getDoctorStatsAction(user.name),
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
      } else {
        console.error("Failed to load drugs:", result.error)
        toast({
          title: "Error",
          description: "Failed to load available medications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading available drugs:", error)
      toast({
        title: "Error",
        description: "Failed to load available medications",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drugSearchQuery) {
        const dropdowns = document.querySelectorAll(".drug-search-dropdown")
        let clickedInside = false

        dropdowns.forEach((dropdown) => {
          if (dropdown.contains(event.target as Node)) {
            clickedInside = true
          }
        })

        if (!clickedInside) {
          setDrugSearchQuery("")
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [drugSearchQuery])

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
    updateMedication(medicationId, "drugName", drugName)
  }

  const handleSubmitPrescription = async () => {
    if (!selectedPatient || !user?.name) {
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
        formData.append("doctorId", user.name)
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
                                      <div className="relative">
                                        <div className="flex gap-2">
                                          <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                              placeholder="Search medications..."
                                              className="pl-10"
                                              value={drugSearchQuery}
                                              onChange={(e) => setDrugSearchQuery(e.target.value)}
                                            />
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateMedication(medication.id, "isCustom", true)}
                                          >
                                            Custom
                                          </Button>
                                        </div>

                                        {drugSearchQuery.length > 0 && (
                                          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto drug-search-dropdown">
                                            {availableDrugs.length > 0 ? (
                                              <>
                                                {availableDrugs.map((drug) => (
                                                  <div
                                                    key={drug.id}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                                    onClick={() => {
                                                      updateMedication(medication.id, "drugName", drug.drugName)
                                                      setDrugSearchQuery("")
                                                    }}
                                                  >
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex items-center space-x-2">
                                                        <Package className="h-4 w-4 text-gray-500" />
                                                        <span>{drug.drugName}</span>
                                                      </div>
                                                      <div className="flex items-center space-x-1">
                                                        {getDrugStockBadge(drug)}
                                                        {drug.category && (
                                                          <Badge variant="outline" className="text-xs">
                                                            {drug.category}
                                                          </Badge>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </>
                                            ) : (
                                              <div className="p-2 text-center text-gray-500">No medications found</div>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {medication.drugName && (
                                        <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-md">
                                          <div className="flex items-center space-x-2">
                                            <Pill className="h-4 w-4 text-blue-600" />
                                            <span className="font-medium">{medication.drugName}</span>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-gray-500"
                                            onClick={() => updateMedication(medication.id, "drugName", "")}
                                          >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Clear selection</span>
                                          </Button>
                                        </div>
                                      )}

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
                                          onClick={() => {
                                            updateMedication(medication.id, "isCustom", false)
                                            updateMedication(medication.id, "drugName", "")
                                          }}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
                <p className="text-xs text-muted-foreground">Active in system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prescriptions Today</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.prescriptionsToday || 0}</div>
                <p className="text-xs text-muted-foreground">Created today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
                <p className="text-xs text-muted-foreground">{stats?.completedAppointments || 0} completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
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
                    {(loading || patients.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                          <div className="text-center space-y-1">
                            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-lg font-medium text-gray-700">Loading patient records</p>
                            <p className="text-sm text-gray-500">
                              This may take a moment...
                            </p>
                          </div>
                        </div>
                      ) : patients.length > 0 ? (
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
                              <div className="flex space-x-2 pt-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                      onClick={() => setSelectedPatient(patient)}
                                    >
                                      <FileText className="h-3 w-3 mr-1" />
                                      View Records
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="bg-blue-100 text-blue-600">
                                            {patient.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>{patient.name} - Medical Records</span>
                                      </DialogTitle>
                                      <DialogDescription>Complete medical history and current status</DialogDescription>
                                    </DialogHeader>

                                    <Tabs defaultValue="overview" className="w-full">
                                      <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="medications">Medications</TabsTrigger>
                                      </TabsList>

                                      <TabsContent value="overview" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <Card>
                                            <CardHeader className="pb-2">
                                              <CardTitle className="text-sm">Patient Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                              <div className="flex items-center">
                                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                                <span className="text-sm">
                                                  {patient.age} years, {patient.gender}
                                                </span>
                                              </div>
                                              <div className="flex items-center">
                                                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                                <span className="text-sm">{patient.phone || "N/A"}</span>
                                              </div>
                                              <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                                <span className="text-sm">{patient.address || "N/A"}</span>
                                              </div>
                                            </CardContent>
                                          </Card>

                                          <Card>
                                            <CardHeader className="pb-2">
                                              <CardTitle className="text-sm">Current Status</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                              <div>
                                                <span className="text-sm text-gray-500">Condition:</span>
                                                <p className="font-medium">{patient.condition || "N/A"}</p>
                                              </div>
                                              <div>
                                                <span className="text-sm text-gray-500">Status:</span>
                                                <Badge className={`ml-2 ${getStatusColor(patient.status)}`}>
                                                  {patient.status}
                                                </Badge>
                                              </div>
                                              <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                                <span className="text-sm">
                                                  Next:{" "}
                                                  {patient.nextAppointment
                                                    ? new Date(patient.nextAppointment).toLocaleDateString()
                                                    : "N/A"}
                                                </span>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </div>

                                        <Card>
                                          <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Allergies</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                              {patient.allergies.length > 0 ? (
                                                patient.allergies.map((allergy, index) => (
                                                  <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="bg-red-50 text-red-700 border-red-200"
                                                  >
                                                    {allergy}
                                                  </Badge>
                                                ))
                                              ) : (
                                                <span className="text-gray-500">No known allergies</span>
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>

                                      <TabsContent value="medications" className="space-y-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-sm">Current Medications</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="space-y-2">
                                              {(patient.medications || []).map(
                                                (
                                                  medication: {
                                                    id: string
                                                    name: string
                                                    dosage: string
                                                    frequency: string
                                                    duration: string
                                                    instructions?: string | null
                                                    drugInfo: {
                                                      id: string
                                                      currentStock: number
                                                      minStock: number
                                                      status: string
                                                      category?: string | null
                                                      batchNumber?: string | null
                                                      expiryDate?: Date | null
                                                      location: string
                                                    }
                                                    prescriptionDate: Date
                                                  },
                                                  index: number,
                                                ) => (
                                                  <div
                                                    key={medication.id || index}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                                                  >
                                                    <div className="flex-1">
                                                      <div className="flex items-center justify-between">
                                                        <span className="font-medium text-gray-900">
                                                          {medication.name}
                                                        </span>
                                                        <div className="flex gap-2">
                                                          <Badge variant="outline">Active</Badge>
                                                          {medication.drugInfo && (
                                                            <Badge
                                                              variant={
                                                                medication.drugInfo.currentStock <=
                                                                  medication.drugInfo.minStock
                                                                  ? "destructive"
                                                                  : "secondary"
                                                              }
                                                            >
                                                              Stock: {medication.drugInfo.currentStock}
                                                            </Badge>
                                                          )}
                                                        </div>
                                                      </div>
                                                      <div className="mt-1 text-sm text-gray-600">
                                                        <span className="mr-4">Dosage: {medication.dosage}</span>
                                                        <span className="mr-4">Frequency: {medication.frequency}</span>
                                                        <span>Duration: {medication.duration}</span>
                                                      </div>
                                                      {medication.drugInfo && (
                                                        <div className="mt-1 text-xs text-gray-500">
                                                          <span className="mr-4">
                                                            Category: {medication.drugInfo.category || "N/A"}
                                                          </span>
                                                          <span className="mr-4">
                                                            Location: {medication.drugInfo.location}
                                                          </span>
                                                          {medication.drugInfo.expiryDate && (
                                                            <span>
                                                              Expires:{" "}
                                                              {new Date(
                                                                medication.drugInfo.expiryDate,
                                                              ).toLocaleDateString()}
                                                            </span>
                                                          )}
                                                        </div>
                                                      )}
                                                      {medication.instructions && (
                                                        <p className="mt-1 text-sm text-gray-500 italic">
                                                          {medication.instructions}
                                                        </p>
                                                      )}
                                                      {medication.prescriptionDate && (
                                                        <p className="mt-1 text-xs text-gray-400">
                                                          Prescribed:{" "}
                                                          {new Date(medication.prescriptionDate).toLocaleDateString()}
                                                        </p>
                                                      )}
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                              {(!patient.medications || patient.medications.length === 0) && (
                                                <div className="text-center py-4 text-gray-500">
                                                  No current medications
                                                </div>
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                    </Tabs>
                                  </DialogContent>
                                </Dialog>
                              </div>
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