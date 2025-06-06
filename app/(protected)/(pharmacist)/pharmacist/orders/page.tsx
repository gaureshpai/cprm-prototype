"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Plus, Package, Truck, CheckCircle, Clock, Search, Filter } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

interface PurchaseOrder {
  id: string
  supplier: string
  status: string
  orderDate: string
  totalCost: number
  items: Array<{
    drugName: string
    quantity: number
    unitCost: number
  }>
}

interface Prescription {
  id: string
  patient: string
  doctor: string
  status: string
  createdAt: string
  items: Array<{
    drugName: string
    dosage: string
    frequency: string
    duration: string
  }>
}

export default function OrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [activeTab, setActiveTab] = useState<"purchase" | "prescriptions">("prescriptions")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false)
  const [newOrder, setNewOrder] = useState({
    supplier: "",
    items: [{ drugName: "", quantity: 0, unitCost: 0 }],
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const [purchaseResponse, prescriptionResponse] = await Promise.all([
        fetch("/api/purchase-orders"),
        fetch("/api/prescriptions"),
      ])

      const purchaseData = await purchaseResponse.json()
      const prescriptionData = await prescriptionResponse.json()

      setPurchaseOrders(purchaseData)
      setPrescriptions(prescriptionData)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      })

      if (response.ok) {
        fetchOrders()
        setIsNewOrderDialogOpen(false)
        setNewOrder({
          supplier: "",
          items: [{ drugName: "", quantity: 0, unitCost: 0 }],
        })
      }
    } catch (error) {
      console.error("Error creating purchase order:", error)
    }
  }

  const handleUpdatePrescriptionStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/prescriptions/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchOrders()
    } catch (error) {
      console.error("Error updating prescription status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500 text-white"
      case "processing":
        return "bg-blue-500 text-white"
      case "completed":
        return "bg-green-500 text-white"
      case "ordered":
        return "bg-yellow-500 text-white"
      case "shipped":
        return "bg-blue-500 text-white"
      case "delivered":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "ordered":
        return <ShoppingCart className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { drugName: "", quantity: 0, unitCost: 0 }],
    })
  }

  const removeOrderItem = (index: number) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter((_, i) => i !== index),
    })
  }

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = newOrder.items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    setNewOrder({ ...newOrder, items: updatedItems })
  }

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch =
      prescription.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    const matchesSearch = order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
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
    <AuthGuard allowedRoles={["pharmacist"]}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-gray-600">Manage prescriptions and purchase orders</p>
        </div>
        <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>Create a new purchase order for drug inventory</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePurchaseOrder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={newOrder.supplier}
                  onChange={(e) => setNewOrder({ ...newOrder, supplier: e.target.value })}
                  placeholder="Enter supplier name"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Order Items</Label>
                  <Button type="button" onClick={addOrderItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {newOrder.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Drug Name</Label>
                      <Input
                        value={item.drugName}
                        onChange={(e) => updateOrderItem(index, "drugName", e.target.value)}
                        placeholder="Drug name"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, "quantity", Number.parseInt(e.target.value))}
                        placeholder="Qty"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit Cost</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => updateOrderItem(index, "unitCost", Number.parseFloat(e.target.value))}
                        placeholder="Cost"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      size="sm"
                      variant="destructive"
                      disabled={newOrder.items.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full">
                Create Purchase Order
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "prescriptions" ? "default" : "ghost"}
          onClick={() => setActiveTab("prescriptions")}
          size="sm"
        >
          Prescriptions ({prescriptions.length})
        </Button>
        <Button
          variant={activeTab === "purchase" ? "default" : "ghost"}
          onClick={() => setActiveTab("purchase")}
          size="sm"
        >
          Purchase Orders ({purchaseOrders.length})
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${activeTab === "prescriptions" ? "prescriptions" : "purchase orders"}...`}
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
            {activeTab === "prescriptions" ? (
              <>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {activeTab === "prescriptions" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrescriptions.map((prescription) => (
            <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">#{prescription.id}</CardTitle>
                  <Badge className={getStatusColor(prescription.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(prescription.status)}
                      <span>{prescription.status}</span>
                    </div>
                  </Badge>
                </div>
                <CardDescription>
                  Patient: {prescription.patient} | Doctor: {prescription.doctor}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Medications:</h4>
                  {prescription.items.map((item, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="font-medium">{item.drugName}</div>
                      <div className="text-gray-600">
                        {item.dosage} | {item.frequency} | {item.duration}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-500">
                  Created: {new Date(prescription.createdAt).toLocaleDateString()}
                </div>

                {prescription.status === "pending" && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdatePrescriptionStatus(prescription.id, "processing")}
                      className="flex-1"
                    >
                      Start Processing
                    </Button>
                  </div>
                )}

                {prescription.status === "processing" && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdatePrescriptionStatus(prescription.id, "completed")}
                      className="flex-1"
                    >
                      Mark Complete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPurchaseOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">#{order.id}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </div>
                  </Badge>
                </div>
                <CardDescription>Supplier: {order.supplier}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Items:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                      <div>
                        <div className="font-medium">{item.drugName}</div>
                        <div className="text-gray-600">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{item.unitCost}</div>
                        <div className="text-gray-600">per unit</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total Cost:</span>
                  <span className="text-lg font-bold">₹{order.totalCost}</span>
                </div>

                <div className="text-xs text-gray-500">Ordered: {new Date(order.orderDate).toLocaleDateString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === "prescriptions" && filteredPrescriptions.length === 0) ||
        (activeTab === "purchase" && filteredPurchaseOrders.length === 0)) && (
        <div className="text-center py-12">
          {activeTab === "prescriptions" ? (
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          ) : (
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab === "prescriptions" ? "prescriptions" : "purchase orders"} found
          </h3>
          <p className="text-gray-600">
            {activeTab === "prescriptions"
              ? "No prescriptions match your current filters."
              : "No purchase orders match your current filters."}
          </p>
        </div>
      )}
    </AuthGuard>
  )
}
