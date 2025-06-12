"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export interface TokenQueueData {
    id: string
    tokenNumber: string
    patientId: string
    patientName: string
    departmentId: string
    departmentName: string
    status: "Waiting" | "Called" | "In Progress" | "Completed" | "Cancelled"
    priority: "Normal" | "Urgent" | "Emergency"
    estimatedWaitTime: number
    actualWaitTime?: number
    createdAt: Date
    updatedAt: Date
    calledAt?: Date
    completedAt?: Date
}

export interface TokenQueueStats {
    totalTokens: number
    waitingTokens: number
    inProgressTokens: number
    completedTokens: number
    averageWaitTime: number
    byDepartment: Record<string, number>
    byStatus: Record<string, number>
}

export interface TokenQueueResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function getTokenQueueByDepartmentAction(
    departmentId: string,
): Promise<TokenQueueResponse<TokenQueueData[]>> {
    try {
        const tokenQueue: TokenQueueData[] = [
            {
                id: "TQ001",
                tokenNumber: "C001",
                patientId: "P001",
                patientName: "John Smith",
                departmentId: "D001",
                departmentName: "Cardiology",
                status: "In Progress",
                priority: "Normal",
                estimatedWaitTime: 15,
                actualWaitTime: 12,
                createdAt: new Date("2024-01-20T09:00:00"),
                updatedAt: new Date("2024-01-20T09:12:00"),
                calledAt: new Date("2024-01-20T09:12:00"),
            },
            {
                id: "TQ002",
                tokenNumber: "C002",
                patientId: "P002",
                patientName: "Sarah Johnson",
                departmentId: "D001",
                departmentName: "Cardiology",
                status: "Waiting",
                priority: "Normal",
                estimatedWaitTime: 25,
                createdAt: new Date("2024-01-20T09:15:00"),
                updatedAt: new Date("2024-01-20T09:15:00"),
            },
            {
                id: "TQ003",
                tokenNumber: "C003",
                patientId: "P003",
                patientName: "Michael Brown",
                departmentId: "D001",
                departmentName: "Cardiology",
                status: "Waiting",
                priority: "Urgent",
                estimatedWaitTime: 10,
                createdAt: new Date("2024-01-20T09:20:00"),
                updatedAt: new Date("2024-01-20T09:20:00"),
            },
            {
                id: "TQ004",
                tokenNumber: "O001",
                patientId: "P004",
                patientName: "Emily Davis",
                departmentId: "D002",
                departmentName: "Orthopedics",
                status: "Waiting",
                priority: "Normal",
                estimatedWaitTime: 30,
                createdAt: new Date("2024-01-20T09:10:00"),
                updatedAt: new Date("2024-01-20T09:10:00"),
            },
            {
                id: "TQ005",
                tokenNumber: "E001",
                patientId: "P005",
                patientName: "Robert Wilson",
                departmentId: "D003",
                departmentName: "Emergency",
                status: "In Progress",
                priority: "Emergency",
                estimatedWaitTime: 0,
                actualWaitTime: 2,
                createdAt: new Date("2024-01-20T09:25:00"),
                updatedAt: new Date("2024-01-20T09:27:00"),
                calledAt: new Date("2024-01-20T09:27:00"),
            },
        ]

        const filteredTokens =
            departmentId === "all" ? tokenQueue : tokenQueue.filter((token) => token.departmentId === departmentId)

        return { success: true, data: filteredTokens }
    } catch (error) {
        console.error("Error fetching token queue:", error)
        return { success: false, error: "Failed to fetch token queue" }
    }
}

export async function getAllActiveTokensAction(): Promise<TokenQueueResponse<TokenQueueData[]>> {
    try {
        const result = await getTokenQueueByDepartmentAction("all")
        if (!result.success || !result.data) {
            return { success: false, error: "Failed to fetch tokens" }
        }

        const activeTokens = result.data.filter(
            (token) => token.status === "Waiting" || token.status === "Called" || token.status === "In Progress",
        )

        return { success: true, data: activeTokens }
    } catch (error) {
        console.error("Error fetching active tokens:", error)
        return { success: false, error: "Failed to fetch active tokens" }
    }
}

