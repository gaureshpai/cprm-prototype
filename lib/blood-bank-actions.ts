"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface BloodBankData {
    id: string
    bloodType: string
    unitsAvailable: number
    criticalLevel: number
    status: string
    expiryDate: Date
    donorId?: string
    collectionDate: Date
    location: string
    batchNumber: string
    createdAt: Date
    updatedAt: Date
}

export interface BloodBankStats {
    totalUnits: number
    criticalTypes: number
    expiringUnits: number
    recentDonations: number
    byBloodType: Record<string, number>
    byStatus: Record<string, number>
}

export interface BloodBankResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function getAllBloodBankAction(): Promise<BloodBankResponse<BloodBankData[]>> {
    try {
        const bloodBankData: BloodBankData[] = [
            {
                id: "BB001",
                bloodType: "A+",
                unitsAvailable: 25,
                criticalLevel: 10,
                status: "Available",
                expiryDate: new Date("2024-02-15"),
                donorId: "D001",
                collectionDate: new Date("2024-01-15"),
                location: "Blood Bank - Refrigerator A1",
                batchNumber: "BB2024001",
                createdAt: new Date("2024-01-15"),
                updatedAt: new Date("2024-01-20"),
            },
            {
                id: "BB002",
                bloodType: "A-",
                unitsAvailable: 5,
                criticalLevel: 5,
                status: "Critical",
                expiryDate: new Date("2024-02-10"),
                donorId: "D002",
                collectionDate: new Date("2024-01-10"),
                location: "Blood Bank - Refrigerator A2",
                batchNumber: "BB2024002",
                createdAt: new Date("2024-01-10"),
                updatedAt: new Date("2024-01-18"),
            },
            {
                id: "BB003",
                bloodType: "B+",
                unitsAvailable: 18,
                criticalLevel: 10,
                status: "Available",
                expiryDate: new Date("2024-02-20"),
                donorId: "D003",
                collectionDate: new Date("2024-01-20"),
                location: "Blood Bank - Refrigerator B1",
                batchNumber: "BB2024003",
                createdAt: new Date("2024-01-20"),
                updatedAt: new Date("2024-01-22"),
            },
            {
                id: "BB004",
                bloodType: "B-",
                unitsAvailable: 2,
                criticalLevel: 5,
                status: "Critical",
                expiryDate: new Date("2024-02-08"),
                donorId: "D004",
                collectionDate: new Date("2024-01-08"),
                location: "Blood Bank - Refrigerator B2",
                batchNumber: "BB2024004",
                createdAt: new Date("2024-01-08"),
                updatedAt: new Date("2024-01-16"),
            },
            {
                id: "BB005",
                bloodType: "AB+",
                unitsAvailable: 10,
                criticalLevel: 5,
                status: "Available",
                expiryDate: new Date("2024-02-25"),
                donorId: "D005",
                collectionDate: new Date("2024-01-25"),
                location: "Blood Bank - Refrigerator AB1",
                batchNumber: "BB2024005",
                createdAt: new Date("2024-01-25"),
                updatedAt: new Date("2024-01-26"),
            },
            {
                id: "BB006",
                bloodType: "AB-",
                unitsAvailable: 1,
                criticalLevel: 3,
                status: "Critical",
                expiryDate: new Date("2024-02-05"),
                donorId: "D006",
                collectionDate: new Date("2024-01-05"),
                location: "Blood Bank - Refrigerator AB2",
                batchNumber: "BB2024006",
                createdAt: new Date("2024-01-05"),
                updatedAt: new Date("2024-01-14"),
            },
            {
                id: "BB007",
                bloodType: "O+",
                unitsAvailable: 30,
                criticalLevel: 15,
                status: "Available",
                expiryDate: new Date("2024-03-01"),
                donorId: "D007",
                collectionDate: new Date("2024-02-01"),
                location: "Blood Bank - Refrigerator O1",
                batchNumber: "BB2024007",
                createdAt: new Date("2024-02-01"),
                updatedAt: new Date("2024-02-02"),
            },
            {
                id: "BB008",
                bloodType: "O-",
                unitsAvailable: 4,
                criticalLevel: 8,
                status: "Critical",
                expiryDate: new Date("2024-02-12"),
                donorId: "D008",
                collectionDate: new Date("2024-01-12"),
                location: "Blood Bank - Refrigerator O2",
                batchNumber: "BB2024008",
                createdAt: new Date("2024-01-12"),
                updatedAt: new Date("2024-01-19"),
            },
        ]

        return { success: true, data: bloodBankData }
    } catch (error) {
        console.error("Error fetching blood bank data:", error)
        return { success: false, error: "Failed to fetch blood bank data" }
    }
}

