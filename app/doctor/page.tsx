"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, FileText, Users, AlertTriangle } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

const mockData = {
  appointments: [
    { id: 1, patient: "Rajesh Kumar", time: "09:30 AM", status: "Completed", type: "Follow-up" },
    { id: 2, patient: "Priya Sharma", time: "10:15 AM", status: "In Progress", type: "Consultation" },
    { id: 3, patient: "Mohammed Ali", time: "11:00 AM", status: "Waiting", type: "New Patient" },
    { id: 4, patient: "Lakshmi Devi", time: "11:45 AM", status: "Scheduled", type: "Follow-up" },
    { id: 5, patient: "Suresh Babu", time: "02:30 PM", status: "Scheduled", type: "Surgery Prep" },
  ],
  patients: [
    { id: "P001", name: "Rajesh Kumar", age: 45, gender: "Male", condition: "Hypertension", lastVisit: "2 days ago" },
    { id: "P002", name: "Priya Sharma", age: 32, gender: "Female", condition: "Pregnancy", lastVisit: "1 week ago" },
    { id: "P003", name: "Mohammed Ali", age: 28, gender: "Male", condition: "Fracture", lastVisit: "New Patient" },
    { id: "P004", name: "Lakshmi Devi", age: 56, gender: "Female", condition: "Diabetes", lastVisit: "3 days ago" },
  ],
  alerts: [
    { id: 1, message: "Lab results ready for Rajesh Kumar", time: "5 min ago", type: "info" },
    { id: 2, message: "Medication approval needed for Priya Sharma", time: "15 min ago", type: "warning" },
    { id: 3, message: "OT 2 scheduled for 2:30 PM", time: "30 min ago", type: "info" },
  ],
}

export default function DoctorDashboard() {
  const [currentDate] = useState(new Date())

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
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
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
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          appointment.status === "In Progress"
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
                        className={`p-4 border rounded-lg ${
                          alert.type === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"
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
