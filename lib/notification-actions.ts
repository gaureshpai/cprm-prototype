"use server"

import { getDoctorNotifications, markNotificationAsRead, type NotificationData } from "./notification-service"

export interface ActionResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function getDoctorNotificationsAction(doctorId: string): Promise<ActionResponse<NotificationData[]>> {
    try {
        const notifications = await getDoctorNotifications(doctorId)
        return { success: true, data: notifications }
    } catch (error) {
        console.error("Error in getDoctorNotificationsAction:", error)
        return { success: false, error: "Failed to fetch notifications" }
    }
}

export async function markNotificationReadAction(notificationId: string): Promise<ActionResponse<any>> {
    try {
        await markNotificationAsRead(notificationId)
        return { success: true }
    } catch (error) {
        console.error("Error in markNotificationReadAction:", error)
        return { success: false, error: "Failed to mark notification as read" }
    }
}

export type { NotificationData }
