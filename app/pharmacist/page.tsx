"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Pill, Search, AlertTriangle, Package, FileText, ShoppingCart, CheckCircle, XCircle } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"

const mockData = {
  inventory: [
    { id: 1, name: "Paracetamol 500mg", stock: 2500, minStock: 500, status: "available", category: "Analgesic" },
    { id: 2, name: "Amoxicillin 250mg", stock: 150, minStock: 200, status: "low", category: "Antibiotic" },
    { id: 3, name: "Insulin Injection", stock: 45, minStock: 100, status: "critical", category: "Hormone" },
    { id: 4, name: "Aspirin 75mg", stock: 1800, minStock: 300, status: "available", category: "Antiplatelet" },
    { id: 5, name: "Atenolol 50mg", stock: 320, minStock: 200, status: "available", category: "Beta Blocker" },
    { id: 6, name: "Diazepam 5mg", stock: 120, minStock: 150, status: "low", category: "Sedative" },
  ],
  prescriptions: [
    {
      id: "RX001",
      patient: "Rajesh Kumar",
      doctor: "Dr. Sharath Kumar",
      items: [
        { name: "Paracetamol 500mg", dosage: "1-0-1", days: 5 },
        { name: "Amoxicillin 250mg", dosage: "1-1-1", days: 7 },
      ],
      status: "pending",
      time: "10:15 AM",
    },
    {
      id: "RX002",
      patient: "Priya Sharma",
      doctor: "Dr. Priya Nair",
      items: [
        { name: "Aspirin 75mg", dosage: "0-1-0", days: 30 },
        { name: "Atenolol 50mg", dosage: "1-0-0", days: 30 },
      ],
      status: "processing",
      time: "09:45 AM",
    },
    {
      id: "RX003",
      patient: "Mohammed Ali",
      doctor: "Dr. Rajesh Menon",
      items: [{ name: "Diazepam 5mg", dosage: "0-0-1", days: 10 }],
      status: "completed",
      time: "09:30 AM",
    },
  ],
  orders: [
    {
      id: "PO001",
      supplier: "MedSupply Ltd",
      items: [
        { name: "Amoxicillin 250mg", quantity: 500 },
        { name: "Insulin Injection", quantity: 200 },
      ],
      status: "ordered",
      date: "2025-06-03",
    },
    {
      id: "PO002",
      supplier: "PharmaCare Inc",
      items: [{ name: "Diazepam 5mg", quantity: 300 }],
      status: "shipped",
      date: "2025-06-01",
    },
    {
      id: "PO003",
      supplier: "MediTech Solutions",
      items: [
        { name: "Paracetamol 500mg", quantity: 1000 },
        { name: "Aspirin 75mg", quantity: 500 },
      ],
      status: "delivered",
      date: "2025-05-28",
    },
  ],
}

export default function PharmacistDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentDate] = useState(new Date())

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "low":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "available":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getPrescriptionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ordered":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredInventory = mockData.inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AuthGuard allowedRoles={["pharmacist"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
              <p className="text-gray-500">
                {currentDate.toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Purchase Order
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockData.inventory.filter((item) => item.status === "critical").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mockData.inventory.filter((item) => item.status === "low").length} items running low
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
                <FileText className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockData.prescriptions.filter((rx) => rx.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mockData.prescriptions.filter((rx) => rx.status === "processing").length} in processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incoming Orders</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockData.orders.filter((order) => order.status === "shipped").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mockData.orders.filter((order) => order.status === "ordered").length} orders placed
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="inventory" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    <span>Drug Inventory</span>
                  </CardTitle>
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
                    {filteredInventory.map((drug) => {
                      const stockPercentage = (drug.stock / (drug.minStock * 2)) * 100

                      return (
                        <div key={drug.id} className="p-4 border rounded-lg bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-medium">{drug.name}</h3>
                              <p className="text-sm text-gray-600">{drug.category}</p>
                            </div>
                            <Badge className={getStatusColor(drug.status)}>{drug.status}</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Current Stock: {drug.stock} units</span>
                              <span>Min Required: {drug.minStock} units</span>
                            </div>
                            <Progress
                              value={Math.min(stockPercentage, 100)}
                              className={`h-2 ${
                                drug.status === "critical"
                                  ? "bg-red-100"
                                  : drug.status === "low"
                                    ? "bg-yellow-100"
                                    : "bg-green-100"
                              }`}
                            />
                          </div>
                          {(drug.status === "critical" || drug.status === "low") && (
                            <div className="mt-2">
                              <Button size="sm" variant="outline">
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Reorder
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Prescription Queue</span>
                  </CardTitle>
                  <CardDescription>Prescriptions awaiting dispensing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className={`border rounded-lg p-4 ${
                          prescription.status === "pending"
                            ? "bg-yellow-50 border-yellow-200"
                            : prescription.status === "processing"
                              ? "bg-blue-50 border-blue-200"
                              : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{prescription.patient}</h3>
                            <p className="text-sm text-gray-600">
                              Prescribed by {prescription.doctor} • {prescription.time}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-white ${getPrescriptionStatusColor(prescription.status)}`}>
                              {prescription.status}
                            </Badge>
                            <span className="text-sm font-medium">{prescription.id}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {prescription.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>{item.name}</span>
                              <span className="text-gray-600">
                                {item.dosage} for {item.days} days
                              </span>
                            </div>
                          ))}
                        </div>

                        {prescription.status === "pending" && (
                          <div className="mt-3 flex space-x-2">
                            <Button size="sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Start Processing
                            </Button>
                            <Button size="sm" variant="outline">
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {prescription.status === "processing" && (
                          <div className="mt-3">
                            <Button size="sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete Dispensing
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span>Purchase Orders</span>
                  </CardTitle>
                  <CardDescription>Track incoming inventory orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{order.supplier}</h3>
                            <p className="text-sm text-gray-600">
                              Order Date: {new Date(order.date).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                            <span className="text-sm font-medium">{order.id}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>{item.name}</span>
                              <span className="text-gray-600">{item.quantity} units</span>
                            </div>
                          ))}
                        </div>

                        {order.status === "delivered" && (
                          <div className="mt-3">
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirm Receipt
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
