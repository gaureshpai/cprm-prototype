"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Clock, Calendar, AlertTriangle, CheckCircle, Activity, Heart } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { SurgeryScheduler } from "@/components/surgery-scheduler"
import { useToast } from "@/hooks/use-toast"
import { getOTStatusAction, type OTData } from "@/lib/ot-actions"
import { getPriorityColor, getScheduleStatusColor, getStatusColor } from "@/lib/functions"
import { TheaterManagementModal } from "@/components/theater-management-modal"
import { Skeleton } from "@/components/ui/skeleton"

export default function DoctorOTPage() {
  const [currentDate] = useState(new Date())
  const [otData, setOtData] = useState<OTData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    loadOTData()
  }, [])

  const loadOTData = async () => {
    try {
      setLoading(true)
      startTransition(async () => {
        const result = await getOTStatusAction()
        if (result.success && result.data) {
          setOtData(result.data)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load OT data",
            variant: "destructive",
          })
        }
      })
    } catch (error) {
      console.error("Error loading OT data:", error)
      toast({
        title: "Error",
        description: "Failed to load OT data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleSuccess = () => {
    setShowScheduleDialog(false)
    loadOTData()
    toast({
      title: "Success",
      description: "Surgery scheduled successfully",
    })
  }

  if (!otData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="min-h-screen bg-gray-50">
          <div className="h-16 bg-white border-b flex items-center px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-32" />
            <div className="ml-auto flex space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                      <Skeleton className="h-3 w-40" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="space-y-1 w-20">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                            <Skeleton className="h-3 w-64" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-3 w-72" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="space-y-1 w-20">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-48" />
                            <Skeleton className="h-3 w-64" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-9 w-28" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const occupiedTheaters = otData.theaters.filter((t) => t.status === "occupied").length
  const availableTheaters = otData.theaters.filter((t) => t.status === "available").length

  return (
    <AuthGuard allowedRoles={["doctor", "admin"]} className="container mx-auto p-6 space-y-6">
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
            <div className="flex space-x-2">
              <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Surgery
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Schedule New Surgery</DialogTitle>
                    <DialogDescription>
                      Schedule a new surgery by selecting patient, theater, and time slot.
                    </DialogDescription>
                  </DialogHeader>
                  <SurgeryScheduler
                    onSuccess={handleScheduleSuccess}
                    onCancel={() => setShowScheduleDialog(false)}
                    availableTheaters={otData.theaters.filter((t) => t.status === "available")}
                  />
                </DialogContent>
              </Dialog>
              <TheaterManagementModal theaters={otData.theaters} onRefresh={loadOTData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Theaters</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{otData.theaters.length}</div>
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
                <div className="text-2xl font-bold text-orange-600">{otData.emergencyQueue.length}</div>
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
                {otData.theaters.map((theater) => (
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

                      {theater.status === "booked" && theater.nextSurgery && (
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-blue-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Surgery Scheduled</span>
                          </div>
                          <div>
                            <p className="font-medium">{theater.nextSurgery.patient}</p>
                            <p className="text-sm text-gray-600">{theater.nextSurgery.procedure}</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Scheduled: {theater.nextSurgery.scheduledTime}</span>
                            </div>
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
                    {otData.todaySchedule.map((surgery) => (
                      <div
                        key={surgery.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${surgery.status === "in-progress" ? "bg-blue-50 border-blue-200" : "bg-white"
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
                    {otData.emergencyQueue.map((emergency) => (
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