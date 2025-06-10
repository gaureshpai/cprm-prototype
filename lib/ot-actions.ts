"use server"

import { revalidatePath } from "next/cache"
import {
    getOTStatus,
    getOTStatistics,
    scheduleSurgery,
    updateTheaterStatus,
    addEmergencyCase,
    type OTData,
} from "./ot-service"

export interface ActionResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function getOTStatusAction(): Promise<ActionResponse<OTData>> {
    try {
        const otData = await getOTStatus()
        return { success: true, data: otData }
    } catch (error) {
        console.error("Error in getOTStatusAction:", error)
        return { success: false, error: "Failed to fetch OT status" }
    }
}

export async function getOTStatisticsAction(): Promise<ActionResponse<any>> {
    try {
        const stats = await getOTStatistics()
        return { success: true, data: stats }
    } catch (error) {
        console.error("Error in getOTStatisticsAction:", error)
        return { success: false, error: "Failed to fetch OT statistics" }
    }
}

export async function scheduleSurgeryAction(formData: FormData): Promise<ActionResponse<any>> {
    try {
        const surgeryData = {
            patientId: formData.get("patientId") as string,
            procedure: formData.get("procedure") as string,
            surgeonId: formData.get("surgeonId") as string,
            theaterId: formData.get("theaterId") as string,
            scheduledTime: new Date(formData.get("scheduledTime") as string),
            estimatedDuration: formData.get("estimatedDuration") as string,
            priority: (formData.get("priority") as string) || "normal",
        }

        if (!surgeryData.patientId || !surgeryData.procedure || !surgeryData.surgeonId || !surgeryData.theaterId) {
            return { success: false, error: "All required fields must be provided" }
        }

        const result = await scheduleSurgery(surgeryData)
        revalidatePath("/doctor/ot")
        return { success: true, data: result }
    } catch (error) {
        console.error("Error in scheduleSurgeryAction:", error)
        return { success: false, error: "Failed to schedule surgery" }
    }
}

export async function updateTheaterStatusAction(theaterId: string, status: string): Promise<ActionResponse<boolean>> {
    try {
        await updateTheaterStatus(theaterId, status)
        revalidatePath("/doctor/ot")
        return { success: true, data: true }
    } catch (error) {
        console.error("Error in updateTheaterStatusAction:", error)
        return { success: false, error: "Failed to update theater status" }
    }
}

export async function addEmergencyCaseAction(formData: FormData): Promise<ActionResponse<any>> {
    try {
        const emergencyData = {
            patientName: formData.get("patientName") as string,
            condition: formData.get("condition") as string,
            priority: formData.get("priority") as string,
            estimatedDuration: formData.get("estimatedDuration") as string,
        }

        if (!emergencyData.patientName || !emergencyData.condition || !emergencyData.priority) {
            return { success: false, error: "Patient name, condition, and priority are required" }
        }

        const result = await addEmergencyCase(emergencyData)
        revalidatePath("/doctor/ot")
        return { success: true, data: result }
    } catch (error) {
        console.error("Error in addEmergencyCaseAction:", error)
        return { success: false, error: "Failed to add emergency case" }
    }
}

export type { OTData } from "./ot-service"
