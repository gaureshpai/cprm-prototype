"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { FileText, Search, CheckCircle } from "lucide-react"
import { processPrescriptionAction, completePrescriptionAction } from "@/lib/pharmacist-actions"
import { useToast } from "@/hooks/use-toast"

interface PrescriptionItem {
  id: string
  drugName: string
  dosage: string
  frequency: string
  duration: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
}

interface Prescription {
  id: string
  patient: string
  doctor: string
  status: string
  createdAt: string
  items: PrescriptionItem[]
  totalAmount?: number
}

interface OrdersClientProps {
  prescriptions: Prescription[]
}

export default function OrdersClient({ prescriptions }: OrdersClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false)
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null)
  const [dispensedItems, setDispensedItems] = useState<
    Array<{ itemId: string; drugName: string; quantityDispensed: number }>
  >([])
  const { toast } = useToast()

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      (activeTab === "all" || prescription.status === activeTab) &&
      (prescription.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.id.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleStartProcessing = (prescription: Prescription) => {
    setCurrentPrescription(prescription)
    setDispensedItems(
      prescription.items.map((item:any) => ({
        itemId: item.id,
        drugName: item.drugName,
        quantityDispensed: item.quantity,
      })),
    )
    setIsProcessingDialogOpen(true)
  }

  const handleProcessPrescription = async () => {
    if (!currentPrescription) return

    try {
      const result = await processPrescriptionAction(currentPrescription.id, dispensedItems)

      if (result.success) {
        toast({
          title: "Prescription processing started",
          description: `Prescription for ${currentPrescription.patient} is now being processed.`,
        })
        setIsProcessingDialogOpen(false)
      } else {
        toast({
          title: "Error processing prescription",
          description: result.error || "An error occurred while processing the prescription.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error processing prescription",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const handleCompletePrescription = async (prescriptionId: string) => {
    try {
      const result = await completePrescriptionAction(prescriptionId)

      if (result.success) {
        toast({
          title: "Prescription completed",
          description: "The prescription has been marked as completed.",
        })
      } else {
        toast({
          title: "Error completing prescription",
          description: result.error || "An error occurred while completing the prescription.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error completing prescription",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const getPrescriptionStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const updateDispensedQuantity = (itemId: string, quantity: number) => {
    setDispensedItems((prev) =>
      prev.map((item) => (item.itemId === itemId ? { ...item, quantityDispensed: quantity } : item)),
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Prescription Orders</span>
          </CardTitle>
          <CardDescription>Manage and process prescription orders from doctors</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient, doctor, or prescription ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No prescriptions found matching your criteria.</div>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">Prescription #{prescription.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">
                          Patient: {prescription.patient} | Doctor: {prescription.doctor}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(prescription.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getPrescriptionStatusColor(prescription.status)}>{prescription.status}</Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <h4 className="text-sm font-medium">Medications:</h4>
                      {prescription.items.map((item) => (
                        <div key={item.id} className="text-sm bg-gray-50 p-2 rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{item.drugName}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.dosage} | {item.frequency} | {item.duration}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      {prescription.status === "Pending" && (
                        <Button size="sm" onClick={() => handleStartProcessing(prescription)}>
                          Start Processing
                        </Button>
                      )}
                      {prescription.status === "processing" && (
                        <Button size="sm" variant="outline" onClick={() => handleCompletePrescription(prescription.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      )}
                      {prescription.status === "completed" && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isProcessingDialogOpen} onOpenChange={setIsProcessingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Process Prescription</DialogTitle>
            <DialogDescription>
              Review and adjust quantities for prescription #{currentPrescription?.id.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          {currentPrescription && (
            <div className="space-y-4 py-4">
              <div className="text-sm">
                <p>
                  <strong>Patient:</strong> {currentPrescription.patient}
                </p>
                <p>
                  <strong>Doctor:</strong> {currentPrescription.doctor}
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Medications to Dispense:</h4>
                {dispensedItems.map((item, index) => (
                  <div key={item.itemId} className="flex items-center space-x-3 p-3 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{item.drugName}</div>
                      <div className="text-sm text-gray-600">
                        Prescribed: {currentPrescription.items[index]?.quantity} units
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`quantity-${item.itemId}`} className="text-sm">
                        Dispense:
                      </Label>
                      <Input
                        id={`quantity-${item.itemId}`}
                        type="number"
                        value={item.quantityDispensed}
                        onChange={(e) => updateDispensedQuantity(item.itemId, Number.parseInt(e.target.value))}
                        className="w-20"
                        min="0"
                        max={currentPrescription.items[index]?.quantity}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPrescription}>Process & Update Inventory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
