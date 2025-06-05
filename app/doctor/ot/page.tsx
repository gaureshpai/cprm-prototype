"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Clock, Calendar, AlertTriangle, CheckCircle, Activity, Heart } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

const mockOTData = {
  theaters: [
    {
      id: "OT-01",
      name: "Operating Theater 1",
      status: "occupied",
      currentSurgery: {
        patient: "Rajesh Kumar",
        procedure: "Cardiac Bypass Surgery",
        surgeon: "Dr. Sharath Kumar",
        startTime: "08:00 AM",
        estimatedDuration: "4 hours",
        elapsed: "2.5 hours",
        progress: 62,
      },
      nextSurgery: {
        patient: "Priya Sharma",
        procedure: "Appendectomy",
        scheduledTime: "02:00 PM",
      },
    },
    {
      id: "OT-02",
      name: "Operating Theater 2",
      status: "available",
      lastCleaned: "11:30 AM",
      nextSurgery: {
        patient: "Mohammed Ali",
        procedure: "Orthopedic Surgery",
        scheduledTime: "01:00 PM",
      },
    },
    {
      id: "OT-03",
      name: "Operating Theater 3",
      status: "maintenance",
      maintenanceType: "Equipment Calibration",
      estimatedCompletion: "03:00 PM",
    },
    {
      id: "OT-04",
      name: "Operating Theater 4",
      status: "occupied",
      currentSurgery: {
        patient: "Lakshmi Devi",
        procedure: "Cataract Surgery",
        surgeon: "Dr. Priya Nair",
        startTime: "10:30 AM",
        estimatedDuration: "1.5 hours",
        elapsed: "1 hour",
        progress: 67,
      },
    },
    {
      id: "OT-05",
      name: "Operating Theater 5",
      status: "cleaning",
      cleaningStarted: "11:45 AM",
      estimatedCompletion: "12:30 PM",
    },
    {
      id: "OT-06",
      name: "Operating Theater 6",
      status: "available",
      lastCleaned: "10:00 AM",
      nextSurgery: {
        patient: "Suresh Babu",
        procedure: "Hernia Repair",
        scheduledTime: "04:00 PM",
      },
    },
  ],
  todaySchedule: [
    {
      id: 1,
      time: "08:00 AM",
      patient: "Rajesh Kumar",
      procedure: "Cardiac Bypass Surgery",
      surgeon: "Dr. Sharath Kumar",
      theater: "OT-01",
      duration: "4 hours",
      status: "in-progress",
    },
    {
      id: 2,
      time: "10:30 AM",
      patient: "Lakshmi Devi",
      procedure: "Cataract Surgery",
      surgeon: "Dr. Priya Nair",
      theater: "OT-04",
      duration: "1.5 hours",
      status: "in-progress",
    },
    {
      id: 3,
      time: "01:00 PM",
      patient: "Mohammed Ali",
      procedure: "Orthopedic Surgery",
      surgeon: "Dr. Rajesh Menon",
      theater: "OT-02",
      duration: "3 hours",
      status: "scheduled",
    },
    {
      id: 4,
      time: "02:00 PM",
      patient: "Priya Sharma",
      procedure: "Appendectomy",
      surgeon: "Dr. Sharath Kumar",
      theater: "OT-01",
      duration: "2 hours",
      status: "scheduled",
    },
    {
      id: 5,
      time: "04:00 PM",
      patient: "Suresh Babu",
      procedure: "Hernia Repair",
      surgeon: "Dr. Priya Nair",
      theater: "OT-06",
      duration: "2.5 hours",
      status: "scheduled",
    },
  ],
  emergencyQueue: [
    {
      id: 1,
      patient: "Emergency Patient 1",
      condition: "Trauma - Multiple Fractures",
      priority: "critical",
      waitTime: "15 min",
      estimatedDuration: "3 hours",
    },
    {
      id: 2,
      patient: "Emergency Patient 2",
      condition: "Acute Appendicitis",
      priority: "urgent",
      waitTime: "45 min",
      estimatedDuration: "1.5 hours",
    },
  ],
}

