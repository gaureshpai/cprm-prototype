"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Search, Filter, Plus, AlertTriangle, ShoppingCart, Edit } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

interface DrugInventory {
  id: string
  drug_name: string
  stock_qty: number
  reorder_level: number
  status: string
  category: string
  last_updated: string
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<DrugInventory[]>([])
  const [filteredInventory, setFilteredInventory] = useState<DrugInventory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newDrug, setNewDrug] = useState({
    drug_name: "",
    stock_qty: 0,
    reorder_level: 0,
    category: "",
    status: "available",
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    filterInventory()
  }, [inventory, searchTerm, statusFilter, categoryFilter])

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/inventory")
      const data = await response.json()
      setInventory(data)
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterInventory = () => {
    let filtered = inventory

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    setFilteredInventory(filtered)
  }

  const handleAddDrug = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDrug),
      })

      if (response.ok) {
        fetchInventory()
        setIsAddDialogOpen(false)
        setNewDrug({
          drug_name: "",
          stock_qty: 0,
          reorder_level: 0,
          category: "",
          status: "available",
        })
      }
    } catch (error) {
      console.error("Error adding drug:", error)
    }
  }

  const handleReorder = async (drugId: string) => {
    try {
      await fetch(`/api/inventory/${drugId}/reorder`, { method: "POST" })
      // Show success message or redirect to purchase orders
    } catch (error) {
      console.error("Error creating reorder:", error)
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

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock <= reorderLevel * 0.5) return "critical"
    if (stock <= reorderLevel) return "low"
    return "available"
  }

  const categories = [...new Set(inventory.map((item) => item.category))]

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
    <AuthGuard allowedRoles={["pharmacist"]} className="container mx-auto p-6 space-y-6">
      <Navbar />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Drug Inventory</h1>
          <p className="text-gray-600">Manage hospital pharmaceutical inventory</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Total Items: {inventory.length}
          </Badge>
          <Badge className="bg-red-500 text-sm">
            Low Stock:{" "}
            {inventory.filter((item) => getStockStatus(item.stock_qty, item.reorder_level) !== "available").length}
          </Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Drug
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Drug</DialogTitle>
                <DialogDescription>Add a new drug to the inventory system</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDrug} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="drug_name">Drug Name</Label>
                  <Input
                    id="drug_name"
                    value={newDrug.drug_name}
                    onChange={(e) => setNewDrug({ ...newDrug, drug_name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_qty">Stock Quantity</Label>
                    <Input
                      id="stock_qty"
                      type="number"
                      value={newDrug.stock_qty}
                      onChange={(e) => setNewDrug({ ...newDrug, stock_qty: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorder_level">Reorder Level</Label>
                    <Input
                      id="reorder_level"
                      type="number"
                      value={newDrug.reorder_level}
                      onChange={(e) => setNewDrug({ ...newDrug, reorder_level: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newDrug.category}
                    onChange={(e) => setNewDrug({ ...newDrug, category: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Drug
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search drugs by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Low Stock Alert */}
      {inventory.filter((item) => getStockStatus(item.stock_qty, item.reorder_level) === "critical").length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Stock Alert:</strong>{" "}
            {inventory.filter((item) => getStockStatus(item.stock_qty, item.reorder_level) === "critical").length} items
            are critically low and need immediate reordering.
          </AlertDescription>
        </Alert>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => {
          const stockStatus = getStockStatus(item.stock_qty, item.reorder_level)
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{item.drug_name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(stockStatus)}>{stockStatus}</Badge>
                </div>
                <CardDescription>{item.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Stock:</span>
                    <div
                      className={`text-lg font-bold ${stockStatus === "critical" ? "text-red-600" : stockStatus === "low" ? "text-yellow-600" : "text-green-600"}`}
                    >
                      {item.stock_qty}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Reorder Level:</span>
                    <div className="text-gray-600">{item.reorder_level}</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Last updated: {new Date(item.last_updated).toLocaleDateString()}
                </div>

                <div className="flex space-x-2">
                  {stockStatus !== "available" && (
                    <Button size="sm" onClick={() => handleReorder(item.id)} className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Reorder
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </AuthGuard>
  )
}
