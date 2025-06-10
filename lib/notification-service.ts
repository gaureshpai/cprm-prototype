"use server"

import prisma from "@/lib/prisma"

export interface NotificationData {
    id: string
    title: string
    message: string
    type: "emergency" | "warning" | "appointment" | "prescription" | "info"
    priority: "low" | "medium" | "high"
    read: boolean
    createdAt: Date
    userId: string
    relatedId?: string
}

export async function getDoctorNotifications(doctorId: string): Promise<NotificationData[]> {
    try {
        const [systemAlerts, emergencyAlerts, prescriptions, appointments] = await Promise.all([
            prisma.systemAlert.findMany({
                where: { resolved: false },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            
            prisma.emergencyAlert.findMany({
                where: { status: "active" },
                orderBy: { createdAt: "desc" },
                take: 3,
            }),
            
            prisma.prescription.findMany({
                where: {
                    doctorId: doctorId,
                    status: "Pending",
                },
                include: { patient: true },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            
            prisma.appointment.findMany({
                where: {
                    doctorId: doctorId,
                    date: { gte: new Date() },
                    status: "Scheduled",
                },
                include: { patient: true },
                orderBy: { date: "asc" },
                take: 5,
            }),
        ])

        const notifications: NotificationData[] = []
        
        systemAlerts.forEach((alert) => {
            notifications.push({
                id: `sys-${alert.id}`,
                title: `System Alert: ${alert.type}`,
                message: alert.message,
                type: alert.severity === "high" ? "emergency" : alert.severity === "medium" ? "warning" : "info",
                priority: alert.severity as "low" | "medium" | "high",
                read: false,
                createdAt: alert.createdAt,
                userId: doctorId,
                relatedId: alert.id,
            })
        })
        
        emergencyAlerts.forEach((alert) => {
            notifications.push({
                id: `emerg-${alert.id}`,
                title: `Emergency: ${alert.codeType}`,
                message: `${alert.message} - Location: ${alert.location}`,
                type: "emergency",
                priority: alert.priority === 1 ? "high" : "medium",
                read: false,
                createdAt: alert.createdAt,
                userId: doctorId,
                relatedId: alert.id,
            })
        })
        
        prescriptions.forEach((prescription) => {
            notifications.push({
                id: `presc-${prescription.id}`,
                title: "Prescription Review Required",
                message: `Prescription for ${prescription.patient.name} requires your review`,
                type: "prescription",
                priority: "medium",
                read: false,
                createdAt: prescription.createdAt,
                userId: doctorId,
                relatedId: prescription.id,
            })
        })
        
        appointments.forEach((appointment) => {
            const isToday = new Date(appointment.date).toDateString() === new Date().toDateString()
            notifications.push({
                id: `appt-${appointment.id}`,
                title: isToday ? "Today's Appointment" : "Upcoming Appointment",
                message: `Appointment with ${appointment.patient.name} at ${appointment.time}`,
                type: "appointment",
                priority: isToday ? "high" : "low",
                read: false,
                createdAt: appointment.createdAt,
                userId: doctorId,
                relatedId: appointment.id,
            })
        })
        
        return notifications.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority]
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    } catch (error) {
        console.error("Error fetching doctor notifications:", error)
        return []
    }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    try {
        const [type, id] = notificationId.split("-")

        switch (type) {
            case "sys":
                await prisma.systemAlert.update({
                    where: { id },
                    data: { resolved: true },
                })
                break
            case "emerg":
                await prisma.emergencyAlert.update({
                    where: { id },
                    data: { status: "resolved", resolvedAt: new Date() },
                })
                break
        }
    } catch (error) {
        console.error("Error marking notification as read:", error)
    }
}

export async function createNotification(data: {
    userId: string
    title: string
    message: string
    type: NotificationData["type"]
    priority: NotificationData["priority"]
    relatedId?: string
}): Promise<NotificationData> {
    try {
        const alert = await prisma.systemAlert.create({
            data: {
                type: data.type,
                message: `${data.title}: ${data.message}`,
                severity: data.priority,
                resolved: false,
            },
        })

        return {
            id: `sys-${alert.id}`,
            title: data.title,
            message: data.message,
            type: data.type,
            priority: data.priority,
            read: false,
            createdAt: alert.createdAt,
            userId: data.userId,
            relatedId: data.relatedId,
        }
    } catch (error) {
        console.error("Error creating notification:", error)
        throw new Error("Failed to create notification")
    }
}

export async function deleteNotification(notificationId: string): Promise<void> {
    try {
        const [type, id] = notificationId.split("-")

        switch (type) {
            case "sys":
                await prisma.systemAlert.delete({ where: { id } })
                break
            case "emerg":
                await prisma.emergencyAlert.delete({ where: { id } })
                break
        }
    } catch (error) {
        console.error("Error deleting notification:", error)
        throw new Error("Failed to delete notification")
    }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
    try {
        const [systemCount, emergencyCount, prescriptionCount] = await Promise.all([
            prisma.systemAlert.count({ where: { resolved: false } }),
            prisma.emergencyAlert.count({ where: { status: "active" } }),
            prisma.prescription.count({
                where: {
                    doctorId: userId,
                    status: "Pending",
                },
            }),
        ])

        return systemCount + emergencyCount + prescriptionCount
    } catch (error) {
        console.error("Error getting unread notification count:", error)
        return 0
    }
}