export default function DoctorOTPage() {
  const [currentDate] = useState(new Date())

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200"
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cleaning":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getScheduleStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in-progress":
        return "bg-blue-500"
      case "scheduled":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "routine":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const occupiedTheaters = mockOTData.theaters.filter((t) => t.status === "occupied").length
  const availableTheaters = mockOTData.theaters.filter((t) => t.status === "available").length
  const maintenanceTheaters = mockOTData.theaters.filter(
    (t) => t.status === "maintenance" || t.status === "cleaning",
  ).length

  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Operating Theater Status</h1>
              <p className="text-gray-500">
                {currentDate.toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => alert("Schedule Surgery button Clicked")}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Surgery
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Theaters</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockOTData.theaters.length}</div>
                <p className="text-xs text-muted-foreground">Operating theaters</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                <Heart className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{occupiedTheaters}</div>
                <p className="text-xs text-muted-foreground">Surgeries in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{availableTheaters}</div>
                <p className="text-xs text-muted-foreground">Ready for use</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Queue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{mockOTData.emergencyQueue.length}</div>
                <p className="text-xs text-muted-foreground">Waiting for emergency surgery</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="theaters" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white">
              <TabsTrigger value="theaters">Theater Status</TabsTrigger>
              <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Queue</TabsTrigger>
            </TabsList>

            <TabsContent value="theaters" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockOTData.theaters.map((theater) => (
                  <Card key={theater.id} className="border-l-4 border-l-blue-400">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{theater.name}</CardTitle>
                          <p className="text-sm text-gray-600">{theater.id}</p>
                        </div>
                        <Badge className={getStatusColor(theater.status)}>{theater.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {theater.status === "occupied" && theater.currentSurgery && (
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium">{theater.currentSurgery.patient}</p>
                            <p className="text-sm text-gray-600">{theater.currentSurgery.procedure}</p>
                            <p className="text-sm text-gray-600">Surgeon: {theater.currentSurgery.surgeon}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                {theater.currentSurgery.elapsed} / {theater.currentSurgery.estimatedDuration}
                              </span>
                            </div>
                            <Progress value={theater.currentSurgery.progress} className="h-2" />
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Started: {theater.currentSurgery.startTime}</span>
                          </div>
                        </div>
                      )}

                      {theater.status === "available" && (
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span>Ready for use</span>
                          </div>
                          {theater.lastCleaned && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Last cleaned: {theater.lastCleaned}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {theater.status === "maintenance" && (
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium text-yellow-700">{theater.maintenanceType}</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Completion: {theater.estimatedCompletion}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {theater.status === "cleaning" && (
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-blue-600">
                            <Activity className="h-3 w-3 mr-1" />
                            <span>Cleaning in progress</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Completion: {theater.estimatedCompletion}</span>
                          </div>
                        </div>
                      )}

                      {theater.nextSurgery && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700">Next Surgery:</p>
                          <p className="text-sm">{theater.nextSurgery.patient}</p>
                          <p className="text-sm text-gray-600">{theater.nextSurgery.procedure}</p>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{theater.nextSurgery.scheduledTime}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>Today's Surgery Schedule</span>
                  </CardTitle>
                  <CardDescription>All scheduled surgeries for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOTData.todaySchedule.map((surgery) => (
                      <div
                        key={surgery.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          surgery.status === "in-progress" ? "bg-blue-50 border-blue-200" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center w-20">
                            <p className="font-medium text-gray-900">{surgery.time}</p>
                            <p className="text-xs text-gray-500">{surgery.duration}</p>
                          </div>
                          <div>
                            <p className="font-medium">{surgery.patient}</p>
                            <p className="text-sm text-gray-600">{surgery.procedure}</p>
                            <p className="text-sm text-gray-600">
                              {surgery.surgeon} • {surgery.theater}
                            </p>
                          </div>
                        </div>
                        <Badge className={`text-white ${getScheduleStatusColor(surgery.status)}`}>
                          {surgery.status === "in-progress" ? "In Progress" : "Scheduled"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span>Emergency Surgery Queue</span>
                  </CardTitle>
                  <CardDescription>Patients waiting for emergency surgery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOTData.emergencyQueue.map((emergency) => (
                      <div
                        key={emergency.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center w-20">
                            <p className="font-medium text-xs text-red-700">EMERGENCY</p>
                            <p className="text-xs text-red-600">Wait: {emergency.waitTime}</p>
                          </div>
                          <div>
                            <p className="font-medium text-xs">{emergency.patient}</p>
                            <p className="text-sm text-gray-600">{emergency.condition}</p>
                            <p className="text-sm text-gray-600">Estimated duration: {emergency.estimatedDuration}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(emergency.priority)}>{emergency.priority}</Badge>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            Assign Theater
                          </Button>
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
