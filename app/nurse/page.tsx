"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Activity, Thermometer, Heart, Clipboard, AlertTriangle, CheckCircle, Pill } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

const mockData = {
  patients: [
    {
      id: "P001",
      name: "Rajesh Kumar",
      age: 45,
      bed: "W3-12",
      condition: "Stable",
      vitals: { temp: "98.6°F", bp: "120/80", pulse: "72 bpm", spo2: "98%" },
    },
    {
      id: "P002",
      name: "Priya Sharma",
      age: 32,
      bed: "W3-14",
      condition: "Improving",
      vitals: { temp: "99.1°F", bp: "118/76", pulse: "80 bpm", spo2: "97%" },
    },
    {
      id: "P003",
      name: "Mohammed Ali",
      age: 28,
      bed: "W3-16",
      condition: "Critical",
      vitals: { temp: "101.2°F", bp: "140/90", pulse: "92 bpm", spo2: "94%" },
    },
    {
      id: "P004",
      name: "Lakshmi Devi",
      age: 56,
      bed: "W3-18",
      condition: "Stable",
      vitals: { temp: "98.2°F", bp: "130/85", pulse: "68 bpm", spo2: "99%" },
    },
  ],
  medications: [
    {
      id: 1,
      patient: "Rajesh Kumar",
      medication: "Atenolol 50mg",
      time: "10:00 AM",
      status: "Administered",
      notes: "Given with water",
    },
    {
      id: 2,
      patient: "Priya Sharma",
      medication: "Paracetamol 500mg",
      time: "10:30 AM",
      status: "Due",
      notes: "Check temperature before administering",
    },
    {
      id: 3,
      patient: "Mohammed Ali",
      medication: "Ceftriaxone 1g IV",
      time: "11:00 AM",
      status: "Due",
      notes: "Doctor to be present",
    },
    {
      id: 4,
      patient: "Lakshmi Devi",
      medication: "Insulin 10 units",
      time: "11:30 AM",
      status: "Due",
      notes: "Check blood sugar first",
    },
  ],
  tasks: [
    { id: 1, task: "Change IV for Mohammed Ali", priority: "high", time: "10:45 AM", completed: false },
    { id: 2, task: "Record vitals for all patients", priority: "medium", time: "11:00 AM", completed: false },
    { id: 3, task: "Assist Dr. Kumar with rounds", priority: "medium", time: "11:30 AM", completed: false },
    { id: 4, task: "Prepare discharge papers for Bed W3-10", priority: "low", time: "12:00 PM", completed: false },
    { id: 5, task: "Restock ward supplies", priority: "low", time: "02:00 PM", completed: false },
  ],
}

export default function NurseDashboard() {
  const [currentDate] = useState(new Date())

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "improving":
        return "text-green-600 bg-green-50 border-green-200"
      case "stable":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <AuthGuard allowedRoles={["nurse"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nurse Dashboard</h1>
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
              <AlertTriangle className="mr-2 h-4 w-4" />
              Request Assistance
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ward Patients</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.patients.length}</div>
                <p className="text-xs text-muted-foreground">
                  {mockData.patients.filter((p) => p.condition === "Critical").length} critical
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medications Due</CardTitle>
                <Pill className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockData.medications.filter((m) => m.status === "Due").length}
                </div>
                <p className="text-xs text-muted-foreground">Next due at 10:30 AM</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Pending</CardTitle>
                <Clipboard className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.tasks.filter((t) => !t.completed).length}</div>
                <p className="text-xs text-muted-foreground">
                  {mockData.tasks.filter((t) => t.priority === "high" && !t.completed).length} high priority
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="patients" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white">
              <TabsTrigger value="patients">Ward Patients</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="patients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>Ward 3 Patients</span>
                  </CardTitle>
                  <CardDescription>Current patients under your care</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.patients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`border rounded-lg ${
                          patient.condition === "Critical" ? "border-red-200" : "border-gray-200"
                        }`}
                      >
                        <div className="p-4 flex items-center justify-between">
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
                                {patient.age} yrs • Bed {patient.bed}
                              </p>
                            </div>
                          </div>
                          <Badge className={getConditionColor(patient.condition)}>{patient.condition}</Badge>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-b-lg border-t border-gray-200">
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center">
                              <Thermometer className="h-3 w-3 mr-1 text-gray-500" />
                              <span>{patient.vitals.temp}</span>
                            </div>
                            <div className="flex items-center">
                              <Activity className="h-3 w-3 mr-1 text-gray-500" />
                              <span>{patient.vitals.bp}</span>
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-3 w-3 mr-1 text-gray-500" />
                              <span>{patient.vitals.pulse}</span>
                            </div>
                            <div className="flex items-center">
                              <Activity className="h-3 w-3 mr-1 text-gray-500" />
                              <span>{patient.vitals.spo2}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    <span>Medication Schedule</span>
                  </CardTitle>
                  <CardDescription>Today's medication administration schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.medications.map((med) => (
                      <div
                        key={med.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          med.status === "Due" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center w-16">
                            <p className="font-medium text-gray-900">{med.time}</p>
                          </div>
                          <div>
                            <p className="font-medium">{med.patient}</p>
                            <p className="text-sm text-gray-600">{med.medication}</p>
                            <p className="text-xs text-gray-500 mt-1">{med.notes}</p>
                          </div>
                        </div>
                        <div>
                          {med.status === "Due" ? (
                            <Button size="sm">Administer</Button>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {med.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clipboard className="h-5 w-5 text-blue-600" />
                    <span>Today's Tasks</span>
                  </CardTitle>
                  <CardDescription>Tasks and responsibilities for your shift</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          task.priority === "high"
                            ? "bg-red-50 border-red-200"
                            : task.priority === "medium"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center w-16">
                            <p className="font-medium text-gray-900">{task.time}</p>
                          </div>
                          <div>
                            <p className="font-medium">{task.task}</p>
                            <Badge
                              variant="outline"
                              className={
                                task.priority === "high"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {task.priority} priority
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant={task.completed ? "outline" : "default"}
                          size="sm"
                          className={task.completed ? "bg-green-100 text-green-800 border-green-200" : ""}
                        >
                          {task.completed ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completed
                            </>
                          ) : (
                            "Mark Complete"
                          )}
                        </Button>
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
