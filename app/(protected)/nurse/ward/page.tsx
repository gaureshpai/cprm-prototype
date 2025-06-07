"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bed,
  Heart,
  Thermometer,
  Activity,
  Droplets,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

interface Patient {
  id: string
  name: string
  age: number
  bed: string
  condition: string
  status: string
  vitals: {
    temp: string
    bp: string
    pulse: string
    spo2: string
  }
  lastUpdated: string
  notes?: string
}

interface Task {
  id: string
  patientId: string
  patientName: string
  task: string
  priority: "high" | "medium" | "low"
  time: string
  completed: boolean
  notes?: string
}

export default function WardPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newVitals, setNewVitals] = useState({
    temp: "",
    bp: "",
    pulse: "",
    spo2: "",
    notes: "",
  })
  const [newTask, setNewTask] = useState({
    task: "",
    priority: "medium" as "high" | "medium" | "low",
    time: "",
    notes: "",
  })

  useEffect(() => {
    fetchWardData()
  }, [])

  const fetchWardData = async () => {
    try {
      const [patientsResponse, tasksResponse] = await Promise.all([
        fetch("/api/ward/patients"),
        fetch("/api/ward/tasks"),
      ])

      const patientsData = await patientsResponse.json()
      const tasksData = await tasksResponse.json()

      setPatients(patientsData)
      setTasks(tasksData)
    } catch (error) {
      console.error("Error fetching ward data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateVitals = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    try {
      const response = await fetch(`/api/ward/patients/${selectedPatient.id}/vitals`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVitals),
      })

      if (response.ok) {
        fetchWardData()
        setIsVitalsDialogOpen(false)
        setNewVitals({ temp: "", bp: "", pulse: "", spo2: "", notes: "" })
        setSelectedPatient(null)
      }
    } catch (error) {
      console.error("Error updating vitals:", error)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    try {
      const response = await fetch("/api/ward/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
        }),
      })

      if (response.ok) {
        fetchWardData()
        setIsTaskDialogOpen(false)
        setNewTask({ task: "", priority: "medium", time: "", notes: "" })
        setSelectedPatient(null)
      }
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/ward/tasks/${taskId}/complete`, { method: "POST" })
      fetchWardData()
    } catch (error) {
      console.error("Error completing task:", error)
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "stable":
        return "text-green-600 bg-green-50 border-green-200"
      case "improving":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const openVitalsDialog = (patient: Patient) => {
    setSelectedPatient(patient)
    setNewVitals({
      temp: patient.vitals.temp,
      bp: patient.vitals.bp,
      pulse: patient.vitals.pulse,
      spo2: patient.vitals.spo2,
      notes: "",
    })
    setIsVitalsDialogOpen(true)
  }

  const openTaskDialog = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsTaskDialogOpen(true)
  }

  const pendingTasks = tasks.filter((task) => !task.completed)
  const highPriorityTasks = pendingTasks.filter((task) => task.priority === "high")

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard allowedRoles={["nurse"]} className="container mx-auto p-6 space-y-6">
      <Navbar />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ward Management</h1>
          <p className="text-gray-600">Monitor patients and manage ward activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Total Patients: {patients.length}
          </Badge>
          <Badge className="bg-red-500 text-sm">High Priority Tasks: {highPriorityTasks.length}</Badge>
        </div>
      </div>
      {highPriorityTasks.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Urgent Tasks:</strong> You have {highPriorityTasks.length} high priority tasks that need immediate
            attention.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bed className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <CardDescription>
                      Bed {patient.bed} • Age {patient.age}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={`${getConditionColor(patient.condition)} border`}>{patient.condition}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="font-medium">Temp</div>
                    <div className="text-gray-600">{patient.vitals.temp}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="font-medium">BP</div>
                    <div className="text-gray-600">{patient.vitals.bp}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Pulse</div>
                    <div className="text-gray-600">{patient.vitals.pulse}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium">SpO2</div>
                    <div className="text-gray-600">{patient.vitals.spo2}</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Last updated: {new Date(patient.lastUpdated).toLocaleString()}
              </div>

              <div className="flex space-x-2">
                <Button size="sm" onClick={() => openVitalsDialog(patient)} className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Update Vitals
                </Button>
                <Button size="sm" variant="outline" onClick={() => openTaskDialog(patient)} className="flex-1">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Pending Tasks</span>
            <Badge variant="outline">{pendingTasks.length}</Badge>
          </CardTitle>
          <CardDescription>Tasks that need to be completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All tasks completed</h3>
                <p className="text-gray-600">Great job! No pending tasks at this time.</p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <span className="font-medium">{task.patientName}</span>
                      <span className="text-sm text-gray-500">• {task.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{task.task}</p>
                    {task.notes && <p className="text-xs text-gray-500 mt-1">{task.notes}</p>}
                  </div>
                  <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={isVitalsDialogOpen} onOpenChange={setIsVitalsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Vitals - {selectedPatient?.name}</DialogTitle>
            <DialogDescription>Update patient vital signs and add notes</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateVitals} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temp">Temperature</Label>
                <Input
                  id="temp"
                  value={newVitals.temp}
                  onChange={(e) => setNewVitals({ ...newVitals, temp: e.target.value })}
                  placeholder="98.6°F"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bp">Blood Pressure</Label>
                <Input
                  id="bp"
                  value={newVitals.bp}
                  onChange={(e) => setNewVitals({ ...newVitals, bp: e.target.value })}
                  placeholder="120/80"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pulse">Pulse</Label>
                <Input
                  id="pulse"
                  value={newVitals.pulse}
                  onChange={(e) => setNewVitals({ ...newVitals, pulse: e.target.value })}
                  placeholder="72 bpm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spo2">SpO2</Label>
                <Input
                  id="spo2"
                  value={newVitals.spo2}
                  onChange={(e) => setNewVitals({ ...newVitals, spo2: e.target.value })}
                  placeholder="98%"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newVitals.notes}
                onChange={(e) => setNewVitals({ ...newVitals, notes: e.target.value })}
                placeholder="Any additional observations..."
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">
              Update Vitals
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task - {selectedPatient?.name}</DialogTitle>
            <DialogDescription>Add a new task for this patient</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task">Task Description</Label>
              <Input
                id="task"
                value={newTask.task}
                onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                placeholder="Describe the task..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  name="priority"
                  title="Priority"
                  id="priority"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "high" | "medium" | "low" })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  placeholder="10:30 AM"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskNotes">Notes (Optional)</Label>
              <Textarea
                id="taskNotes"
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                placeholder="Additional task details..."
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">
              Add Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  )
}
