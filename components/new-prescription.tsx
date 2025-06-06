"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Search, FileText, User, Pill } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { mockPatients, commonMedications } from "@/lib/mock-data"
import { Medication, Patient } from "@/lib/interfaces"

export default function NewPrescription() {
  const { toast } = useToast()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientSearch, setPatientSearch] = useState("")
  const [medications, setMedications] = useState<Medication[]>([])
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")

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
  }

  return (
    <Dialog>
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
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              Create Prescription
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
