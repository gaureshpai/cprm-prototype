"use server"

import { revalidatePath } from "next/cache"
import { updatePatient, updatePatientVitals, administerMedication, completeTask } from "./nurse-service"
import prisma  from "@/lib/prisma"

export async function createEmergencyAlertAction(formData: FormData) {
    try {
        const codeType = formData.get("codeType") as string
        const location = formData.get("location") as string
        const message = formData.get("message") as string
        const priority = Number.parseInt(formData.get("priority") as string) || 3
        const broadcastTo = JSON.parse((formData.get("broadcastTo") as string) || '["ALL"]')

        if (!codeType || !location) {
            return { success: false, error: "Code type and location are required" }
        }

        const alert = await prisma.emergencyAlert.create({
            data: {
                codeType,
                location,
                message: message || `${codeType} at ${location}`,
                status: "active",
                priority,
                broadcastTo,
            },
        })
        
        await prisma.display.updateMany({
            where: { status: "online" },
            data: { lastUpdate: new Date() },
        })

        revalidatePath("/nurse")
        return { success: true, data: alert }
    } catch (error) {
        console.error("Error creating emergency alert:", error)
        return { success: false, error: "Failed to create emergency alert" }
    }
}

export async function updateEmergencyAlertAction(formData: FormData) {
    try {
        const id = formData.get("id") as string
        const codeType = formData.get("codeType") as string
        const location = formData.get("location") as string
        const message = formData.get("message") as string
        const priority = Number.parseInt(formData.get("priority") as string) || 3
        const status = formData.get("status") as string
        const broadcastTo = JSON.parse((formData.get("broadcastTo") as string) || '["ALL"]')

        if (!id || !codeType || !location) {
            return { success: false, error: "ID, code type and location are required" }
        }

        const updateData: any = {
            codeType,
            location,
            message: message || `${codeType} at ${location}`,
            priority,
            status,
            broadcastTo,
        }

        if (status === "resolved") {
            updateData.resolvedAt = new Date()
        }

        const alert = await prisma.emergencyAlert.update({
            where: { id },
            data: updateData,
        })

        revalidatePath("/nurse")
        return { success: true, data: alert }
    } catch (error) {
        console.error("Error updating emergency alert:", error)
        return { success: false, error: "Failed to update emergency alert" }
    }
}

export async function deleteEmergencyAlertAction(id: string) {
    try {
        if (!id) {
            return { success: false, error: "Alert ID is required" }
        }

        await prisma.emergencyAlert.delete({
            where: { id },
        })

        revalidatePath("/nurse")
        return { success: true }
    } catch (error) {
        console.error("Error deleting emergency alert:", error)
        return { success: false, error: "Failed to delete emergency alert" }
    }
}

export async function getEmergencyAlertsAction() {
    try {
        const alerts = await prisma.emergencyAlert.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
        })

        return {
            success: true,
            data: alerts.map((alert) => ({
                id: alert.id,
                codeType: alert.codeType,
                location: alert.location,
                message: alert.message,
                status: alert.status,
                priority: alert.priority,
                createdAt: alert.createdAt.toISOString(),
                resolvedAt: alert.resolvedAt?.toISOString() || null,
                broadcastTo: alert.broadcastTo,
            })),
        }
    } catch (error) {
        console.error("Error fetching emergency alerts:", error)
        return { success: false, error: "Failed to fetch emergency alerts" }
    }
}

export async function updatePatientAction(
    patientId: string,
    patientData: {
        name: string
        age: string
        gender: string
        condition: string
        notes: string
    },
) {
    try {
        const result = await updatePatient(patientId, {
            name: patientData.name,
            age: Number.parseInt(patientData.age),
            gender: patientData.gender,
            condition: patientData.condition,
            notes: patientData.notes,
        })

        revalidatePath("/nurse")
        return result
    } catch (error) {
        console.error("Error in updatePatientAction:", error)
        return { success: false, message: "Failed to update patient" }
    }
}

export async function updatePatientVitalsAction(
    patientId: string,
    vitalsData: {
        temp: string
        bp: string
        pulse: string
        spo2: string
        notes: string
    },
) {
    try {
        const result = await updatePatientVitals(patientId, vitalsData)
        revalidatePath("/nurse")
        return result
    } catch (error) {
        console.error("Error in updatePatientVitalsAction:", error)
        return { success: false, message: "Failed to update vitals" }
    }
}

export async function administerMedicationAction(patientId: string, medicationName: string, nurseId = "current-nurse") {
    try {
        const result = await administerMedication(patientId, medicationName, nurseId)
        revalidatePath("/nurse")
        return result
    } catch (error) {
        console.error("Error in administerMedicationAction:", error)
        return { success: false, message: "Failed to administer medication" }
    }
}

export async function completeTaskAction(taskId: string, nurseId = "current-nurse") {
    try {
        const result = await completeTask(taskId, nurseId)
        revalidatePath("/nurse")
        return result
    } catch (error) {
        console.error("Error in completeTaskAction:", error)
        return { success: false, message: "Failed to complete task" }
    }
}

export async function refreshDashboardAction() {
    try {
        revalidatePath("/nurse")
        return { success: true, message: "Dashboard refreshed successfully" }
    } catch (error) {
        console.error("Error in refreshDashboardAction:", error)
        return { success: false, message: "Failed to refresh dashboard" }
    }
}