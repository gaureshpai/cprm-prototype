"use server"
import {
    createPatient,
    updatePatient,
    deletePatient,
    getAllPatients,
    createAppointment,
    type CreatePatientData,
    type UpdatePatientData,
} from "./patient-service"

export interface ActionResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function createPatientAction(formData: FormData): Promise<ActionResponse<any>> {
    try {
        const allergiesString = formData.get("allergies") as string
        const allergies = allergiesString
            ? allergiesString
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : []

        const patientData: CreatePatientData = {
            name: formData.get("name") as string,
            age: Number.parseInt(formData.get("age") as string),
            gender: formData.get("gender") as string,
            phone: (formData.get("phone") as string) || undefined,
            address: (formData.get("address") as string) || undefined,
            condition: (formData.get("condition") as string) || undefined,
            bloodType: (formData.get("bloodType") as string) || undefined,
            allergies,
            emergencyContact: (formData.get("emergencyContact") as string) || undefined,
            emergencyPhone: (formData.get("emergencyPhone") as string) || undefined,
            vitals: {
                bp: (formData.get("bp") as string) || "",
                pulse: (formData.get("pulse") as string) || "",
                temp: (formData.get("temp") as string) || "",
                weight: (formData.get("weight") as string) || "",
                height: (formData.get("height") as string) || "",
            },
        }

        if (!patientData.name || !patientData.age || !patientData.gender) {
            return { success: false, error: "Name, age, and gender are required" }
        }

        const patient = await createPatient(patientData)
        return { success: true, data: patient }
    } catch (error) {
        console.error("Error in createPatientAction:", error)
        return { success: false, error: "Failed to create patient" }
    }
}

export async function updatePatientAction(formData: FormData): Promise<ActionResponse<any>> {
    try {
        const id = formData.get("id") as string
        const allergiesString = formData.get("allergies") as string
        const allergies = allergiesString
            ? allergiesString
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : []

        const patientData: UpdatePatientData = {
            id,
            name: formData.get("name") as string,
            age: Number.parseInt(formData.get("age") as string),
            gender: formData.get("gender") as string,
            phone: (formData.get("phone") as string) || undefined,
            address: (formData.get("address") as string) || undefined,
            condition: (formData.get("condition") as string) || undefined,
            bloodType: (formData.get("bloodType") as string) || undefined,
            allergies,
            emergencyContact: (formData.get("emergencyContact") as string) || undefined,
            emergencyPhone: (formData.get("emergencyPhone") as string) || undefined,
            status: (formData.get("status") as string) || undefined,
            vitals: {
                bp: (formData.get("bp") as string) || "",
                pulse: (formData.get("pulse") as string) || "",
                temp: (formData.get("temp") as string) || "",
                weight: (formData.get("weight") as string) || "",
                height: (formData.get("height") as string) || "",
            },
        }

        if (!id) {
            return { success: false, error: "Patient ID is required" }
        }

        const patient = await updatePatient(patientData)
        return { success: true, data: patient }
    } catch (error) {
        console.error("Error in updatePatientAction:", error)
        return { success: false, error: "Failed to update patient" }
    }
}

export async function deletePatientAction(patientId: string): Promise<ActionResponse<any>> {
    try {
        if (!patientId) {
            return { success: false, error: "Patient ID is required" }
        }

        const patient = await deletePatient(patientId)
        return { success: true, data: patient }
    } catch (error) {
        console.error("Error in deletePatientAction:", error)
        return { success: false, error: "Failed to delete patient" }
    }
}

export async function getAllPatientsAction(page = 1, limit = 50, search?: string): Promise<ActionResponse<any>> {
    try {
        const result = await getAllPatients(page, limit, search)
        return { success: true, data: result }
    } catch (error) {
        console.error("Error in getAllPatientsAction:", error)
        return { success: false, error: "Failed to fetch patients" }
    }
}

export async function createAppointmentAction(formData: FormData): Promise<ActionResponse<any>> {
    try {
        const appointmentData = {
            patientId: formData.get("patientId") as string,
            doctorId: formData.get("doctorId") as string,
            date: new Date(formData.get("date") as string),
            time: formData.get("time") as string,
            type: formData.get("type") as string,
            notes: (formData.get("notes") as string) || undefined,
        }

        if (!appointmentData.patientId || !appointmentData.doctorId || !appointmentData.date || !appointmentData.time) {
            return { success: false, error: "Patient, doctor, date, and time are required" }
        }

        const appointment = await createAppointment(appointmentData)
        return { success: true, data: appointment }
    } catch (error) {
        console.error("Error in createAppointmentAction:", error)
        return { success: false, error: "Failed to create appointment" }
    }
}

export type { CreatePatientData, UpdatePatientData }
