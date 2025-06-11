"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Plus, Edit, Trash2, Wrench } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { OTTheater } from "@/lib/interfaces"

interface TheaterManagementModalProps {
    theaters: OTTheater[]
    onRefresh: () => void
}

export function TheaterManagementModal({ theaters, onRefresh }: TheaterManagementModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [editingTheater, setEditingTheater] = useState<OTTheater | null>(null)
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        status: "Available",
    })
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = editingTheater ? `/api/theaters/${editingTheater.id}` : "/api/theaters"
            const method = editingTheater ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Theater ${editingTheater ? "updated" : "created"} successfully`,
                })
                setFormData({ id: "", name: "", status: "Available" })
                setEditingTheater(null)
                onRefresh()
            } else {
                throw new Error("Failed to save theater")
            }
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to ${editingTheater ? "update" : "create"} theater`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (theater: OTTheater) => {
        setEditingTheater(theater)
        setFormData({
            id: theater.id,
            name: theater.name,
            status: theater.status === "occupied" ? "Available" : theater.status,
        })
    }

    const handleDelete = async (theaterId: string) => {
        if (!confirm("Are you sure you want to delete this theater?")) return

        try {
            const response = await fetch(`/api/theaters/${theaterId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Theater deleted successfully",
                })
                onRefresh()
            } else {
                throw new Error("Failed to delete theater")
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete theater",
                variant: "destructive",
            })
        }
    }

    const handleStatusChange = async (theaterId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/theaters/${theaterId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Theater status updated successfully",
                })
                onRefresh()
            } else {
                throw new Error("Failed to update status")
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update theater status",
                variant: "destructive",
            })
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "occupied":
                return "bg-red-600 text-white"
            case "available":
                return "bg-green-600 text-white"
            case "booked":
                return "bg-blue-600 text-white"
            case "maintenance":
                return "bg-yellow-600 text-white"
            case "cleaning":
                return "bg-purple-600 text-white"
            default:
                return "bg-gray-600 text-white"
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Theaters
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Theater Management</DialogTitle>
                    <DialogDescription>Create, edit, and manage operating theaters</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {editingTheater ? "Edit Theater" : "Create New Theater"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="theater-id">Theater ID *</Label>
                                        <Input
                                            id="theater-id"
                                            placeholder="e.g., OT-005"
                                            value={formData.id}
                                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                            disabled={!!editingTheater}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="theater-name">Theater Name *</Label>
                                        <Input
                                            id="theater-name"
                                            placeholder="e.g., Operating Theater 5"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="theater-status">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Available">Available</SelectItem>
                                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                <SelectItem value="Cleaning">Cleaning</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button type="submit" disabled={loading} className="flex-1">
                                            {loading ? "Saving..." : editingTheater ? "Update Theater" : "Create Theater"}
                                        </Button>
                                        {editingTheater && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingTheater(null)
                                                    setFormData({ id: "", name: "", status: "Available" })
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Existing Theaters ({theaters.length})</CardTitle>
                                <CardDescription>Manage your operating theaters</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {theaters.map((theater) => (
                                    <div key={theater.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium">{theater.name}</h4>
                                                <Badge className={getStatusColor(theater.status)}>{theater.status}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">{theater.id}</p>
                                            {theater.currentSurgery && (
                                                <p className="text-xs text-blue-600">
                                                    Current: {theater.currentSurgery.patient} - {theater.currentSurgery.procedure}
                                                </p>
                                            )}
                                            {theater.nextSurgery && (
                                                <p className="text-xs text-green-600">
                                                    Next: {theater.nextSurgery.patient} at {theater.nextSurgery.scheduledTime}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {theater.status === "available" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(theater.id, "Maintenance")}
                                                >
                                                    <Wrench className="h-3 w-3" />
                                                </Button>
                                            )}
                                            {theater.status === "maintenance" && (
                                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(theater.id, "Available")}>
                                                    Available
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(theater)}>
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(theater.id)}
                                                disabled={theater.status === "occupied" || theater.status === "booked"}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}