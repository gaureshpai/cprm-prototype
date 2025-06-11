"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export interface ContentItem {
    id: string
    title: string
    type: string
    content: string
    activeScreens: number
    createdAt: string
    updatedAt: string
}

export interface Announcement {
    id: string
    text: string
    createdAt: string
    createdBy: string
    active: boolean
}

export interface EmergencyAlert {
    id: string
    codeType: string
    location: string
    message: string
    createdAt: string
    active: boolean
    priority: number
}

export interface ContentResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function getAllContentAction(): Promise<ContentResponse<ContentItem[]>> {
    try {
        const displays = await prisma.display.findMany({
            select: {
                content: true,
            },
        })
        
        const contentCounts = displays.reduce(
            (acc, display) => {
                if (!display.content) return acc
                acc[display.content] = (acc[display.content] || 0) + 1
                return acc
            },
            {} as Record<string, number>,
        )
        
        const contentItems: ContentItem[] = Object.entries(contentCounts).map(([content, count], index) => ({
            id: `content-${index + 1}`,
            title: content,
            type: getContentType(content),
            content: `Content for ${content}`,
            activeScreens: count,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }))

        await prisma.$disconnect()
        return { success: true, data: contentItems }
    } catch (error) {
        console.error("Error fetching content:", error)
        await prisma.$disconnect()
        return { success: false, error: "Failed to fetch content" }
    }
}

export async function getAllAnnouncementsAction(): Promise<ContentResponse<Announcement[]>> {
    try {
        const systemAlerts = await prisma.systemAlert.findMany({
            where: {
                type: "ANNOUNCEMENT",
                resolved: false, 
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        })

        const announcements: Announcement[] = systemAlerts.map((alert) => ({
            id: alert.id,
            text: alert.message,
            createdAt: alert.createdAt.toISOString(),
            createdBy: "admin",
            active: !alert.resolved,
        }))

        await prisma.$disconnect()
        return { success: true, data: announcements }
    } catch (error) {
        console.error("Error fetching announcements:", error)
        await prisma.$disconnect()
        return { success: false, error: "Failed to fetch announcements" }
    }
}

export async function createAnnouncementAction(formData: FormData): Promise<ContentResponse<Announcement>> {
    try {
        const text = formData.get("text") as string
        const createdBy = formData.get("createdBy") as string

        if (!text) {
            return { success: false, error: "Announcement text is required" }
        }
        
        const alert = await prisma.systemAlert.create({
            data: {
                type: "ANNOUNCEMENT",
                message: text,
                severity: "info",
                resolved: false,
            },
        })

        await prisma.$disconnect()
        revalidatePath("/admin")

        return {
            success: true,
            data: {
                id: alert.id,
                text: alert.message,
                createdAt: alert.createdAt.toISOString(),
                createdBy: createdBy || "admin",
                active: !alert.resolved,
            },
        }
    } catch (error) {
        console.error("Error creating announcement:", error)
        await prisma.$disconnect()
        return { success: false, error: "Failed to create announcement" }
    }
}

export async function deleteAnnouncementAction(id: string): Promise<ContentResponse<boolean>> {
    try {
        await prisma.systemAlert.update({
            where: { id },
            data: { resolved: true },
        })

        await prisma.$disconnect()
        revalidatePath("/admin")
        return { success: true, data: true }
    } catch (error) {
        console.error("Error deleting announcement:", error)
        await prisma.$disconnect()
        return { success: false, error: "Failed to delete announcement" }
    }
}

export async function createEmergencyAlertAction(formData: FormData): Promise<ContentResponse<EmergencyAlert>> {
    try {
        const codeType = formData.get("type") as string
        const location = formData.get("location") as string
        const description = formData.get("description") as string

        if (!codeType || !location) {
            return { success: false, error: "Alert type and location are required" }
        }
        
        const alert = await prisma.emergencyAlert.create({
            data: {
                codeType,
                location,
                message: description || `${codeType} at ${location}`,
                status: "active",
                priority: getPriorityForCodeType(codeType),
                broadcastTo: ["ALL"],
            },
        })
        
        await prisma.display.updateMany({
            where: { status: "online" },
            data: {
                lastUpdate: new Date(),
            },
        })

        await prisma.$disconnect()
        revalidatePath("/admin")

        return {
            success: true,
            data: {
                id: alert.id,
                codeType: alert.codeType,
                location: alert.location,
                message: alert.message,
                createdAt: alert.createdAt.toISOString(),
                active: alert.status === "active",
                priority: alert.priority,
            },
        }
    } catch (error) {
        console.error("Error creating emergency alert:", error)
        await prisma.$disconnect()
        return { success: false, error: "Failed to create emergency alert" }
    }
}

export async function getRecentEmergencyAlertsAction(): Promise<ContentResponse<EmergencyAlert[]>> {
    try {
        const alerts = await prisma.emergencyAlert.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
        })

        const formattedAlerts: EmergencyAlert[] = alerts.map((alert) => ({
            id: alert.id,
            codeType: alert.codeType,
            location: alert.location,
            message: alert.message,
            createdAt: alert.createdAt.toISOString(),
            active: alert.status === "active",
            priority: alert.priority,
        }))

        await prisma.$disconnect()
        return { success: true, data: formattedAlerts }
    } catch (error) {
        console.error("Error fetching emergency alerts:", error)
        await prisma.$disconnect()
        return { success: false, error: "Failed to fetch emergency alerts" }
    }
}

