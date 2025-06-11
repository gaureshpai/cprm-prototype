"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Search,
  User,
  Calendar,
  FileText,
  Heart,
  Activity,
  Thermometer,
  Phone,
  MapPin,
  Clock,
  Edit,
  Plus,
  X,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { PatientForm } from "@/components/patient-form"
import { useToast } from "@/hooks/use-toast"
import { getAllPatientsAction } from "@/lib/patient-actions"
import type { PatientData } from "@/lib/doctor-actions"
import { getStatusColor } from "@/lib/functions"
import { decactivatePatient } from "@/lib/patient-service"

export default function DoctorPatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
  const [editingPatient, setEditingPatient] = useState<PatientData | null>(null)
  const [patients, setPatients] = useState<PatientData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      startTransition(async () => {
        const result = await getAllPatientsAction(1, 100, searchTerm)
        if (result.success && result.data) {
          setPatients(result.data.patients)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load patients",
            variant: "destructive",
          })
        }
      })
    } catch (error) {
      console.error("Error loading patients:", error)
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    await loadPatients()
  }

  const handlePatientSuccess = async () => {
    setShowAddDialog(false)
    setShowEditDialog(false)
    setEditingPatient(null)
    await loadPatients()
  }

  return (
    <AuthGuard allowedRoles={["doctor", "admin"]} className="container mx-auto p-6 space-y-6">
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
              <p className="text-gray-500">Manage and view patient records</p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                  <DialogDescription>Enter the patient's information to create a new record.</DialogDescription>
                </DialogHeader>
                <PatientForm onSuccess={handlePatientSuccess} onCancel={() => setShowAddDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients by name, ID, phone, or condition..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} variant="outline">
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {(loading || patients.length === 0) ? (
            <Card className="text-center py-12">
              <CardContent>
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading patients...</h3>
                <p className="text-gray-500">Please wait while we fetch the patient data.</p>
              </CardContent>
            </Card>
          ) : patients.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or add a new patient</p>
              </CardContent>
            </Card>
          ) :
            (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((patient) => (
                  <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{patient.name}</CardTitle>
                            <p className="text-sm text-gray-600">ID: {patient.id}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Age:</span>
                          <span className="ml-1 font-medium">{patient.age} yrs</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Gender:</span>
                          <span className="ml-1 font-medium">{patient.gender}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-500 text-sm">Condition:</span>
                        <p className="font-medium">{patient.condition || "N/A"}</p>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "N/A"}
                        </span>
                      </div>

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
                              View
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
                                        <Badge className={`ml-2 ${getStatusColor(patient.status)}`}>{patient.status}</Badge>
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
                                                <span className="font-medium text-gray-900">{medication.name}</span>
                                                <div className="flex gap-2">
                                                  <Badge variant="outline">Active</Badge>
                                                  {medication.drugInfo && (
                                                    <Badge
                                                      variant={
                                                        medication.drugInfo.currentStock <= medication.drugInfo.minStock
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
                                                  <span className="mr-4">Location: {medication.drugInfo.location}</span>
                                                  {medication.drugInfo.expiryDate && (
                                                    <span>
                                                      Expires:{" "}
                                                      {new Date(medication.drugInfo.expiryDate).toLocaleDateString()}
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
                                                  Prescribed: {new Date(medication.prescriptionDate).toLocaleDateString()}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        ),
                                      )}
                                      {(!patient.medications || patient.medications.length === 0) && (
                                        <div className="text-center py-4 text-gray-500">No current medications</div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingPatient(patient)
                                setShowEditDialog(true)
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Patient</DialogTitle>
                              <DialogDescription>Update the patient's information.</DialogDescription>
                            </DialogHeader>
                            {editingPatient && (
                              <PatientForm
                                patient={editingPatient}
                                onSuccess={handlePatientSuccess}
                                onCancel={() => {
                                  setShowEditDialog(false)
                                  setEditingPatient(null)
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <X className="h-3 w-3 mr-1" />
                              Deactivate
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will deactivate the patient record for {patient.name}. This action can be reversed by
                                editing the patient's status.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => decactivatePatient(patient.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Deactivate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          }
        </main>
      </div>
    </AuthGuard>
  )
}