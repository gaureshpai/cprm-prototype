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
    CreatePatientData,
    createPatient,
    UpdatePatientData,
    updatePatient,
} from "./patient-service"
import prisma from "@/lib/prisma"

export interface ActionResponse<T> {
    success: boolean
    data?: T
    error?: string
}

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

export async function decactivatePatient(patientId: string) {
    try {
        const patient = await prisma.patient.update({
            where: { id: patientId },
            data: {
                status: "Inactive",
                updatedAt: new Date(),
            },
        })

        revalidatePath("/doctor/patients")
        return patient
    } catch (error) {
        console.error("Error deleting patient:", error)
        throw new Error("Failed to delete patient")
    }
}

export async function getAllPatients(page = 1, limit = 50, search?: string) {
    try {
        const skip = (page - 1) * limit

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { id: { contains: search, mode: "insensitive" as const } },
                    { phone: { contains: search } },
                    { condition: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {}

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                include: {
                    prescriptions: {
                        include: {
                            items: {
                                include: {
                                    drug: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 5,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            }),
            prisma.patient.count({ where }),
        ])

        return {
            patients: patients.map((patient:any) => ({
                id: patient.id,
                name: patient.name,
                age: patient.age,
                gender: patient.gender,
                phone: patient.phone,
                address: patient.address,
                condition: patient.condition,
                status: patient.status,
                allergies: patient.allergies || [],
                bloodType: patient.bloodType,
                emergencyContact: patient.emergencyContact,
                emergencyPhone: patient.emergencyPhone,
                vitals:
                    typeof patient.vitals === "object" && patient.vitals !== null
                        ? (patient.vitals as { bp?: string; pulse?: string; temp?: string; weight?: string; height?: string })
                        : { bp: "", pulse: "", temp: "", weight: "", height: "" },
                lastVisit: patient.lastVisit,
                nextAppointment: patient.nextAppointment,
                medications: patient.prescriptions.flatMap((prescription:any) =>
                    prescription.items.map((item:any) => ({
                        id: item.id,
                        name: item.drug.drugName,
                        dosage: item.dosage,
                        frequency: item.frequency,
                        duration: item.duration,
                        instructions: item.instructions || "",
                    })),
                ),
                medicalHistory: [],
                createdAt: patient.createdAt,
                updatedAt: patient.updatedAt,
            })),
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error("Error fetching patients:", error)
        throw new Error("Failed to fetch patients")
    }
}

export async function decactivatePatientAction(patientId: string): Promise<ActionResponse<any>> {
    try {
        if (!patientId) {
            return { success: false, error: "Patient ID is required" }
        }

        const patient = await decactivatePatient(patientId)
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