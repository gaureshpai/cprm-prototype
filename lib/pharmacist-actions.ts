"use server"

import { revalidatePath } from "next/cache"
import {
    getDrugInventory,
    getPrescriptions,
    getPurchaseOrders,
    processPrescription,
    completePrescription,
    addDrugToInventory,
    updateDrugInventory,
    createReorder,
    getPharmacyStatistics,
    getTopMedications,
    getPrescriptionTrends,
} from "./pharmacist-service"

export async function getDrugInventoryAction() {
    return await getDrugInventory()
}

export async function getPrescriptionsAction() {
    return await getPrescriptions()
}

export async function getPurchaseOrdersAction() {
    return await getPurchaseOrders()
}

export async function processPrescriptionAction(
    prescriptionId: string,
    dispensedItems: Array<{
        itemId: string
        drugName: string
        quantityDispensed: number
    }>,
) {
    const result = await processPrescription(prescriptionId, dispensedItems)
    revalidatePath("/pharmacist")
    revalidatePath("/pharmacist/orders")
    revalidatePath("/pharmacist/inventory")
    return result
}

export async function completePrescriptionAction(prescriptionId: string) {
    const result = await completePrescription(prescriptionId)
    revalidatePath("/pharmacist")
    revalidatePath("/pharmacist/orders")
    return result
}

export async function addDrugToInventoryAction(drugData: {
    drugName: string
    currentStock: number
    minStock: number
    category: string
    location: string
    batchNumber?: string
    expiryDate?: Date
}) {
    const result = await addDrugToInventory(drugData)
    revalidatePath("/pharmacist/inventory")
    return result
}

export async function updateDrugInventoryAction(drugId: string, updates: any) {
    const result = await updateDrugInventory(drugId, updates)
    revalidatePath("/pharmacist/inventory")
    return result
}

export async function createReorderAction(drugId: string) {
    const result = await createReorder(drugId)
    revalidatePath("/pharmacist/inventory")
    return result
}

export async function getPharmacyStatisticsAction() {
    return await getPharmacyStatistics()
}

export async function getTopMedicationsAction() {
    return await getTopMedications()
}

export async function getPrescriptionTrendsAction() {
    return await getPrescriptionTrends()
}