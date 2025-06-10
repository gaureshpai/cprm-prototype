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
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getOTStatusAction, type OTData } from "@/lib/ot-actions"
import { getPriorityColor, getScheduleStatusColor, getStatusColor } from "@/lib/functions"

export default function DoctorOTPage() {
  const [currentDate] = useState(new Date())
  const [otData, setOtData] = useState<OTData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { user } = useAuth()
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p>Loading OT status...</p>
        </div>
      </div>
    )
  }

  const occupiedTheaters = otData.theaters.filter((t) => t.status === "occupied").length
  const availableTheaters = otData.theaters.filter((t) => t.status === "available").length
  const maintenanceTheaters = otData.theaters.filter(
    (t) => t.status === "maintenance" || t.status === "cleaning",
  ).length

  return (
    <AuthGuard allowedRoles={["doctor"]} className="container mx-auto p-6 space-y-6">
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
