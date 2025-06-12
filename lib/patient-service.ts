"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

export interface PatientDetailsData {
    id: string
    name: string
    age: number
    gender: string
    phone?: string | null
    address?: string | null
    condition?: string | null
    status: string
    allergies: string[]
    bloodType?: string | null
    emergencyContact?: string | null
    emergencyPhone?: string | null
    vitals: {
        bp?: string
        pulse?: string
        temp?: string
        weight?: string
        height?: string
    }
    lastVisit?: Date | null
    nextAppointment?: Date | null
    appointments: Array<{
        id: string
        date: Date
        time: string
        status: string
        type: string
        notes?: string | null
        doctor: {
            name: string
            username: string
        }
    }>
    medications: Array<{
        id: string
        name: string
        dosage: string
        frequency: string
        duration: string
        instructions?: string | null
        drugInfo: {
            id: string
            currentStock: number
            minStock: number
            status: string
            category?: string | null
            batchNumber?: string | null
            expiryDate?: Date | null
            location: string
        }
        prescriptionDate: Date
        prescribedBy: string
    }>
    medicalHistory: Array<{
        id: string
        date: Date
        diagnosis: string
        treatment?: string
        notes?: string
        doctor: string
    }>
    createdAt: Date
    updatedAt: Date
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
            patients: patients.map((patient: any) => ({
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

export async function getPatientById(patientId: string): Promise<PatientDetailsData | null> {
    try {
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            include: {
                appointments: {
                    include: {
                        doctor: {
                            select: {
                                name: true,
                                username: true,
                            },
                        },
                    },
                    orderBy: {
                        date: "desc",
                    },
                },
                prescriptions: {
                    include: {
                        doctor: {
                            select: {
                                name: true,
                                username: true,
                            },
                        },
                        items: {
                            include: {
                                drug: {
                                    select: {
                                        id: true,
                                        drugName: true,
                                        currentStock: true,
                                        minStock: true,
                                        status: true,
                                        category: true,
                                        batchNumber: true,
                                        expiryDate: true,
                                        location: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        })

        if (!patient) return null

        return {
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
            appointments: patient.appointments.map((appointment:any) => ({
                id: appointment.id,
                date: appointment.date,
                time: appointment.time,
                status: appointment.status,
                type: appointment.type.toString(),
                notes: appointment.notes,
                doctor: appointment.doctor,
            })),
            medications: patient.prescriptions.flatMap((prescription:any) =>
                prescription.items.map((item:any) => ({
                    id: item.id,
                    name: item.drug.drugName,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    duration: item.duration,
                    instructions: item.instructions,
                    drugInfo: {
                        id: item.drug.id,
                        currentStock: item.drug.currentStock,
                        minStock: item.drug.minStock,
                        status: item.drug.status,
                        category: item.drug.category,
                        batchNumber: item.drug.batchNumber,
                        expiryDate: item.drug.expiryDate,
                        location: item.drug.location,
                    },
                    prescriptionDate: prescription.createdAt,
                    prescribedBy: prescription.doctor.name,
                })),
            ),
            medicalHistory: [],
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
        }
    } catch (error) {
        console.error("Error fetching patient by ID:", error)
        throw new Error("Failed to fetch patient details")
    }
}

export async function searchPatientById(patientId: string): Promise<PatientDetailsData | null> {
    try {
        let patient = await getPatientById(patientId)

        if (!patient) {
            const patients = await prisma.patient.findMany({
                where: {
                    OR: [
                        { id: { contains: patientId, mode: "insensitive" } },
                        { name: { contains: patientId, mode: "insensitive" } },
                    ],
                    status: "Active",
                },
                take: 1,
            })

            if (patients.length > 0) {
                patient = await getPatientById(patients[0].id)
            }
        }

        return patient
    } catch (error) {
        console.error("Error searching patient by ID:", error)
        throw new Error("Failed to search patient")
    }
}

export async function getPatientAppointments(patientId: string, limit = 20) {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { patientId },
            include: {
                doctor: {
                    select: {
                        name: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
            take: limit,
        })

        return appointments.map((appointment:any) => ({
            id: appointment.id,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
            type: appointment.type.toString(),
            notes: appointment.notes,
            doctor: appointment.doctor,
            createdAt: appointment.createdAt,
        }))
    } catch (error) {
        console.error("Error fetching patient appointments:", error)
        throw new Error("Failed to fetch patient appointments")
    }
}

export async function getPatientMedications(patientId: string, limit = 20) {
    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { patientId },
            include: {
                doctor: {
                    select: {
                        name: true,
                        username: true,
                    },
                },
                items: {
                    include: {
                        drug: {
                            select: {
                                id: true,
                                drugName: true,
                                currentStock: true,
                                minStock: true,
                                status: true,
                                category: true,
                                batchNumber: true,
                                expiryDate: true,
                                location: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        })

        return prescriptions.flatMap((prescription:any) =>
            prescription.items.map((item:any) => ({
                id: item.id,
                name: item.drug.drugName,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instructions: item.instructions,
                drugInfo: {
                    id: item.drug.id,
                    currentStock: item.drug.currentStock,
                    minStock: item.drug.minStock,
                    status: item.drug.status,
                    category: item.drug.category,
                    batchNumber: item.drug.batchNumber,
                    expiryDate: item.drug.expiryDate,
                    location: item.drug.location,
                },
                prescriptionDate: prescription.createdAt,
                prescribedBy: prescription.doctor.name,
                prescriptionId: prescription.id,
                status: prescription.status,
            })),
        )
    } catch (error) {
        console.error("Error fetching patient medications:", error)
        throw new Error("Failed to fetch patient medications")
    }
}

export async function getPatientStats(patientId: string) {
    try {
        const [totalAppointments, completedAppointments, activeMedications, lastVisit] = await Promise.all([
            prisma.appointment.count({
                where: { patientId },
            }),

            prisma.appointment.count({
                where: {
                    patientId,
                    status: "Completed",
                },
            }),

            prisma.prescription.count({
                where: {
                    patientId,
                    status: { in: ["Pending", "Dispensed"] },
                },
            }),

            prisma.appointment.findFirst({
                where: {
                    patientId,
                    status: "Completed",
                },
                orderBy: {
                    date: "desc",
                },
                select: {
                    date: true,
                },
            }),
        ])

        return {
            totalAppointments,
            completedAppointments,
            activeMedications,
            lastVisitDate: lastVisit?.date || null,
        }
    } catch (error) {
        console.error("Error fetching patient stats:", error)
        throw new Error("Failed to fetch patient statistics")
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

export async function updatePatientVitals(
    patientId: string,
    vitals: {
        bp?: string
        pulse?: string
        temp?: string
        weight?: string
        height?: string
    },
) {
    try {
        const patient = await prisma.patient.update({
            where: { id: patientId },
            data: {
                vitals: vitals,
                updatedAt: new Date(),
            },
        })

        revalidatePath("/doctor/patients")
        return patient
    } catch (error) {
        console.error("Error updating patient vitals:", error)
        throw new Error("Failed to update patient vitals")
    }
}