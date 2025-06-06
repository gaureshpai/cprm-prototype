"use client"

import { useState } from "react"
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
import { Calendar, Clock, FileText, Users, AlertTriangle, Plus, Trash2, Search, User, Pill } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import { mockDoctorData as mockData, mockPatients, commonMedications } from "@/lib/mock-data"
import { Medication, Patient } from "@/lib/interfaces"

export default function DoctorDashboard() {
  const [currentDate] = useState(new Date())
  const { toast } = useToast()

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientSearch, setPatientSearch] = useState("")
  const [medications, setMedications] = useState<Medication[]>([])
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.id.toLowerCase().includes(patientSearch.toLowerCase()),
  )

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    }
    setMedications([...medications, newMedication])
  }

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, [field]: value } : med)))
  }

  const removeMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id))
  }

  const handleSubmit = () => {
    if (!selectedPatient) {
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

    toast({
      title: "Prescription created",
      description: `Prescription for ${selectedPatient.name} has been created successfully`,
    })

    setSelectedPatient(null)
    setMedications([])
    setDiagnosis("")
    setNotes("")
    setFollowUpDate("")
    setPatientSearch("")
    setDialogOpen(false)
  }

  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-500">
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
                              onChange={(e) => setPatientSearch(e.target.value)}
                            />
                          </div>

                          {patientSearch && (
                            <div className="border rounded-lg max-h-40 overflow-y-auto">
                              {filteredPatients.map((patient) => (
                                <div
                                  key={patient.id}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                  onClick={() => setSelectedPatient(patient)}
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
                                <div className="space-y-2">
                                  <Label>Medication Name</Label>
                                  <Select
                                    value={medication.name}
                                    onValueChange={(value) => updateMedication(medication.id, "name", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select medication" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {commonMedications.map((med) => (
                                        <SelectItem key={med} value={med}>
                                          {med}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                              </div>

                              <div className="mt-4 space-y-2">
                                <Label>Special Instructions</Label>
                                <Input
                                  placeholder="e.g., Take with food, Before meals"
                                  value={medication.instructions}
                                  onChange={(e) => updateMedication(medication.id, "instructions", e.target.value)}
                                />
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
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Save as Draft</Button>
                    <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                      Create Prescription
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.appointments.length}</div>
                <p className="text-xs text-muted-foreground">
                  {mockData.appointments.filter((a) => a.status === "Completed").length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Patient</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Priya Sharma</div>
                <p className="text-xs text-muted-foreground">Consultation (15 min elapsed)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Approvals and reviews needed</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white">
              <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
              <TabsTrigger value="patients">Recent Patients</TabsTrigger>
              <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Appointments</span>
                  </CardTitle>
                  <CardDescription>Your schedule for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${appointment.status === "In Progress"
                            ? "bg-blue-50 border-blue-200"
                            : appointment.status === "Completed"
                              ? "bg-gray-50 border-gray-200"
                              : "bg-white"
                          }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center w-16">
                            <p className="font-medium text-gray-900">{appointment.time}</p>
                          </div>
                          <div>
                            <p className="font-medium">{appointment.patient}</p>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            appointment.status === "Completed"
                              ? "outline"
                              : appointment.status === "In Progress"
                                ? "default"
                                : appointment.status === "Waiting"
                                  ? "secondary"
                                  : "outline"
                          }
                          className={appointment.status === "In Progress" ? "bg-green-500" : ""}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Recent Patients</span>
                  </CardTitle>
                  <CardDescription>Patients you've recently treated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.patients.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white"
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
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-4">Last visit: {patient.lastVisit}</span>
                        </div>
                      </div>
                    ))}
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
                    {mockData.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border rounded-lg ${alert.type === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"
                          }`}
                      >
                        <div className="flex justify-between">
                          <p
                            className={`font-medium ${alert.type === "warning" ? "text-yellow-800" : "text-blue-800"}`}
                          >
                            {alert.message}
                          </p>
                          <span className="text-sm text-gray-500">{alert.time}</span>
                        </div>
                      </div>
                    ))}
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