"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pill, Search, ShoppingCart, Plus, Edit } from "lucide-react"
import { addDrugToInventoryAction, updateDrugInventoryAction, createReorderAction } from "@/lib/pharmacist-actions"
import { useToast } from "@/hooks/use-toast"

interface DrugInventoryItem {
    id: string
    drugName: string
    currentStock: number
    minStock: number
    status: string
    category: string
    updatedAt: string
    location?: string
    batchNumber?: string
    expiryDate?: string
}

interface InventoryClientProps {
    inventory: DrugInventoryItem[]
}

export default function InventoryClient({ inventory }: InventoryClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [currentDrug, setCurrentDrug] = useState<DrugInventoryItem | null>(null)
    const { toast } = useToast()
    
    const [newDrug, setNewDrug] = useState({
        drugName: "",
        currentStock: 0,
        minStock: 0,
        category: "General",
        location: "Main Pharmacy",
        batchNumber: "",
        expiryDate: "",
    })
    
    const [editDrug, setEditDrug] = useState<DrugInventoryItem | null>(null)

    const filteredInventory = inventory.filter(
        (item) =>
            item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleAddDrug = async () => {
        try {
            const result = await addDrugToInventoryAction({
                ...newDrug,
                expiryDate: newDrug.expiryDate ? new Date(newDrug.expiryDate) : undefined,
            })

            if (result.success) {
                toast({
                    title: "Drug added successfully",
                    description: `${newDrug.drugName} has been added to inventory.`,
                })
                setIsAddDialogOpen(false)
                setNewDrug({
                    drugName: "",
                    currentStock: 0,
                    minStock: 0,
                    category: "General",
                    location: "Main Pharmacy",
                    batchNumber: "",
                    expiryDate: "",
                })
            } else {
                toast({
                    title: "Error adding drug",
                    description: result.error || "An error occurred while adding the drug.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error adding drug",
                description: "An unexpected error occurred.",
                variant: "destructive",
            })
        }
    }

    const handleEditDrug = async () => {
        if (!editDrug) return

        try {
            const result = await updateDrugInventoryAction(editDrug.id, {
                ...editDrug,
                expiryDate: editDrug.expiryDate ? new Date(editDrug.expiryDate) : undefined,
            })

            if (result.success) {
                toast({
                    title: "Drug updated successfully",
                    description: `${editDrug.drugName} has been updated.`,
                })
                setIsEditDialogOpen(false)
                setEditDrug(null)
            } else {
                toast({
                    title: "Error updating drug",
                    description: result.error || "An error occurred while updating the drug.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error updating drug",
                description: "An unexpected error occurred.",
                variant: "destructive",
            })
        }
    }

    const handleReorder = async (drugId: string) => {
        try {
            const result = await createReorderAction(drugId)

            if (result.success) {
                toast({
                    title: "Reorder created",
                    description: "A reorder request has been created.",
                })
            } else {
                toast({
                    title: "Error creating reorder",
                    description: result.error || "An error occurred while creating the reorder.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error creating reorder",
                description: "An unexpected error occurred.",
                variant: "destructive",
            })
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200"
            case "low":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            default:
                return "bg-green-100 text-green-800 border-green-200"
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Pill className="h-5 w-5 text-blue-600" />
                            <span>Drug Inventory</span>
                        </CardTitle>
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Drug
                        </Button>
                    </div>
                    <CardDescription>Current stock levels across all pharmacy units</CardDescription>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or category..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredInventory.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No drugs found matching your search criteria.</div>
                        ) : (
                            filteredInventory.map((drug) => (
                                <div key={drug.id} className="p-4 border rounded-lg bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-medium">{drug.drugName}</h3>
                                            <p className="text-sm text-gray-600">{drug.category}</p>
                                        </div>
                                        <Badge className={getStatusColor(drug.status)}>{drug.status}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Current Stock: {drug.currentStock} units</span>
                                            <span>Min Required: {drug.minStock} units</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${drug.status === "critical"
                                                        ? "bg-red-600"
                                                        : drug.status === "low"
                                                            ? "bg-yellow-500"
                                                            : "bg-green-500"
                                                    }`}
                                                style={{
                                                    width: `${Math.min((drug.currentStock / (drug.minStock * 2)) * 100, 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Location: {drug.location || "Main Pharmacy"}</span>
                                            <span>Last Updated: {new Date(drug.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                        {drug.expiryDate && (
                                            <div className="text-xs text-gray-500">
                                                Expiry: {new Date(drug.expiryDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 flex space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setCurrentDrug(drug)
                                                setEditDrug(drug)
                                                setIsEditDialogOpen(true)
                                            }}
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit
                                        </Button>
                                        {(drug.status === "critical" || drug.status === "low") && (
                                            <Button size="sm" variant="outline" onClick={() => handleReorder(drug.id)}>
                                                <ShoppingCart className="h-3 w-3 mr-1" />
                                                Reorder
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Drug</DialogTitle>
                        <DialogDescription>Enter the details of the new drug to add to inventory.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="drugName">Drug Name</Label>
                            <Input
                                id="drugName"
                                value={newDrug.drugName}
                                onChange={(e) => setNewDrug({ ...newDrug, drugName: e.target.value })}
                                placeholder="Enter drug name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="currentStock">Current Stock</Label>
                                <Input
                                    id="currentStock"
                                    type="number"
                                    value={newDrug.currentStock}
                                    onChange={(e) => setNewDrug({ ...newDrug, currentStock: Number.parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="minStock">Minimum Stock</Label>
                                <Input
                                    id="minStock"
                                    type="number"
                                    value={newDrug.minStock}
                                    onChange={(e) => setNewDrug({ ...newDrug, minStock: Number.parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select value={newDrug.category} onValueChange={(value) => setNewDrug({ ...newDrug, category: value })}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                                        <SelectItem value="Analgesics">Analgesics</SelectItem>
                                        <SelectItem value="Cardiac">Cardiac</SelectItem>
                                        <SelectItem value="Respiratory">Respiratory</SelectItem>
                                        <SelectItem value="Gastrointestinal">Gastrointestinal</SelectItem>
                                        <SelectItem value="Neurological">Neurological</SelectItem>
                                        <SelectItem value="Psychiatric">Psychiatric</SelectItem>
                                        <SelectItem value="Endocrine">Endocrine</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={newDrug.location}
                                    onChange={(e) => setNewDrug({ ...newDrug, location: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="batchNumber">Batch Number</Label>
                                <Input
                                    id="batchNumber"
                                    value={newDrug.batchNumber}
                                    onChange={(e) => setNewDrug({ ...newDrug, batchNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                    id="expiryDate"
                                    type="date"
                                    value={newDrug.expiryDate}
                                    onChange={(e) => setNewDrug({ ...newDrug, expiryDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddDrug}>Add Drug</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Drug</DialogTitle>
                        <DialogDescription>Update the details of {editDrug?.drugName}.</DialogDescription>
                    </DialogHeader>
                    {editDrug && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-2">
                                <Label htmlFor="editDrugName">Drug Name</Label>
                                <Input
                                    id="editDrugName"
                                    value={editDrug.drugName}
                                    onChange={(e) => setEditDrug({ ...editDrug, drugName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editCurrentStock">Current Stock</Label>
                                    <Input
                                        id="editCurrentStock"
                                        type="number"
                                        value={editDrug.currentStock}
                                        onChange={(e) => setEditDrug({ ...editDrug, currentStock: Number.parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editMinStock">Minimum Stock</Label>
                                    <Input
                                        id="editMinStock"
                                        type="number"
                                        value={editDrug.minStock}
                                        onChange={(e) => setEditDrug({ ...editDrug, minStock: Number.parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editCategory">Category</Label>
                                    <Select
                                        value={editDrug.category}
                                        onValueChange={(value) => setEditDrug({ ...editDrug, category: value })}
                                    >
                                        <SelectTrigger id="editCategory">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                                            <SelectItem value="Analgesics">Analgesics</SelectItem>
                                            <SelectItem value="Cardiac">Cardiac</SelectItem>
                                            <SelectItem value="Respiratory">Respiratory</SelectItem>
                                            <SelectItem value="Gastrointestinal">Gastrointestinal</SelectItem>
                                            <SelectItem value="Neurological">Neurological</SelectItem>
                                            <SelectItem value="Psychiatric">Psychiatric</SelectItem>
                                            <SelectItem value="Endocrine">Endocrine</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="editLocation">Location</Label>
                                    <Input
                                        id="editLocation"
                                        value={editDrug.location || ""}
                                        onChange={(e) => setEditDrug({ ...editDrug, location: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editBatchNumber">Batch Number</Label>
                                    <Input
                                        id="editBatchNumber"
                                        value={editDrug.batchNumber || ""}
                                        onChange={(e) => setEditDrug({ ...editDrug, batchNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editExpiryDate">Expiry Date</Label>
                                    <Input
                                        id="editExpiryDate"
                                        type="date"
                                        value={editDrug.expiryDate ? new Date(editDrug.expiryDate).toISOString().split("T")[0] : ""}
                                        onChange={(e) =>
                                            setEditDrug({ ...editDrug, expiryDate: e.target.value ? e.target.value : undefined })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditDrug}>Update Drug</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}