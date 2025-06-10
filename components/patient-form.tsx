"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createPatientAction, updatePatientAction } from "@/lib/patient-actions"
import type { PatientData } from "@/lib/doctor-actions"

interface PatientFormProps {
    patient?: PatientData
    onSuccess?: () => void
    onCancel?: () => void
}

export function PatientForm({ patient, onSuccess, onCancel }: PatientFormProps) {
    const [loading, setLoading] = useState(false)
    const [allergies, setAllergies] = useState<string[]>(patient?.allergies || [])
    const [newAllergy, setNewAllergy] = useState("")
    const { toast } = useToast()

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            formData.set("allergies", allergies.join(","))

            let result
            if (patient) {
                formData.set("id", patient.id)
                result = await updatePatientAction(formData)
            } else {
                result = await createPatientAction(formData)
            }

            if (result.success) {
                toast({
                    title: "Success",
                    description: `Patient ${patient ? "updated" : "created"} successfully`,
                })
                onSuccess?.()
            } else {
                toast({
                    title: "Error",
                    description: result.error || `Failed to ${patient ? "update" : "create"} patient`,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            toast({
                title: "Error",
                description: `Failed to ${patient ? "update" : "create"} patient`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const addAllergy = () => {
        if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
            setAllergies([...allergies, newAllergy.trim()])
            setNewAllergy("")
        }
    }

    const removeAllergy = (allergy: string) => {
        setAllergies(allergies.filter((a) => a !== allergy))
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={patient?.name}
                                required
                                placeholder="Enter patient's full name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="age">Age *</Label>
                                <Input
                                    id="age"
                                    name="age"
                                    type="number"
                                    defaultValue={patient?.age}
                                    required
                                    min="0"
                                    max="150"
                                    placeholder="Age"
                                />
                            </div>
                            <div>
                                <Label htmlFor="gender">Gender *</Label>
                                <Select name="gender" defaultValue={patient?.gender} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="bloodType">Blood Type</Label>
                            <Select name="bloodType" defaultValue={patient?.bloodType || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {patient && (
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" defaultValue={patient.status}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Discharged">Discharged</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                defaultValue={patient?.phone || ""}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                defaultValue={patient?.address || ""}
                                placeholder="Enter full address"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                            <Input
                                id="emergencyContact"
                                name="emergencyContact"
                                defaultValue={patient?.emergencyContact || ""}
                                placeholder="Emergency contact name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                            <Input
                                id="emergencyPhone"
                                name="emergencyPhone"
                                type="tel"
                                defaultValue={patient?.emergencyPhone || ""}
                                placeholder="Emergency contact phone"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Medical Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="condition">Current Condition</Label>
                            <Input
                                id="condition"
                                name="condition"
                                defaultValue={patient?.condition || ""}
                                placeholder="Current medical condition"
                            />
                        </div>

                        <div>
                            <Label>Allergies</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={newAllergy}
                                    onChange={(e) => setNewAllergy(e.target.value)}
                                    placeholder="Add allergy"
                                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                                />
                                <Button type="button" onClick={addAllergy} variant="outline">
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {allergies.map((allergy, index) => (
                                    <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        {allergy}
                                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeAllergy(allergy)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Current Vitals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="bp">Blood Pressure</Label>
                                <Input id="bp" name="bp" defaultValue={patient?.vitals?.bp || ""} placeholder="120/80" />
                            </div>
                            <div>
                                <Label htmlFor="pulse">Pulse Rate</Label>
                                <Input id="pulse" name="pulse" defaultValue={patient?.vitals?.pulse || ""} placeholder="72 bpm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="temp">Temperature</Label>
                                <Input id="temp" name="temp" defaultValue={patient?.vitals?.temp || ""} placeholder="98.6°F" />
                            </div>
                            <div>
                                <Label htmlFor="weight">Weight</Label>
                                <Input id="weight" name="weight" defaultValue={patient?.vitals?.weight || ""} placeholder="70 kg" />
                            </div>
                            <div>
                                <Label htmlFor="height">Height</Label>
                                <Input id="height" name="height" defaultValue={patient?.vitals?.height || ""} placeholder="170 cm" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : patient ? "Update Patient" : "Create Patient"}
                </Button>
            </div>
        </form>
    )
}
