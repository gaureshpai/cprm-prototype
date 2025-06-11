"use server"

import { revalidatePath } from "next/cache"
import {
    getPatientById,
    searchPatientById,
    getPatientAppointments,
    getPatientMedications,
    getPatientStats,
    updatePatientVitals,
    type PatientDetailsData,
} from "./patient-service"

export type { PatientDetailsData }

export async function getPatientByIdAction(patientId: string) {
    try {
        const patient = await getPatientById(patientId)

        if (!patient) {
            return {
                success: false,
                error: "Patient not found",
                data: null,
            }
        }

        return {
            success: true,
            data: patient,
            error: null,
        }
    } catch (error) {
        console.error("Error in getPatientByIdAction:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch patient",
            data: null,
        }
    }
}

export async function searchPatientByIdAction(patientId: string) {
    try {
        if (!patientId || patientId.trim().length === 0) {
            return {
                success: false,
                error: "Patient ID is required",
                data: null,
            }
        }

        const patient = await searchPatientById(patientId.trim())

        if (!patient) {
            return {
                success: false,
                error: "No patient found with the provided ID",
                data: null,
            }
        }

        return {
            success: true,
            data: patient,
            error: null,
        }
    } catch (error) {
        console.error("Error in searchPatientByIdAction:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to search patient",
            data: null,
        }
    }
}

export async function getPatientAppointmentsAction(patientId: string, limit = 20) {
    try {
        const appointments = await getPatientAppointments(patientId, limit)

        return {
            success: true,
            data: appointments,
            error: null,
        }
    } catch (error) {
        console.error("Error in getPatientAppointmentsAction:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch appointments",
            data: [],
        }
    }
}

export async function getPatientMedicationsAction(patientId: string, limit = 20) {
    try {
        const medications = await getPatientMedications(patientId, limit)

        return {
            success: true,
            data: medications,
            error: null,
        }
    } catch (error) {
        console.error("Error in getPatientMedicationsAction:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch medications",
            data: [],
        }
    }
}

export async function getPatientStatsAction(patientId: string) {
    try {
        const stats = await getPatientStats(patientId)

        return {
            success: true,
            data: stats,
            error: null,
        }
    } catch (error) {
        console.error("Error in getPatientStatsAction:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch patient statistics",
            data: null,
        }
    }
}

export async function updatePatientVitalsAction(formData: FormData) {
    try {
        const patientId = formData.get("patientId") as string
        const bp = formData.get("bp") as string
        const pulse = formData.get("pulse") as string
        const temp = formData.get("temp") as string
        const weight = formData.get("weight") as string
        const height = formData.get("height") as string

        if (!patientId) {
            return {
                success: false,
                error: "Patient ID is required",
                data: null,
            }
        }

        const vitals = {
            bp: bp || undefined,
            pulse: pulse || undefined,
            temp: temp || undefined,
            weight: weight || undefined,
            height: height || undefined,
        }

        const updatedPatient = await updatePatientVitals(patientId, vitals)

        revalidatePath("/")

        return {
            success: true,
            data: updatedPatient,
            error: null,
        }
    } catch (error) {
        console.error("Error in updatePatientVitalsAction:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update patient vitals",
            data: null,
        }
    }
}