"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export interface CreatePatientData {
    name: string
    age: number
    gender: string
    phone?: string
    address?: string
    condition?: string
    bloodType?: string
    allergies?: string[]
    emergencyContact?: string
    emergencyPhone?: string
    vitals?: {
        bp?: string
        pulse?: string
        temp?: string
        weight?: string
        height?: string
    }
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
    id: string
    status?: string
}

export async function createPatient(data: CreatePatientData) {
    try {
        const patient = await prisma.patient.create({
            data: {
                name: data.name,
                age: data.age,
                gender: data.gender,
                phone: data.phone,
                address: data.address,
                condition: data.condition,
                bloodType: data.bloodType,
                allergies: data.allergies || [],
                emergencyContact: data.emergencyContact,
                emergencyPhone: data.emergencyPhone,
                vitals: data.vitals || {},
                status: "Active",
                lastVisit: new Date(),
            },
        })

        revalidatePath("/doctor/patients")
        return patient
    } catch (error) {
        console.error("Error creating patient:", error)
        throw new Error("Failed to create patient")
    }
}

export async function updatePatient(data: UpdatePatientData) {
    try {
        const { id, ...updateData } = data

        const patient = await prisma.patient.update({
            where: { id },
            data: {
                ...updateData,
                allergies: updateData.allergies || undefined,
                vitals: updateData.vitals || undefined,
                updatedAt: new Date(),
            },
        })

        revalidatePath("/doctor/patients")
        return patient
    } catch (error) {
        console.error("Error updating patient:", error)
        throw new Error("Failed to update patient")
    }
}

export async function deletePatient(patientId: string) {
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
            patients: patients.map((patient) => ({
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
                medications: patient.prescriptions.flatMap((prescription) =>
                    prescription.items.map((item) => ({
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

export async function createAppointment(data: {
    patientId: string
    doctorId: string
    date: Date
    time: string
    type: string
    notes?: string
}) {
    try {
        const appointment = await prisma.appointment.create({
            data: {
                patientId: data.patientId,
                doctorId: data.doctorId,
                date: data.date,
                time: data.time,
                type: data.type as any, 
                notes: data.notes,
                status: "Scheduled",
            },
        })
        
        await prisma.patient.update({
            where: { id: data.patientId },
            data: {
                nextAppointment: data.date,
            },
        })

        revalidatePath("/doctor/patients")
        revalidatePath("/doctor")
        return appointment
    } catch (error) {
        console.error("Error creating appointment:", error)
        throw new Error("Failed to create appointment")
    }
}
