"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Building, Users, Plus, Edit, Trash2, RefreshCw, MapPin, Phone, Mail, Clock } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import {
    getAllDepartmentsAction,
    getDepartmentStatsAction,
    createDepartmentAction,
    updateDepartmentAction,
    deleteDepartmentAction,
    type DepartmentData,
    type DepartmentStats,
} from "@/lib/department-actions"

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<DepartmentData[]>([])
    const [stats, setStats] = useState<DepartmentStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    useEffect(() => {
        loadDepartmentsData()
    }, [])

    const loadDepartmentsData = async () => {
        try {
            setLoading(true)
            startTransition(async () => {
                const [departmentsResult, statsResult] = await Promise.all([
                    getAllDepartmentsAction(),
                    getDepartmentStatsAction(),
                ])

                if (departmentsResult.success && departmentsResult.data) {
                    setDepartments(departmentsResult.data)
                }

                if (statsResult.success && statsResult.data) {
                    setStats(statsResult.data)
                }
            })
        } catch (error) {
            console.error("Error loading departments data:", error)
            toast({
                title: "Error",
                description: "Failed to load departments data",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateDepartment = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)

        try {
            startTransition(async () => {
                const result = await createDepartmentAction(formData)

                if (result.success) {
                    toast({
                        title: "Success",
                        description: "Department created successfully",
                    })
                    setIsCreateDialogOpen(false)
                    await loadDepartmentsData()
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to create department",
                        variant: "destructive",
                    })
                }
            })
        } catch (error) {
            console.error("Error creating department:", error)
            toast({
                title: "Error",
                description: "Failed to create department",
                variant: "destructive",
            })
        }
    }

    const handleUpdateDepartment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedDepartment) return

        const formData = new FormData(e.target as HTMLFormElement)

        try {
            startTransition(async () => {
                const result = await updateDepartmentAction(selectedDepartment.id, formData)

                if (result.success) {
                    toast({
                        title: "Success",
                        description: "Department updated successfully",
                    })
                    setIsEditDialogOpen(false)
                    setSelectedDepartment(null)
                    await loadDepartmentsData()
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to update department",
                        variant: "destructive",
                    })
                }
            })
        } catch (error) {
            console.error("Error updating department:", error)
            toast({
                title: "Error",
                description: "Failed to update department",
                variant: "destructive",
            })
        }
    }

    const handleDeleteDepartment = async (id: string, name: string) => {
        try {
            startTransition(async () => {
                const result = await deleteDepartmentAction(id)

                if (result.success) {
                    toast({
                        title: "Success",
                        description: `Department ${name} deleted successfully`,
                    })
                    await loadDepartmentsData()
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to delete department",
                        variant: "destructive",
                    })
                }
            })
        } catch (error) {
            console.error("Error deleting department:", error)
            toast({
                title: "Error",
                description: "Failed to delete department",
                variant: "destructive",
            })
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active":
                return "bg-green-500 text-white"
            case "Inactive":
                return "bg-gray-500 text-white"
            case "Maintenance":
                return "bg-yellow-500 text-white"
            default:
                return "bg-gray-500 text-white"
        }
    }

    const getOccupancyColor = (occupancy: number, capacity: number) => {
        const percentage = (occupancy / capacity) * 100
        if (percentage >= 90) return "text-red-600"
        if (percentage >= 70) return "text-yellow-600"
        return "text-green-600"
    }

    const filteredDepartments = departments.filter((dept) => {
        const matchesSearch =
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.location.toLowerCase().includes(searchTerm.toLowerCase()) 
        const matchesStatus = statusFilter === "all" || dept.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <AuthGuard allowedRoles={["admin", "technician"]} className="container mx-auto p-6 space-y-6">
            <Navbar />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Department Management</h1>
                    <p className="text-gray-600">Manage hospital departments and their operations</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={loadDepartmentsData} disabled={isPending}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Department
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Department</DialogTitle>
                                <DialogDescription>Add a new department to the hospital system</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateDepartment} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Department Name *</Label>
                                        <Input id="name" name="name" placeholder="Enter department name" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea id="description" name="description" placeholder="Enter department description" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location *</Label>
                                        <Input id="location" name="location" placeholder="Enter location" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Capacity</Label>
                                        <Input id="capacity" name="capacity" type="number" placeholder="Enter capacity" defaultValue="50" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber">Contact Number</Label>
                                        <Input id="contactNumber" name="contactNumber" placeholder="Enter contact number" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" placeholder="Enter email address" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="operatingHours">Operating Hours</Label>
                                    <Input
                                        id="operatingHours"
                                        name="operatingHours"
                                        placeholder="e.g., 24/7 or 8:00 AM - 8:00 PM"
                                        defaultValue="24/7"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specializations">Specializations (comma-separated)</Label>
                                    <Textarea
                                        id="specializations"
                                        name="specializations"
                                        placeholder="Enter specializations separated by commas"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                                    <Textarea id="equipment" name="equipment" placeholder="Enter equipment separated by commas" />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? "Creating..." : "Create Department"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                        <Building className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalDepartments || 0}</div>
                        <p className="text-xs text-muted-foreground">Hospital departments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
                        <Building className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.activeDepartments || 0}</div>
                        <p className="text-xs text-muted-foreground">Currently operational</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCapacity || 0}</div>
                        <p className="text-xs text-muted-foreground">Patient capacity</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                        <Users className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{Math.round(stats?.occupancyRate || 0)}%</div>
                        <p className="text-xs text-muted-foreground">Current occupancy</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search departments by name, location..."
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
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDepartments.map((department) => (
                    <Card key={department.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Building className="h-5 w-5 text-blue-600" />
                                    <CardTitle className="text-lg">{department.name}</CardTitle>
                                </div>
                                <Badge className={getStatusColor(department.status)}>{department.status}</Badge>
                            </div>
                            <CardDescription className="line-clamp-2">{department.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span>{department.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span>{department.operatingHours}</span>
                                </div>
                                {department.contactNumber && (
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span>{department.contactNumber}</span>
                                    </div>
                                )}
                                {department.email && (
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="truncate">{department.email}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <div
                                        className={`text-lg font-bold ${getOccupancyColor(department.currentOccupancy, department.capacity)}`}
                                    >
                                        {department.currentOccupancy}/{department.capacity}
                                    </div>
                                    <p className="text-xs text-gray-600">Occupancy</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-600">
                                        {Math.round((department.currentOccupancy / department.capacity) * 100)}%
                                    </div>
                                    <p className="text-xs text-gray-600">Utilization</p>
                                </div>
                            </div>

                            {department.specializations.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium mb-2">Specializations:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {department.specializations.slice(0, 3).map((spec, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {spec}
                                            </Badge>
                                        ))}
                                        {department.specializations.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{department.specializations.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-2">
                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setSelectedDepartment(department)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Edit Department</DialogTitle>
                                            <DialogDescription>Update department information and settings</DialogDescription>
                                        </DialogHeader>
                                        {selectedDepartment && (
                                            <form onSubmit={handleUpdateDepartment} className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-name">Department Name *</Label>
                                                        <Input id="edit-name" name="name" defaultValue={selectedDepartment.name} required />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-description">Description *</Label>
                                                    <Textarea
                                                        id="edit-description"
                                                        name="description"
                                                        defaultValue={selectedDepartment.description}
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-location">Location *</Label>
                                                        <Input
                                                            id="edit-location"
                                                            name="location"
                                                            defaultValue={selectedDepartment.location}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-status">Status</Label>
                                                        <Select name="status" defaultValue={selectedDepartment.status}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Active">Active</SelectItem>
                                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-capacity">Capacity</Label>
                                                        <Input
                                                            id="edit-capacity"
                                                            name="capacity"
                                                            type="number"
                                                            defaultValue={selectedDepartment.capacity}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-currentOccupancy">Current Occupancy</Label>
                                                        <Input
                                                            id="edit-currentOccupancy"
                                                            name="currentOccupancy"
                                                            type="number"
                                                            defaultValue={selectedDepartment.currentOccupancy}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-contactNumber">Contact Number</Label>
                                                        <Input
                                                            id="edit-contactNumber"
                                                            name="contactNumber"
                                                            defaultValue={selectedDepartment.contactNumber}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-email">Email</Label>
                                                        <Input id="edit-email" name="email" type="email" defaultValue={selectedDepartment.email} />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-operatingHours">Operating Hours</Label>
                                                    <Input
                                                        id="edit-operatingHours"
                                                        name="operatingHours"
                                                        defaultValue={selectedDepartment.operatingHours}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-specializations">Specializations (comma-separated)</Label>
                                                    <Textarea
                                                        id="edit-specializations"
                                                        name="specializations"
                                                        defaultValue={selectedDepartment.specializations.join(", ")}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-equipment">Equipment (comma-separated)</Label>
                                                    <Textarea
                                                        id="edit-equipment"
                                                        name="equipment"
                                                        defaultValue={selectedDepartment.equipment.join(", ")}
                                                    />
                                                </div>

                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setIsEditDialogOpen(false)
                                                            setSelectedDepartment(null)
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={isPending}>
                                                        {isPending ? "Updating..." : "Update Department"}
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete the {department.name} department? This action cannot be undone
                                                and will affect all associated data.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeleteDepartment(department.id, department.name)}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Delete Department
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {(loading || filteredDepartments.length === 0) ? (
                <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Loading departments...</h3>
                    <p className="text-gray-600">Please wait while we fetch the department data.</p>
                </div>
            ) : filteredDepartments.length === 0 && (
                <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </AuthGuard>
    )
}
