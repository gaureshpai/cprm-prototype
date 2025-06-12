"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { generateDisplayName } from "@/lib/helpers"

export interface TokenQueueData {
    id: string
    tokenNumber: string
    patientId: string
    patientName: string
    displayName: string | null
    departmentId: string
    departmentName: string
    status: "Waiting" | "Called" | "In Progress" | "Completed" | "Cancelled"
    priority: "Normal" | "Urgent" | "Emergency"
    estimatedWaitTime: number
    actualWaitTime: number | null
    createdAt: Date
    updatedAt: Date
    calledAt: Date | null
    completedAt: Date | null
}

export interface TokenQueueStats {
    totalTokens: number
    waitingTokens: number
    inProgressTokens: number
    completedTokens: number
    averageWaitTime: number
    byDepartment: Record<string, number>
    byPriority: Record<string, number>
}

export interface TokenQueueResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function getAllActiveTokensAction(): Promise<TokenQueueResponse<TokenQueueData[]>> {
    try {
        const tokens = await prisma.tokenQueue.findMany({
            where: {
                status: { in: ["Waiting", "Called", "In Progress"] },
            },
            include: {
                patient: true,
                department: true,
            },
            orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        })

        const tokenData: TokenQueueData[] = tokens.map((token) => ({
            id: token.id,
            tokenNumber: token.tokenNumber,
            patientId: token.patientId,
            patientName: token.patientName,
            displayName: token.displayName,
            departmentId: token.departmentId,
            departmentName: token.departmentName,
            status: token.status as TokenQueueData["status"],
            priority: token.priority as TokenQueueData["priority"],
            estimatedWaitTime: token.estimatedWaitTime,
            actualWaitTime: token.actualWaitTime,
            createdAt: token.createdAt,
            updatedAt: token.updatedAt,
            calledAt: token.calledAt,
            completedAt: token.completedAt,
        }))

        return { success: true, data: tokenData }
    } catch (error) {
        console.error("Error fetching active tokens:", error)
        return { success: false, error: "Failed to fetch active tokens" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function getTokenQueueByDepartmentAction(
    departmentId: string,
): Promise<TokenQueueResponse<TokenQueueData[]>> {
    try {
        const whereClause = departmentId === "all" ? {} : { departmentId }

        const tokens = await prisma.tokenQueue.findMany({
            where: {
                ...whereClause,
                status: { in: ["Waiting", "Called", "In Progress"] },
            },
            include: {
                patient: true,
                department: true,
            },
            orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        })

        const tokenData: TokenQueueData[] = tokens.map((token) => ({
            id: token.id,
            tokenNumber: token.tokenNumber,
            patientId: token.patientId,
            patientName: token.patientName,
            displayName: token.displayName,
            departmentId: token.departmentId,
            departmentName: token.departmentName,
            status: token.status as TokenQueueData["status"],
            priority: token.priority as TokenQueueData["priority"],
            estimatedWaitTime: token.estimatedWaitTime,
            actualWaitTime: token.actualWaitTime,
            createdAt: token.createdAt,
            updatedAt: token.updatedAt,
            calledAt: token.calledAt,
            completedAt: token.completedAt,
        }))

        return { success: true, data: tokenData }
    } catch (error) {
        console.error("Error fetching tokens by department:", error)
        return { success: false, error: "Failed to fetch tokens by department" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function createTokenAction(formData: FormData): Promise<TokenQueueResponse<TokenQueueData>> {
    try {
        const patientId = formData.get("patientId") as string
        const patientName = formData.get("patientName") as string
        const departmentId = formData.get("departmentId") as string
        const priority = (formData.get("priority") as string) || "Normal"

        if (!patientId || !patientName || !departmentId) {
            return { success: false, error: "Required fields are missing" }
        }
        
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
        })

        if (!department) {
            return { success: false, error: "Department not found" }
        }
        
        const today = new Date().toISOString().split("T")[0].replace(/-/g, "")
        const tokenCount = await prisma.tokenQueue.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        })
        const tokenNumber = `${department.name.substring(0, 3).toUpperCase()}${today}${String(tokenCount + 1).padStart(3, "0")}`
        
        const displayName = generateDisplayName(patientName, tokenNumber)
        
        const queueLength = await prisma.tokenQueue.count({
            where: {
                departmentId,
                status: { in: ["Waiting", "Called", "In Progress"] },
            },
        })
        const estimatedWaitTime = Math.max(15, queueLength * 15) 

        const token = await prisma.tokenQueue.create({
            data: {
                tokenNumber,
                patientId,
                patientName,
                displayName,
                departmentId,
                departmentName: department.name,
                priority,
                estimatedWaitTime,
            },
            include: {
                patient: true,
                department: true,
            },
        })

        const tokenData: TokenQueueData = {
            id: token.id,
            tokenNumber: token.tokenNumber,
            patientId: token.patientId,
            patientName: token.patientName,
            displayName: token.displayName,
            departmentId: token.departmentId,
            departmentName: token.departmentName,
            status: token.status as TokenQueueData["status"],
            priority: token.priority as TokenQueueData["priority"],
            estimatedWaitTime: token.estimatedWaitTime,
            actualWaitTime: token.actualWaitTime,
            createdAt: token.createdAt,
            updatedAt: token.updatedAt,
            calledAt: token.calledAt,
            completedAt: token.completedAt,
        }

        revalidatePath("/nurse/token-queue")
        revalidatePath("/display")

        return { success: true, data: tokenData }
    } catch (error) {
        console.error("Error creating token:", error)
        return { success: false, error: "Failed to create token" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function updateTokenStatusAction(
    tokenId: string,
    status: TokenQueueData["status"],
): Promise<TokenQueueResponse<TokenQueueData>> {
    try {
        const updateData: any = { status }

        if (status === "Called") {
            updateData.calledAt = new Date()
        } else if (status === "Completed" || status === "Cancelled") {
            updateData.completedAt = new Date()
            
            const token = await prisma.tokenQueue.findUnique({
                where: { id: tokenId },
            })

            if (token) {
                const actualWaitTime = Math.floor((new Date().getTime() - token.createdAt.getTime()) / (1000 * 60))
                updateData.actualWaitTime = actualWaitTime
            }
        }

        const token = await prisma.tokenQueue.update({
            where: { id: tokenId },
            data: updateData,
            include: {
                patient: true,
                department: true,
            },
        })

        const tokenData: TokenQueueData = {
            id: token.id,
            tokenNumber: token.tokenNumber,
            patientId: token.patientId,
            patientName: token.patientName,
            displayName: token.displayName,
            departmentId: token.departmentId,
            departmentName: token.departmentName,
            status: token.status as TokenQueueData["status"],
            priority: token.priority as TokenQueueData["priority"],
            estimatedWaitTime: token.estimatedWaitTime,
            actualWaitTime: token.actualWaitTime,
            createdAt: token.createdAt,
            updatedAt: token.updatedAt,
            calledAt: token.calledAt,
            completedAt: token.completedAt,
        }

        revalidatePath("/nurse/token-queue")
        revalidatePath("/display")

        return { success: true, data: tokenData }
    } catch (error) {
        console.error("Error updating token status:", error)
        return { success: false, error: "Failed to update token status" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function cancelTokenAction(tokenId: string): Promise<TokenQueueResponse<boolean>> {
    try {
        await updateTokenStatusAction(tokenId, "Cancelled")

        revalidatePath("/nurse/token-queue")
        revalidatePath("/display")

        return { success: true, data: true }
    } catch (error) {
        console.error("Error cancelling token:", error)
        return { success: false, error: "Failed to cancel token" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function getTokenQueueStatsAction(): Promise<TokenQueueResponse<TokenQueueStats>> {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tokens = await prisma.tokenQueue.findMany({
            where: {
                createdAt: {
                    gte: today,
                },
            },
        })

        const totalTokens = tokens.length
        const waitingTokens = tokens.filter((t) => t.status === "Waiting").length
        const inProgressTokens = tokens.filter((t) => t.status === "In Progress").length
        const completedTokens = tokens.filter((t) => t.status === "Completed").length

        const completedWithWaitTime = tokens.filter((t) => t.status === "Completed" && t.actualWaitTime !== null)
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

        const byPriority = tokens.reduce(
            (acc, token) => {
                acc[token.priority] = (acc[token.priority] || 0) + 1
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
            byPriority,
        }

        return { success: true, data: stats }
    } catch (error) {
        console.error("Error calculating token queue stats:", error)
        return { success: false, error: "Failed to calculate token queue statistics" }
    } finally {
        await prisma.$disconnect()
    }
}