export async function getBloodBankStatsAction(): Promise<BloodBankResponse<BloodBankStats>> {
    try {
        const bloodBankResult = await getAllBloodBankAction()
        if (!bloodBankResult.success || !bloodBankResult.data) {
            return { success: false, error: "Failed to fetch blood bank data for stats" }
        }

        const bloodBank = bloodBankResult.data
        const totalUnits = bloodBank.reduce((sum, item) => sum + item.unitsAvailable, 0)
        const criticalTypes = bloodBank.filter((item) => item.unitsAvailable <= item.criticalLevel).length

        const expiringUnits = bloodBank
            .filter((item) => {
                const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                return daysUntilExpiry <= 7
            })
            .reduce((sum, item) => sum + item.unitsAvailable, 0)

        const recentDonations = bloodBank.filter((item) => {
            const daysSinceCollection = Math.ceil(
                (new Date().getTime() - item.collectionDate.getTime()) / (1000 * 60 * 60 * 24),
            )
            return daysSinceCollection <= 7
        }).length

        const byBloodType = bloodBank.reduce(
            (acc, item) => {
                acc[item.bloodType] = (acc[item.bloodType] || 0) + item.unitsAvailable
                return acc
            },
            {} as Record<string, number>,
        )

        const byStatus = bloodBank.reduce(
            (acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1
                return acc
            },
            {} as Record<string, number>,
        )

        const stats: BloodBankStats = {
            totalUnits,
            criticalTypes,
            expiringUnits,
            recentDonations,
            byBloodType,
            byStatus,
        }

        return { success: true, data: stats }
    } catch (error) {
        console.error("Error calculating blood bank stats:", error)
        return { success: false, error: "Failed to calculate blood bank statistics" }
    }
}

export async function updateBloodBankAction(id: string, formData: FormData): Promise<BloodBankResponse<BloodBankData>> {
    try {
        const unitsAvailable = Number.parseInt(formData.get("unitsAvailable") as string)
        const criticalLevel = Number.parseInt(formData.get("criticalLevel") as string)
        const status = formData.get("status") as string
        const location = formData.get("location") as string
        
        console.log(`Updating blood bank ${id}:`, { unitsAvailable, criticalLevel, status, location })

        revalidatePath("/technician/blood-bank")
        revalidatePath("/admin")

        return {
            success: true,
            data: {
                id,
                bloodType: "A+", 
                unitsAvailable,
                criticalLevel,
                status,
                expiryDate: new Date(),
                collectionDate: new Date(),
                location,
                batchNumber: "BB2024001",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        }
    } catch (error) {
        console.error("Error updating blood bank:", error)
        return { success: false, error: "Failed to update blood bank inventory" }
    }
}

export async function requestBloodUnitsAction(formData: FormData): Promise<BloodBankResponse<boolean>> {
    try {
        const bloodType = formData.get("bloodType") as string
        const unitsRequested = Number.parseInt(formData.get("unitsRequested") as string)
        const patientId = formData.get("patientId") as string
        const urgency = formData.get("urgency") as string
        const requestedBy = formData.get("requestedBy") as string
        
        console.log("Blood request:", { bloodType, unitsRequested, patientId, urgency, requestedBy })

        revalidatePath("/doctor")
        revalidatePath("/technician/blood-bank")

        return { success: true, data: true }
    } catch (error) {
        console.error("Error requesting blood units:", error)
        return { success: false, error: "Failed to request blood units" }
    }
}