export async function resolveEmergencyAlertAction(alertId: string): Promise<ContentResponse<boolean>> {
    try {
        await prisma.emergencyAlert.update({
            where: { id: alertId },
            data: {
                status: "resolved",
                resolvedAt: new Date(),
            },
        })

        await prisma.$disconnect()
        revalidatePath("/admin")

        return { success: true, data: true }
    } catch (error) {
        console.error("Error resolving emergency alert:", error)
        await prisma.$disconnect()
        return { success: false, error: "Failed to resolve emergency alert" }
    }
}

export async function getSystemAnalyticsAction() {
    try {
        const displays = await prisma.display.findMany()
        const totalDisplays = displays.length
        const onlineDisplays = displays.filter((d) => d.status === "online").length
        const offlineDisplays = displays.filter((d) => d.status === "offline").length
        const warningDisplays = displays.filter((d) => d.status === "warning").length
        
        const uptimePercentage = totalDisplays > 0 ? Math.round((onlineDisplays / totalDisplays) * 100) : 0
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const dailyPatients = await prisma.appointment.count({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        })

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const previousDayPatients = await prisma.appointment.count({
            where: {
                date: {
                    gte: yesterday,
                    lt: today,
                },
            },
        })

        const patientChange = dailyPatients - previousDayPatients
        
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const weeklyEmergencyAlerts = await prisma.emergencyAlert.count({
            where: {
                createdAt: {
                    gte: weekAgo,
                },
            },
        })
        
        const activeSystemAlerts = await prisma.systemAlert.count({
            where: {
                resolved: false,
            },
        })
        
        const networkConnectivity = Math.round((onlineDisplays / Math.max(totalDisplays, 1)) * 100)
        const contentSyncRate = Math.max(95, networkConnectivity - 2)
        const responseTime = onlineDisplays > 50 ? 1.5 : 1.2
        const errorRate = Math.max(0.1, ((offlineDisplays + warningDisplays) / Math.max(totalDisplays, 1)) * 100)

        await prisma.$disconnect()

        return {
            success: true,
            data: {
                displays: {
                    total: totalDisplays,
                    online: onlineDisplays,
                    offline: offlineDisplays,
                    warning: warningDisplays,
                    uptimePercentage,
                },
                patients: {
                    daily: dailyPatients,
                    change: patientChange,
                },
                alerts: {
                    weekly: weeklyEmergencyAlerts,
                    active: activeSystemAlerts,
                },
                performance: {
                    networkConnectivity,
                    contentSyncRate,
                    responseTime,
                    errorRate,
                },
            },
        }
    } catch (error) {
        console.error("Error fetching system analytics:", error)
        await prisma.$disconnect()
        return { success: false, error: "Failed to fetch system analytics" }
    }
}

function getPriorityForCodeType(codeType: string): number {
    switch (codeType) {
        case "Code Blue":
            return 5
        case "Code Red":
            return 5
        case "Code Black":
            return 4
        case "Code Silver":
            return 4
        case "Code Orange":
            return 3
        default:
            return 2
    }
}

function getContentType(content: string): string {
    if (content.includes("Queue")) return "Queue Display"
    if (content.includes("Emergency")) return "Emergency Information"
    if (content.includes("Department")) return "Department Information"
    if (content.includes("Drug") || content.includes("Inventory")) return "Inventory"
    if (content.includes("Mixed")) return "Dashboard"
    return "Information"
}