"use client"

import type React from "react"
import { useState, useEffect, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Plus, Edit, Trash2, CheckCircle, Clock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    createEmergencyAlertAction,
    updateEmergencyAlertAction,
    deleteEmergencyAlertAction,
    getEmergencyAlertsAction,
} from "@/lib/nurse-actions"
import { getAlertColor, getPriorityLabel } from "@/lib/functions"

interface EmergencyAlert {
    id: string
    codeType: string
    location: string
    message: string
    status: string
    priority: number
    createdAt: string
    resolvedAt: string | null
    broadcastTo: string[]
}

interface EmergencyAlertsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function EmergencyAlertsModal({ isOpen, onClose }: EmergencyAlertsModalProps) {
    const [alerts, setAlerts] = useState<EmergencyAlert[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [editingAlert, setEditingAlert] = useState<EmergencyAlert | null>(null)
    const [activeTab, setActiveTab] = useState("view")
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        codeType: "",
        location: "",
        message: "",
        priority: 3,
        status: "active",
        broadcastTo: ["ALL"],
    })

    useEffect(() => {
        if (isOpen) {
            fetchAlerts()
        }
    }, [isOpen])

    const fetchAlerts = async () => {
        try {
            setLoading(true)
            const result = await getEmergencyAlertsAction()
            if (result.success && result.data) {
                setAlerts(result.data)
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to fetch emergency alerts",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error fetching alerts:", error)
            toast({
                title: "Error",
                description: "Failed to fetch emergency alerts",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            codeType: "",
            location: "",
            message: "",
            priority: 3,
            status: "active",
            broadcastTo: ["ALL"],
        })
        setEditingAlert(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.codeType || !formData.location) {
            toast({
                title: "Error",
                description: "Code type and location are required",
                variant: "destructive",
            })
            return
        }

        startTransition(async () => {
            const formDataObj = new FormData()
            formDataObj.append("codeType", formData.codeType)
            formDataObj.append("location", formData.location)
            formDataObj.append("message", formData.message)
            formDataObj.append("priority", formData.priority.toString())
            formDataObj.append("status", formData.status)
            formDataObj.append("broadcastTo", JSON.stringify(formData.broadcastTo))

            let result
            if (editingAlert) {
                formDataObj.append("id", editingAlert.id)
                result = await updateEmergencyAlertAction(formDataObj)
            } else {
                result = await createEmergencyAlertAction(formDataObj)
            }

            if (result.success) {
                toast({
                    title: "Success",
                    description: `Emergency alert ${editingAlert ? "updated" : "created"} successfully`,
                    variant: "default",
                })
                resetForm()
                setActiveTab("view")
                fetchAlerts()
            } else {
                toast({
                    title: "Error",
                    description: result.error || `Failed to ${editingAlert ? "update" : "create"} emergency alert`,
                    variant: "destructive",
                })
            }
        })
    }

    const handleEdit = (alert: EmergencyAlert) => {
        setEditingAlert(alert)
        setFormData({
            codeType: alert.codeType,
            location: alert.location,
            message: alert.message,
            priority: alert.priority,
            status: alert.status,
            broadcastTo: alert.broadcastTo,
        })
        setActiveTab("create")
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this emergency alert?")) return

        startTransition(async () => {
            const result = await deleteEmergencyAlertAction(id)

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Emergency alert deleted successfully",
                    variant: "default",
                })
                fetchAlerts()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete emergency alert",
                    variant: "destructive",
                })
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                        Emergency Alerts Management
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="view">View Alerts</TabsTrigger>
                        <TabsTrigger value="create">{editingAlert ? "Edit Alert" : "Create Alert"}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="view" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Active Emergency Alerts</h3>
                            <Button onClick={fetchAlerts} variant="outline" size="sm" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {alerts.length > 0 ? (
                                    alerts.map((alert) => (
                                        <Card
                                            key={alert.id}
                                            className={`${alert.status === "active" ? "border-red-200 bg-red-50" : "border-gray-200"}`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Badge className={`${getAlertColor(alert.codeType)} text-white`}>{alert.codeType}</Badge>
                                                            <Badge variant="outline">{getPriorityLabel(alert.priority)}</Badge>
                                                            <Badge variant={alert.status === "active" ? "destructive" : "secondary"}>
                                                                {alert.status === "active" ? "Active" : "Resolved"}
                                                            </Badge>
                                                        </div>
                                                        <p className="font-medium text-gray-900">{alert.location}</p>
                                                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <div className="flex items-center">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Created: {new Date(alert.createdAt).toLocaleString()}
                                                            </div>
                                                            {alert.resolvedAt && (
                                                                <div className="flex items-center">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Resolved: {new Date(alert.resolvedAt).toLocaleString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(alert)} disabled={isPending}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(alert.id)}
                                                            disabled={isPending}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">No emergency alerts found</div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="create" className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="codeType">Code Type *</Label>
                                    <Select
                                        value={formData.codeType}
                                        onValueChange={(value) => setFormData({ ...formData, codeType: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select code type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Code Blue">Code Blue (Medical Emergency)</SelectItem>
                                            <SelectItem value="Code Red">Code Red (Fire)</SelectItem>
                                            <SelectItem value="Code Black">Code Black (Bomb Threat)</SelectItem>
                                            <SelectItem value="Code Orange">Code Orange (External Disaster)</SelectItem>
                                            <SelectItem value="Code Silver">Code Silver (Active Shooter)</SelectItem>
                                            <SelectItem value="Code Yellow">Code Yellow (Missing Patient)</SelectItem>
                                            <SelectItem value="Code Pink">Code Pink (Infant Abduction)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location *</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Enter location"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Additional details (optional)"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority.toString()}
                                        onValueChange={(value) => setFormData({ ...formData, priority: Number.parseInt(value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">Critical (5)</SelectItem>
                                            <SelectItem value="4">High (4)</SelectItem>
                                            <SelectItem value="3">Medium (3)</SelectItem>
                                            <SelectItem value="2">Low (2)</SelectItem>
                                            <SelectItem value="1">Info (1)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        resetForm()
                                        setActiveTab("view")
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending || !formData.codeType || !formData.location}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {editingAlert ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            {editingAlert ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                            {editingAlert ? "Update Alert" : "Create Alert"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}