"use client"

import { useState } from "react"
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
import { Search, User, Calendar, FileText, Heart, Activity, Thermometer, Phone, MapPin, Clock } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

const mockPatients = [
  {
    id: "P001",
    name: "Rajesh Kumar",
    age: 45,
    gender: "Male",
    phone: "+91 98765 43210",
    address: "123 MG Road, Mangalore",
    condition: "Hypertension",
    status: "Stable",
    lastVisit: "2025-06-03",
    nextAppointment: "2025-06-10",
    vitals: {
      bp: "140/90",
      pulse: "78 bpm",
      temp: "98.6°F",
      weight: "75 kg",
      height: "170 cm",
    },
    medications: ["Amlodipine 5mg", "Metoprolol 25mg"],
    allergies: ["Penicillin"],
    medicalHistory: [
      { date: "2025-06-03", diagnosis: "Hypertension follow-up", treatment: "Medication adjustment" },
      { date: "2025-05-20", diagnosis: "Routine check-up", treatment: "Blood pressure monitoring" },
      { date: "2025-04-15", diagnosis: "Initial hypertension diagnosis", treatment: "Lifestyle counseling" },
    ],
  },
  {
    id: "P002",
    name: "Priya Sharma",
    age: 32,
    gender: "Female",
    phone: "+91 87654 32109",
    address: "456 Car Street, Mangalore",
    condition: "Pregnancy - 28 weeks",
    status: "Normal",
    lastVisit: "2025-06-01",
    nextAppointment: "2025-06-08",
    vitals: {
      bp: "110/70",
      pulse: "85 bpm",
      temp: "98.4°F",
      weight: "68 kg",
      height: "162 cm",
    },
    medications: ["Folic Acid", "Iron supplements"],
    allergies: ["None known"],
    medicalHistory: [
      { date: "2025-06-01", diagnosis: "Prenatal check-up", treatment: "Routine monitoring" },
      { date: "2025-05-15", diagnosis: "Prenatal check-up", treatment: "Ultrasound normal" },
      { date: "2025-04-30", diagnosis: "Prenatal check-up", treatment: "Blood tests normal" },
    ],
  },
  {
    id: "P003",
    name: "Mohammed Ali",
    age: 28,
    gender: "Male",
    phone: "+91 76543 21098",
    address: "789 Lighthouse Hill, Mangalore",
    condition: "Fractured Radius",
    status: "Recovering",
    lastVisit: "2025-06-02",
    nextAppointment: "2025-06-09",
    vitals: {
      bp: "120/80",
      pulse: "72 bpm",
      temp: "98.2°F",
      weight: "70 kg",
      height: "175 cm",
    },
    medications: ["Ibuprofen 400mg", "Calcium supplements"],
    allergies: ["Aspirin"],
    medicalHistory: [
      { date: "2025-06-02", diagnosis: "Fracture follow-up", treatment: "X-ray shows healing" },
      { date: "2025-05-25", diagnosis: "Cast application", treatment: "Plaster cast applied" },
      { date: "2025-05-20", diagnosis: "Radius fracture", treatment: "Emergency treatment" },
    ],
  },
  {
    id: "P004",
    name: "Lakshmi Devi",
    age: 56,
    gender: "Female",
    phone: "+91 65432 10987",
    address: "321 Kadri Hills, Mangalore",
    condition: "Type 2 Diabetes",
    status: "Controlled",
    lastVisit: "2025-05-30",
    nextAppointment: "2025-06-13",
    vitals: {
      bp: "130/85",
      pulse: "68 bpm",
      temp: "98.0°F",
      weight: "65 kg",
      height: "158 cm",
    },
    medications: ["Metformin 500mg", "Glimepiride 2mg"],
    allergies: ["Sulfa drugs"],
    medicalHistory: [
      { date: "2025-05-30", diagnosis: "Diabetes management", treatment: "HbA1c: 7.2%" },
      { date: "2025-05-15", diagnosis: "Routine follow-up", treatment: "Blood sugar monitoring" },
      { date: "2025-04-30", diagnosis: "Medication adjustment", treatment: "Dosage increased" },
    ],
  },
]

export default function DoctorPatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<(typeof mockPatients)[0] | null>(null)

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "stable":
        return "bg-green-100 text-green-800 border-green-200"
      case "recovering":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "normal":
        return "bg-green-100 text-green-800 border-green-200"
      case "controlled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
              <p className="text-gray-500">Manage and view patient records</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => alert("Add New Patient button clicked")}>
              <User className="mr-2 h-4 w-4" />
              Add New Patient
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients by name, ID, or condition..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
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
                    <p className="font-medium">{patient.condition}</p>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
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
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="vitals">Vitals</TabsTrigger>
                            <TabsTrigger value="medications">Medications</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
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
                                    <span className="text-sm">{patient.phone}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm">{patient.address}</span>
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
                                    <p className="font-medium">{patient.condition}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm text-gray-500">Status:</span>
                                    <Badge className={`ml-2 ${getStatusColor(patient.status)}`}>{patient.status}</Badge>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm">
                                      Next: {new Date(patient.nextAppointment).toLocaleDateString()}
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
                                  {patient.allergies.map((allergy, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-red-50 text-red-700 border-red-200"
                                    >
                                      {allergy}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="vitals" className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <Card>
                                <CardContent className="pt-4">
                                  <div className="flex items-center space-x-2">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    <div>
                                      <p className="text-sm text-gray-500">Blood Pressure</p>
                                      <p className="text-lg font-semibold">{patient.vitals.bp}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-4">
                                  <div className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    <div>
                                      <p className="text-sm text-gray-500">Pulse Rate</p>
                                      <p className="text-lg font-semibold">{patient.vitals.pulse}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-4">
                                  <div className="flex items-center space-x-2">
                                    <Thermometer className="h-5 w-5 text-orange-500" />
                                    <div>
                                      <p className="text-sm text-gray-500">Temperature</p>
                                      <p className="text-lg font-semibold">{patient.vitals.temp}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Weight</p>
                                    <p className="text-lg font-semibold">{patient.vitals.weight}</p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Height</p>
                                    <p className="text-lg font-semibold">{patient.vitals.height}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="medications" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-sm">Current Medications</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {patient.medications.map((medication, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                    >
                                      <span className="font-medium">{medication}</span>
                                      <Badge variant="outline">Active</Badge>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="history" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-sm">Medical History</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {patient.medicalHistory.map((record, index) => (
                                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium">{record.diagnosis}</p>
                                          <p className="text-sm text-gray-600">{record.treatment}</p>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                          {new Date(record.date).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
