"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Droplets, AlertTriangle, Plus, Edit, RefreshCw, Calendar, MapPin } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import {
    getAllBloodBankAction,
    getBloodBankStatsAction,
    updateBloodBankAction,
    type BloodBankData,
    type BloodBankStats,
} from "@/lib/blood-bank-actions"

export default function BloodBankPage() {
    const [bloodBank, setBloodBank] = useState<BloodBankData[]>([])
    const [stats, setStats] = useState<BloodBankStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedBloodType, setSelectedBloodType] = useState<BloodBankData | null>(null)
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    useEffect(() => {
        loadBloodBankData()
    }, [])

    const loadBloodBankData = async () => {
        try {
            setLoading(true)
            startTransition(async () => {
                const [bloodBankResult, statsResult] = await Promise.all([getAllBloodBankAction(), getBloodBankStatsAction()])

                if (bloodBankResult.success && bloodBankResult.data) {
                    setBloodBank(bloodBankResult.data)
                }

                if (statsResult.success && statsResult.data) {
                    setStats(statsResult.data)
                }
            })
        } catch (error) {
            console.error("Error loading blood bank data:", error)
            toast({
                title: "Error",
                description: "Failed to load blood bank data",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateBloodBank = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedBloodType) return

        const formData = new FormData(e.target as HTMLFormElement)

        try {
            startTransition(async () => {
                const result = await updateBloodBankAction(selectedBloodType.id, formData)

                if (result.success) {
                    toast({
                        title: "Success",
                        description: "Blood bank inventory updated successfully",
                    })
                    setIsUpdateDialogOpen(false)
                    setSelectedBloodType(null)
                    await loadBloodBankData()
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to update blood bank inventory",
                        variant: "destructive",
                    })
                }
            })
        } catch (error) {
            console.error("Error updating blood bank:", error)
            toast({
                title: "Error",
                description: "Failed to update blood bank inventory",
                variant: "destructive",
            })
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "critical":
                return "bg-red-500 text-white"
            case "low":
                return "bg-yellow-500 text-white"
            case "available":
                return "bg-green-500 text-white"
            default:
                return "bg-gray-500 text-white"
        }
    }

    const getBloodTypeColor = (bloodType: string) => {
        const colors: Record<string, string> = {
            "A+": "bg-red-100 text-red-800 border-red-200",
            "A-": "bg-red-200 text-red-900 border-red-300",
            "B+": "bg-blue-100 text-blue-800 border-blue-200",
            "B-": "bg-blue-200 text-blue-900 border-blue-300",
            "AB+": "bg-purple-100 text-purple-800 border-purple-200",
            "AB-": "bg-purple-200 text-purple-900 border-purple-300",
            "O+": "bg-green-100 text-green-800 border-green-200",
            "O-": "bg-green-200 text-green-900 border-green-300",
        }
        return colors[bloodType] || "bg-gray-100 text-gray-800 border-gray-200"
    }

    const filteredBloodBank = bloodBank.filter((item) => {
        const matchesSearch =
            item.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
    })

    const criticalBloodTypes = bloodBank.filter((item) => item.unitsAvailable <= item.criticalLevel)

    return (
        <AuthGuard allowedRoles={["technician", "admin"]} className="container mx-auto p-6 space-y-6">
            <Navbar />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Blood Bank Management</h1>
                    <p className="text-gray-600">Monitor and manage blood inventory</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={loadBloodBankData} disabled={isPending}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                        <Droplets className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUnits || 0}</div>
                        <p className="text-xs text-muted-foreground">Available blood units</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Types</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.criticalTypes || 0}</div>
                        <p className="text-xs text-muted-foreground">Below critical level</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                        <Calendar className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats?.expiringUnits || 0}</div>
                        <p className="text-xs text-muted-foreground">Units expiring in 7 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Donations</CardTitle>
                        <Plus className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.recentDonations || 0}</div>
                        <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                </Card>
            </div>

            {criticalBloodTypes.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-red-700">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            Critical Blood Type Alerts
                        </CardTitle>
                        <CardDescription className="text-red-600">
                            The following blood types are at or below critical levels and need immediate attention.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {criticalBloodTypes.map((item) => (
                                <div key={item.id} className="bg-white p-3 rounded-lg border border-red-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className={getBloodTypeColor(item.bloodType)}>{item.bloodType}</Badge>
                                        <Badge className="bg-red-500 text-white">Critical</Badge>
                                    </div>
                                    <p className="text-sm">
                                        <span className="font-medium">{item.unitsAvailable}</span> units available
                                    </p>
                                    <p className="text-xs text-gray-600">Critical level: {item.criticalLevel}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search by blood type or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-4"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="low">Low Stock</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredBloodBank.map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Badge className={`${getBloodTypeColor(item.bloodType)} text-lg px-3 py-1`}>{item.bloodType}</Badge>
                                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600">{item.unitsAvailable}</div>
                                <p className="text-sm text-gray-600">Units Available</p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Critical Level:</span>
                                    <span className="font-medium">{item.criticalLevel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Batch:</span>
                                    <span className="font-medium">{item.batchNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Expires:</span>
                                    <span className="font-medium">{new Date(item.expiryDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-start space-x-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{item.location}</span>
                            </div>

                            <div className="flex space-x-2">
                                <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedBloodType(item)}>
                                            <Edit className="h-4 w-4 mr-1" />
                                            Update
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Update Blood Bank Inventory</DialogTitle>
                                            <DialogDescription>
                                                Update the inventory details for {selectedBloodType?.bloodType} blood type
                                            </DialogDescription>
                                        </DialogHeader>
                                        {selectedBloodType && (
                                            <form onSubmit={handleUpdateBloodBank} className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="unitsAvailable">Units Available</Label>
                                                        <Input
                                                            id="unitsAvailable"
                                                            name="unitsAvailable"
                                                            type="number"
                                                            defaultValue={selectedBloodType.unitsAvailable}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="criticalLevel">Critical Level</Label>
                                                        <Input
                                                            id="criticalLevel"
                                                            name="criticalLevel"
                                                            type="number"
                                                            defaultValue={selectedBloodType.criticalLevel}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Status</Label>
                                                    <Select name="status" defaultValue={selectedBloodType.status}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Available">Available</SelectItem>
                                                            <SelectItem value="Low">Low</SelectItem>
                                                            <SelectItem value="Critical">Critical</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="location">Location</Label>
                                                    <Input id="location" name="location" defaultValue={selectedBloodType.location} required />
                                                </div>

                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setIsUpdateDialogOpen(false)
                                                            setSelectedBloodType(null)
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={isPending}>
                                                        {isPending ? "Updating..." : "Update Inventory"}
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredBloodBank.length === 0 && (
                <div className="text-center py-12">
                    <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No blood inventory found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </AuthGuard>
    )
}
