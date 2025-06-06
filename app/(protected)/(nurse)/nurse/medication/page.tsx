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
import { Pill, Clock, CheckCircle, AlertTriangle, Search, FileText } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

interface Medication {
  id: string
  patientId: string
  patientName: string
  medication: string
  dosage: string
  frequency: string
  time: string
  status: "due" | "administered" | "missed" | "skipped"
  notes?: string
  administeredAt?: string
  administeredBy?: string
}

export default function MedicationPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [isAdministerDialogOpen, setIsAdministerDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [administrationNotes, setAdministrationNotes] = useState("")

  useEffect(() => {
    fetchMedications()
    const interval = setInterval(fetchMedications, 60000) 
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterMedications()
  }, [medications, searchTerm, statusFilter])

  const fetchMedications = async () => {
    try {
      const response = await fetch("/api/medications")
      const data = await response.json()
      setMedications(data)
    } catch (error) {
      console.error("Error fetching medications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterMedications = () => {
    let filtered = medications

    if (searchTerm) {
      filtered = filtered.filter(
        (med) =>
          med.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.medication.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((med) => med.status === statusFilter)
    }
    
    filtered.sort((a, b) => {
      if (a.status === "due" && b.status !== "due") return -1
      if (a.status !== "due" && b.status === "due") return 1
      return a.time.localeCompare(b.time)
    })

    setFilteredMedications(filtered)
  }

  const handleAdministerMedication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedication) return

    try {
      const response = await fetch(`/api/medications/${selectedMedication.id}/administer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: administrationNotes,
          administeredAt: new Date().toISOString(),
          administeredBy: "Current Nurse", 
        }),
      })

      if (response.ok) {
        fetchMedications()
        setIsAdministerDialogOpen(false)
        setAdministrationNotes("")
        setSelectedMedication(null)
      }
    } catch (error) {
      console.error("Error administering medication:", error)
    }
  }

  const handleSkipMedication = async (medicationId: string, reason: string) => {
    try {
      await fetch(`/api/medications/${medicationId}/skip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })
      fetchMedications()
    } catch (error) {
      console.error("Error skipping medication:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "due":
        return "bg-red-500 text-white"
      case "administered":
        return "bg-green-500 text-white"
      case "missed":
        return "bg-orange-500 text-white"
      case "skipped":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "due":
        return <Clock className="h-4 w-4" />
      case "administered":
        return <CheckCircle className="h-4 w-4" />
      case "missed":
        return <AlertTriangle className="h-4 w-4" />
      case "skipped":
        return <FileText className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const openAdministerDialog = (medication: Medication) => {
    setSelectedMedication(medication)
    setIsAdministerDialogOpen(true)
  }

  const dueMedications = medications.filter((med) => med.status === "due")
  const overdueMedications = medications.filter((med) => {
    if (med.status !== "due") return false
    const medicationTime = new Date(`2025-01-01 ${med.time}`)
    const currentTime = new Date()
    const currentTimeFormatted = new Date(
      `2025-01-01 ${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, "0")}`,
    )
    return medicationTime < currentTimeFormatted
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Medication Administration</h1>
          <p className="text-gray-600">Manage and administer patient medications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Total: {medications.length}
          </Badge>
          <Badge className="bg-red-500 text-sm">Due: {dueMedications.length}</Badge>
          {overdueMedications.length > 0 && (
            <Badge className="bg-orange-500 text-sm">Overdue: {overdueMedications.length}</Badge>
          )}
        </div>
      </div>
      {overdueMedications.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Overdue Medications:</strong> {overdueMedications.length} medications are past their scheduled time
            and need immediate attention.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by patient name or medication..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          title="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 p-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="due">Due</option>
          <option value="administered">Administered</option>
          <option value="missed">Missed</option>
          <option value="skipped">Skipped</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMedications.map((medication) => (
          <Card
            key={medication.id}
            className={`hover:shadow-lg transition-shadow ${medication.status === "due" ? "border-red-200" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{medication.medication}</CardTitle>
                    <CardDescription>{medication.patientName}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(medication.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(medication.status)}
                    <span>{medication.status}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Dosage:</span>
                  <div className="text-gray-600">{medication.dosage}</div>
                </div>
                <div>
                  <span className="font-medium">Frequency:</span>
                  <div className="text-gray-600">{medication.frequency}</div>
                </div>
                <div>
                  <span className="font-medium">Scheduled Time:</span>
                  <div className={`font-medium ${medication.status === "due" ? "text-red-600" : "text-gray-600"}`}>
                    {medication.time}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className="text-gray-600">{medication.status}</div>
                </div>
              </div>

              {medication.notes && (
                <div className="text-sm">
                  <span className="font-medium">Notes:</span>
                  <div className="text-gray-600 mt-1">{medication.notes}</div>
                </div>
              )}

              {medication.administeredAt && (
                <div className="text-xs text-gray-500">
                  Administered: {new Date(medication.administeredAt).toLocaleString()}
                  {medication.administeredBy && ` by ${medication.administeredBy}`}
                </div>
              )}

              {medication.status === "due" && (
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => openAdministerDialog(medication)} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Administer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSkipMedication(medication.id, "Patient refused")}
                    className="flex-1"
                  >
                    Skip
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedications.length === 0 && (
        <div className="text-center py-12">
          <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
          <p className="text-gray-600">No medications match your current filters.</p>
        </div>
      )}
      <Dialog open={isAdministerDialogOpen} onOpenChange={setIsAdministerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administer Medication</DialogTitle>
            <DialogDescription>
              Confirm administration of {selectedMedication?.medication} to {selectedMedication?.patientName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdministerMedication} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div>
                <strong>Patient:</strong> {selectedMedication?.patientName}
              </div>
              <div>
                <strong>Medication:</strong> {selectedMedication?.medication}
              </div>
              <div>
                <strong>Dosage:</strong> {selectedMedication?.dosage}
              </div>
              <div>
                <strong>Scheduled Time:</strong> {selectedMedication?.time}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="administrationNotes">Administration Notes (Optional)</Label>
              <Textarea
                id="administrationNotes"
                value={administrationNotes}
                onChange={(e) => setAdministrationNotes(e.target.value)}
                placeholder="Any observations or notes about the administration..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Administration
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdministerDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  )
}
