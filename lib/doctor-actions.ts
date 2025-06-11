"use server"

import { revalidatePath } from "next/cache"
import {
    getDoctorAppointments,
    getDoctorPatients,
    searchPatients,
    getPatientDetails,
    createPrescription,
    getDoctorPrescriptions,
    updateAppointmentStatus,
    getDoctorStats,
    getAvailableDrugs,
    getAllDrugsForSelection,
    type PatientData,
    type AppointmentData,
    type PrescriptionData,
    type CreatePrescriptionData,
} from "./doctor-service"

export interface ActionResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function getDoctorAppointmentsAction(
    doctorUsername: string,
    date?: Date,
): Promise<ActionResponse<AppointmentData[]>> {
    try {
        const appointments = await getDoctorAppointments(doctorUsername, date)
        return { success: true, data: appointments }
    } catch (error) {
        console.error("Error in getDoctorAppointmentsAction:", error)
        return { success: false, error: "Failed to fetch appointments" }
    }
}

export async function getDoctorPatientsAction(
    doctorUsername: string,
    limit?: number,
): Promise<ActionResponse<PatientData[]>> {
    try {
        const patients = await getDoctorPatients(doctorUsername, limit)
        return { success: true, data: patients }
    } catch (error) {
        console.error("Error in getDoctorPatientsAction:", error)
        return { success: false, error: "Failed to fetch patients" }
    }
}

export async function searchPatientsAction(query: string, limit?: number): Promise<ActionResponse<PatientData[]>> {
    try {
        if (!query.trim()) {
            return { success: true, data: [] }
        }
        const patients = await searchPatients(query, limit)
        return { success: true, data: patients }
    } catch (error) {
        console.error("Error in searchPatientsAction:", error)
        return { success: false, error: "Failed to search patients" }
    }
}

export async function getPatientDetailsAction(patientId: string): Promise<ActionResponse<PatientData>> {
    try {
        const patient = await getPatientDetails(patientId)
        if (!patient) {
            return { success: false, error: "Patient not found" }
        }
        return { success: true, data: patient }
    } catch (error) {
        console.error("Error in getPatientDetailsAction:", error)
        return { success: false, error: "Failed to fetch patient details" }
    }
}

export async function createPrescriptionAction(formData: FormData): Promise<ActionResponse<PrescriptionData>> {
    try {
        const patientId = formData.get("patientId") as string
        const doctorUsername = formData.get("doctorId") as string 
        const diagnosis = formData.get("diagnosis") as string
        const notes = formData.get("notes") as string
        const followUpDate = formData.get("followUpDate") as string

        console.log(`Creating prescription for doctor: ${doctorUsername}, patient: ${patientId}`)
        
        const medications: CreatePrescriptionData["medications"] = []
        let index = 0
        while (formData.get(`medications[${index}][drugName]`)) {
            medications.push({
                drugName: formData.get(`medications[${index}][drugName]`) as string,
                dosage: formData.get(`medications[${index}][dosage]`) as string,
                frequency: formData.get(`medications[${index}][frequency]`) as string,
                duration: formData.get(`medications[${index}][duration]`) as string,
                instructions: (formData.get(`medications[${index}][instructions]`) as string) || undefined,
            })
            index++
        }

        if (!patientId || !doctorUsername) {
            return { success: false, error: "Patient and doctor are required" }
        }

        if (medications.length === 0) {
            return { success: false, error: "At least one medication is required" }
        }

        const prescriptionData: CreatePrescriptionData = {
            patientId,
            doctorUsername, 
            notes: notes || undefined,
            medications,
        }

        const prescription = await createPrescription(prescriptionData)
        revalidatePath("/doctor")
        return { success: true, data: prescription }
    } catch (error) {
        console.error("Error in createPrescriptionAction:", error)
        return {
            success: false,
            error: `Failed to create prescription: ${error instanceof Error ? error.message : "Unknown error"}`,
        }
    }
}

export async function getDoctorPrescriptionsAction(
    doctorUsername: string,
    limit?: number,
): Promise<ActionResponse<PrescriptionData[]>> {
    try {
        const prescriptions = await getDoctorPrescriptions(doctorUsername, limit)
        return { success: true, data: prescriptions }
    } catch (error) {
        console.error("Error in getDoctorPrescriptionsAction:", error)
        return { success: false, error: "Failed to fetch prescriptions" }
    }
}

export async function updateAppointmentStatusAction(
    appointmentId: string,
    status: string,
): Promise<ActionResponse<boolean>> {
    try {
        const success = await updateAppointmentStatus(appointmentId, status)
        revalidatePath("/doctor")
        return { success, data: success }
    } catch (error) {
        console.error("Error in updateAppointmentStatusAction:", error)
        return { success: false, error: "Failed to update appointment status" }
    }
}

export async function getDoctorStatsAction(doctorUsername: string): Promise<ActionResponse<any>> {
    try {
        const stats = await getDoctorStats(doctorUsername)
        return { success: true, data: stats }
    } catch (error) {
        console.error("Error in getDoctorStatsAction:", error)
        return { success: false, error: "Failed to fetch doctor statistics" }
    }
}

export async function getAvailableDrugsAction(
    query?: string,
): Promise<ActionResponse<{ id: string; drugName: string }[]>> {
    try {
        const drugs = await getAvailableDrugs(query)
        return { success: true, data: drugs }
    } catch (error) {
        console.error("Error in getAvailableDrugsAction:", error)
        return { success: false, error: "Failed to fetch available drugs" }
    }
}

export async function getAllDrugsForSelectionAction(query?: string) {
    try {
        const drugs = await getAllDrugsForSelection(query)
        return { success: true, data: drugs }
    } catch (error) {
        console.error("Error in getAllDrugsForSelectionAction:", error)
        return { success: false, error: "Failed to fetch drugs for selection" }
    }
}

export type { PatientData, AppointmentData, PrescriptionData, CreatePrescriptionData }