export async function createTokenAction(formData: FormData): Promise<TokenQueueResponse<TokenQueueData>> {
    try {
        const patientId = formData.get("patientId") as string
        const patientName = formData.get("patientName") as string
        const departmentId = formData.get("departmentId") as string
        const departmentName = formData.get("departmentName") as string
        const priority = formData.get("priority") as "Normal" | "Urgent" | "Emergency"
        
        const departmentPrefix = departmentName.charAt(0).toUpperCase()
        const tokenNumber = `${departmentPrefix}${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`
        
        let estimatedWaitTime = 30 
        if (priority === "Urgent") estimatedWaitTime = 15
        if (priority === "Emergency") estimatedWaitTime = 0

        const newToken: TokenQueueData = {
            id: `TQ${Date.now()}`,
            tokenNumber,
            patientId,
            patientName,
            departmentId,
            departmentName,
            status: "Waiting",
            priority,
            estimatedWaitTime,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        console.log("Created new token:", newToken)

        revalidatePath("/nurse")
        revalidatePath("/display")

        return { success: true, data: newToken }
    } catch (error) {
        console.error("Error creating token:", error)
        return { success: false, error: "Failed to create token" }
    }
}

export async function updateTokenStatusAction(
    tokenId: string,
    status: TokenQueueData["status"],
): Promise<TokenQueueResponse<boolean>> {
    try {
        const updateData: Partial<TokenQueueData> = {
            status,
            updatedAt: new Date(),
        }

        if (status === "Called") {
            updateData.calledAt = new Date()
        } else if (status === "Completed") {
            updateData.completedAt = new Date()
        }

        console.log(`Updating token ${tokenId} to status: ${status}`)

        revalidatePath("/nurse")
        revalidatePath("/display")

        return { success: true, data: true }
    } catch (error) {
        console.error("Error updating token status:", error)
        return { success: false, error: "Failed to update token status" }
    }
}

export async function getTokenQueueStatsAction(): Promise<TokenQueueResponse<TokenQueueStats>> {
    try {
        const result = await getTokenQueueByDepartmentAction("all")
        if (!result.success || !result.data) {
            return { success: false, error: "Failed to fetch tokens for stats" }
        }

        const tokens = result.data
        const totalTokens = tokens.length
        const waitingTokens = tokens.filter((t) => t.status === "Waiting").length
        const inProgressTokens = tokens.filter((t) => t.status === "In Progress").length
        const completedTokens = tokens.filter((t) => t.status === "Completed").length

        const completedWithWaitTime = tokens.filter((t) => t.status === "Completed" && t.actualWaitTime)
        const averageWaitTime =
            completedWithWaitTime.length > 0
                ? completedWithWaitTime.reduce((sum, t) => sum + (t.actualWaitTime || 0), 0) / completedWithWaitTime.length
                : 0

        const byDepartment = tokens.reduce(
            (acc, token) => {
                acc[token.departmentName] = (acc[token.departmentName] || 0) + 1
                return acc
            },
            {} as Record<string, number>,
        )

        const byStatus = tokens.reduce(
            (acc, token) => {
                acc[token.status] = (acc[token.status] || 0) + 1
                return acc
            },
            {} as Record<string, number>,
        )

        const stats: TokenQueueStats = {
            totalTokens,
            waitingTokens,
            inProgressTokens,
            completedTokens,
            averageWaitTime,
            byDepartment,
            byStatus,
        }

        return { success: true, data: stats }
    } catch (error) {
        console.error("Error calculating token queue stats:", error)
        return { success: false, error: "Failed to calculate token queue statistics" }
    }
}

export async function cancelTokenAction(tokenId: string): Promise<TokenQueueResponse<boolean>> {
    try {
        console.log(`Cancelling token ${tokenId}`)

        revalidatePath("/nurse")
        revalidatePath("/display")

        return { success: true, data: true }
    } catch (error) {
        console.error("Error cancelling token:", error)
        return { success: false, error: "Failed to cancel token" }
    }
}
