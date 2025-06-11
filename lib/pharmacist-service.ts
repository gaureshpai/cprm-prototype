import prisma from "@/lib/prisma"

export interface DrugInventoryItem {
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

export interface PrescriptionWithItems {
    id: string
    patient: string
    doctor: string
    status: string
    createdAt: string
    items: Array<{
        id: string
        drugName: string
        dosage: string
        frequency: string
        duration: string
        instructions?: string
    }>
}

export interface PurchaseOrderWithItems {
    id: string
    supplier: string
    status: string
    orderDate: string
    totalCost: number
    items: Array<{
        drugName: string
        quantity: number
        unitCost: number
        total: number
    }>
}

export async function getDrugInventory(): Promise<DrugInventoryItem[]> {
    try {
        const inventory = await prisma.drugInventory.findMany({
            orderBy: { updatedAt: "desc" },
        })

        return inventory.map((item) => ({
            id: item.id,
            drugName: item.drugName,
            currentStock: item.currentStock,
            minStock: item.minStock,
            status: getStockStatus(item.currentStock, item.minStock),
            category: item.category || "General",
            updatedAt: item.updatedAt.toISOString(),
            location: item.location,
            batchNumber: item.batchNumber || undefined,
            expiryDate: item.expiryDate?.toISOString(),
        }))
    } catch (error) {
        console.error("Error fetching drug inventory:", error)
        return []
    }
}

export async function getPrescriptions(): Promise<PrescriptionWithItems[]> {
    try {
        const prescriptions = await prisma.prescription.findMany({
            include: {
                patient: {
                    select: { name: true },
                },
                doctor: {
                    select: { name: true },
                },
                items: {
                    include: {
                        drug: {
                            select: {
                                drugName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return prescriptions.map((prescription) => {
            const items = prescription.items.map((item: any) => ({
                id: item.id,
                drugName: item.drug?.drugName || "Unknown Drug",
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instructions: item.instructions,
            }))

            return {
                id: prescription.id,
                patient: prescription.patient?.name || "Unknown Patient",
                doctor: prescription.doctor?.name || "Unknown Doctor",
                status: prescription.status,
                createdAt: prescription.createdAt.toISOString(),
                items,
            }
        })
    } catch (error) {
        console.error("Error fetching prescriptions:", error)
        return []
    }
}

function getStockStatus(stock: number, reorderLevel: number): string {
    if (stock <= reorderLevel * 0.5) return "critical"
    if (stock <= reorderLevel) return "low"
    return "available"
}

export async function addDrugToInventory(drugData: {
    drugName: string
    currentStock: number
    minStock: number
    category: string
    location: string
    batchNumber?: string
    expiryDate?: Date
}): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.drugInventory.create({
            data: {
                drugName: drugData.drugName,
                currentStock: drugData.currentStock,
                minStock: drugData.minStock,
                category: drugData.category,
                location: drugData.location,
                batchNumber: drugData.batchNumber,
                expiryDate: drugData.expiryDate,
                status: getStockStatus(drugData.currentStock, drugData.minStock),
            },
        })

        return { success: true }
    } catch (error) {
        console.error("Error adding drug to inventory:", error)
        return { success: false, error: "Failed to add drug to inventory" }
    }
}

export async function updateDrugInventory(
    drugId: string,
    updates: Partial<DrugInventoryItem>,
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.drugInventory.update({
            where: { id: drugId },
            data: {
                drugName: updates.drugName,
                currentStock: updates.currentStock,
                minStock: updates.minStock,
                category: updates.category,
                location: updates.location,
                batchNumber: updates.batchNumber,
                expiryDate: updates.expiryDate ? new Date(updates.expiryDate) : undefined,
                status:
                    updates.currentStock !== undefined && updates.minStock !== undefined
                        ? getStockStatus(updates.currentStock, updates.minStock)
                        : undefined,
            },
        })

        return { success: true }
    } catch (error) {
        console.error("Error updating drug inventory:", error)
        return { success: false, error: "Failed to update drug inventory" }
    }
}

export async function processPrescription(
    prescriptionId: string,
    dispensedItems: Array<{
        itemId: string
        drugName: string
        quantityDispensed: number
    }>,
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.prescription.update({
                where: { id: prescriptionId },
                data: { status: "processing" },
            })
            
            for (const item of dispensedItems) {
                const drug = await tx.drugInventory.findFirst({
                    where: { drugName: item.drugName },
                })

                if (!drug) {
                    throw new Error(`Drug ${item.drugName} not found in inventory`)
                }

                if (drug.currentStock < item.quantityDispensed) {
                    throw new Error(
                        `Insufficient stock for ${item.drugName}. Available: ${drug.currentStock}, Required: ${item.quantityDispensed}`,
                    )
                }
                
                await tx.drugInventory.update({
                    where: { id: drug.id },
                    data: {
                        currentStock: drug.currentStock - item.quantityDispensed,
                        status: getStockStatus(drug.currentStock - item.quantityDispensed, drug.minStock),
                    },
                })
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Error processing prescription:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to process prescription" }
    }
}

export async function completePrescription(prescriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.prescription.update({
            where: { id: prescriptionId },
            data: {
                status: "completed",
                updatedAt: new Date(),
            },
        })

        return { success: true }
    } catch (error) {
        console.error("Error completing prescription:", error)
        return { success: false, error: "Failed to complete prescription" }
    }
}

export async function getPharmacyStatistics() {
    try {
        const [
            totalDrugs,
            lowStockItems,
            criticalStockItems,
            pendingPrescriptions,
            processingPrescriptions,
            completedPrescriptionsToday,
        ] = await Promise.all([
            prisma.drugInventory.count(),
            prisma.drugInventory.findMany({
                where: {
                    currentStock: {
                        lte: prisma.drugInventory.fields.minStock,
                    },
                },
            }),
            prisma.drugInventory.findMany({
                where: {
                    status: "critical",
                },
            }),
            prisma.prescription.count({
                where: { status: "Pending" },
            }),
            prisma.prescription.count({
                where: { status: "processing" },
            }),
            prisma.prescription.count({
                where: {
                    status: "completed",
                    updatedAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
        ])

        return {
            totalDrugs,
            lowStockCount: lowStockItems.length,
            criticalStockCount: criticalStockItems.length,
            pendingPrescriptions,
            processingPrescriptions,
            completedPrescriptionsToday,
            availableStock: totalDrugs - lowStockItems.length,
        }
    } catch (error) {
        console.error("Error fetching pharmacy statistics:", error)
        return {
            totalDrugs: 0,
            lowStockCount: 0,
            criticalStockCount: 0,
            pendingPrescriptions: 0,
            processingPrescriptions: 0,
            completedPrescriptionsToday: 0,
            availableStock: 0,
        }
    }
}

export async function getTopMedications() {
    try {
        const prescriptionItems = await prisma.prescriptionItem.findMany({
            include: {
                drug: {
                    select: {
                        drugName: true,
                    },
                },
            },
            take: 100,
        })

        const medicationCounts: Record<string, number> = {}

        prescriptionItems.forEach((item: any) => {
            const drugName = item.drug?.drugName || "Unknown Drug"
            if (drugName) {
                medicationCounts[drugName] = (medicationCounts[drugName] || 0) + 1
            }
        })

        const topMedications = Object.entries(medicationCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        return topMedications
    } catch (error) {
        console.error("Error fetching top medications:", error)
        return []
    }
}

export async function getPrescriptionTrends() {
    try {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - 6)
        startOfWeek.setHours(0, 0, 0, 0)

        const prescriptions = await prisma.prescription.findMany({
            where: {
                createdAt: {
                    gte: startOfWeek,
                },
            },
            select: {
                createdAt: true,
                status: true,
            },
        })

        const dailyTrends: Record<string, { date: string; pending: number; processing: number; completed: number }> = {}
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() - i)
            const dateStr = date.toISOString().split("T")[0]
            dailyTrends[dateStr] = {
                date: dateStr,
                pending: 0,
                processing: 0,
                completed: 0,
            }
        }
        
        prescriptions.forEach((prescription) => {
            const dateStr = prescription.createdAt.toISOString().split("T")[0]
            if (dailyTrends[dateStr]) {
                if (prescription.status === "Pending") dailyTrends[dateStr].pending++
                else if (prescription.status === "processing") dailyTrends[dateStr].processing++
                else if (prescription.status === "completed") dailyTrends[dateStr].completed++
            }
        })

        return Object.values(dailyTrends).sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
        console.error("Error fetching prescription trends:", error)
        return []
    }
}