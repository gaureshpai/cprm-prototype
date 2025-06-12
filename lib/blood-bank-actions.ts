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
        const bloodBankData = await prisma.bloodBank.findMany({
            orderBy: { bloodType: "asc" },
        })

        const formattedData: BloodBankData[] = bloodBankData.map((item) => ({
            id: item.id,
            bloodType: item.bloodType,
            unitsAvailable: item.unitsAvailable,
            criticalLevel: item.criticalLevel,
            status: item.status,
            expiryDate: item.expiryDate,
            donorId: item.donorId || undefined,
            collectionDate: item.collectionDate,
            location: item.location,
            batchNumber: item.batchNumber,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }))

        return { success: true, data: formattedData }
    } catch (error) {
        console.error("Error fetching blood bank data:", error)
        return { success: false, error: "Failed to fetch blood bank data" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function getBloodBankStatsAction(): Promise<BloodBankResponse<BloodBankStats>> {
    try {
        const bloodBank = await prisma.bloodBank.findMany()

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
    } finally {
        await prisma.$disconnect()
    }
}

export async function updateBloodBankAction(id: string, formData: FormData): Promise<BloodBankResponse<BloodBankData>> {
    try {
        const unitsAvailable = Number.parseInt(formData.get("unitsAvailable") as string)
        const criticalLevel = Number.parseInt(formData.get("criticalLevel") as string)
        const status = formData.get("status") as string
        const location = formData.get("location") as string
        const expiryDate = formData.get("expiryDate") as string

        const bloodBank = await prisma.bloodBank.update({
            where: { id },
            data: {
                unitsAvailable,
                criticalLevel,
                status,
                location,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            },
        })

        const bloodBankData: BloodBankData = {
            id: bloodBank.id,
            bloodType: bloodBank.bloodType,
            unitsAvailable: bloodBank.unitsAvailable,
            criticalLevel: bloodBank.criticalLevel,
            status: bloodBank.status,
            expiryDate: bloodBank.expiryDate,
            donorId: bloodBank.donorId || undefined,
            collectionDate: bloodBank.collectionDate,
            location: bloodBank.location,
            batchNumber: bloodBank.batchNumber,
            createdAt: bloodBank.createdAt,
            updatedAt: bloodBank.updatedAt,
        }

        revalidatePath("/technician/blood-bank")
        revalidatePath("/display")

        return { success: true, data: bloodBankData }
    } catch (error) {
        console.error("Error updating blood bank:", error)
        return { success: false, error: "Failed to update blood bank inventory" }
    } finally {
        await prisma.$disconnect()
    }
}