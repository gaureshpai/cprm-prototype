"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Pill,
  Heart,
  Shield,
  Users,
  Award,
  Mail,
  Stethoscope,
  Activity,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getPatientByIdAction } from "@/lib/patient-actions"
import { getStatusColor } from "@/lib/functions"
import type { PatientData } from "@/lib/doctor-service"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const [patientId, setPatientId] = useState("")
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchAttempted, setSearchAttempted] = useState(false)
  const { toast } = useToast()

  const handlePatientSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a patient ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setSearchAttempted(true)
    try {
      const result = await getPatientByIdAction(patientId.trim())
      if (result.success && result.data) {
        setPatient(result.data)
        toast({
          title: "Patient Found",
          description: `Welcome, ${result.data.name}`,
        })
      } else {
        setPatient(null)
        toast({
          title: "Patient Not Found",
          description: "Please check your patient ID and try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching patient:", error)
      setPatient(null)
      toast({
        title: "Error",
        description: "Failed to search for patient",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setPatientId("")
    setPatient(null)
    setSearchAttempted(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <div className="bg-black p-2 rounded-md">
                  <Image
                    src="/logo.png"
                    alt="InUnity Logo"
                    width={24}
                    height={24}
                    className="invert"
                  />
                </div>
                <p className="text-2xl font-bold">UDAL - Wenlock Hospital</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-6">
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Staff Login
              </Link>
            </nav>

          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Welcome to our Patient Portal</h2>
            <p className="text-lg text-gray-600 mb-8">
              Access your medical records, view appointments, and manage your healthcare journey with our patient
              portal.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Search className="h-5 w-5 text-blue-600" />
                <span>Patient Portal Access</span>
              </CardTitle>
              <CardDescription>Enter your patient ID to access your medical records and information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePatientSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="patientId"
                      placeholder="Enter your patient ID (e.g., P001)"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                      {loading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>
                {patient && (
                  <Button type="button" variant="outline" onClick={clearSearch} className="w-full">
                    Search Another Patient
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </section>

        {patient && (
          <section className="mb-12">
            <Card className="max-w-6xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{patient.name}</CardTitle>
                      <CardDescription className="text-lg">
                        Patient ID: {patient.id} • {patient.age} years, {patient.gender}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(patient.status)} text-sm px-3 py-1`}>{patient.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full md:grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="contact">Contact Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-green-600" />
                            Current Condition
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium text-lg">{patient.condition || "Stable"}</p>
                          <p className="text-sm text-gray-600 mt-1">Primary diagnosis</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            Last Visit
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium text-lg">
                            {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">Most recent appointment</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-purple-600" />
                            Next Appointment
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium text-lg">
                            {patient.nextAppointment
                              ? new Date(patient.nextAppointment).toLocaleDateString()
                              : "Not scheduled"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">Upcoming visit</p>
                        </CardContent>
                      </Card>
                    </div>

                    {patient.allergies.length > 0 && (
                      <Card className="border-red-200 bg-red-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center text-red-700">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Allergies & Warnings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {patient.allergies.map((allergy, index) => (
                              <Badge
                                key={index}
                                variant="destructive"
                                className="bg-red-100 text-red-800 border-red-300"
                              >
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="medications" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Pill className="h-5 w-5 mr-2 text-green-600" />
                          Current Medications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {patient.medications && patient.medications.length > 0 ? (
                            patient.medications.map((medication: any, index: number) => (
                              <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{medication.name}</h4>
                                  <Badge variant="outline">Active</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Dosage:</span> {medication.dosage}
                                  </div>
                                  <div>
                                    <span className="font-medium">Frequency:</span> {medication.frequency}
                                  </div>
                                  <div>
                                    <span className="font-medium">Duration:</span> {medication.duration}
                                  </div>
                                </div>
                                {medication.instructions && (
                                  <p className="text-sm text-gray-600 mt-2 italic">{medication.instructions}</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Pill className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                              <p>No current medications</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <User className="h-5 w-5 mr-2 text-blue-600" />
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-3 text-gray-500" />
                            <span>{patient.phone || "Not provided"}</span>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-3 text-gray-500 mt-1" />
                            <span>{patient.address || "Not provided"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  )
}
