"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export interface PatientData {
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
    medications: Array<{
        id: string
        name: string
        dosage: string
        frequency: string
        duration: string
        instructions?: string
    }>
    medicalHistory: Array<{
        id: string
        date: Date
        diagnosis: string
        treatment?: string
        notes?: string
    }>
    createdAt: Date
    updatedAt: Date
}

export interface AppointmentData {
    id: string
    patientId: string
    doctorId: string
    date: Date
    time: string
    status: string
    type: string
    notes?: string | null
    patient: {
        name: string
        age: number
        condition?: string | null
    }
    createdAt: Date
}

export interface PrescriptionData {
    id: string
    patientId: string
    doctorId: string
    status: string
    notes?: string | null
    items: PrescriptionItemData[]
    patient: {
        name: string
        age: number
    }
    createdAt: Date
}

export interface PrescriptionItemData {
    id: string
    drugId: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string | null
    drug: {
        drugName: string
    }
}

export interface MedicalRecordData {
    id: string
    patientId: string
    doctorId: string
    visitDate: Date
    diagnosis: string
    symptoms: string[]
    treatment?: string | null
    notes?: string | null
    vitals: any
    followUpRequired: boolean
    followUpDate?: Date | null
    patient: {
        name: string
        age: number
    }
}

export interface CreatePrescriptionData {
    patientId: string
    doctorId: string
    notes?: string
    medications: {
        drugName: string
        dosage: string
        frequency: string
        duration: string
        instructions?: string
    }[]
}

export interface CreateMedicalRecordData {
    patientId: string
    doctorId: string
    diagnosis: string
    symptoms: string[]
    treatment?: string
    notes?: string
    vitals?: any
    followUpRequired: boolean
    followUpDate?: string
}

export async function getDoctorAppointments(doctorId: string, date?: Date): Promise<AppointmentData[]> {
    try {
        const targetDate = date || new Date()
        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                patient: {
                    select: {
                        name: true,
                        age: true,
                        condition: true,
                    },
                },
            },
            orderBy: {
                time: "asc",
            },
        })

        return appointments.map((appointment) => ({
            id: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
            type: appointment.type.toString(), 
            notes: appointment.notes,
            patient: appointment.patient,
            createdAt: appointment.createdAt,
        }))
    } catch (error) {
        console.error("Error fetching doctor appointments:", error)
        throw new Error("Failed to fetch appointments")
    }
}

export async function getDoctorPatients(doctorId: string, limit = 50): Promise<PatientData[]> {
    try {
        const patients = await prisma.patient.findMany({
            where: {
                appointments: {
                    some: {
                        doctorId,
                    },
                },
            },
            include: {
                prescriptions: {
                    where: {
                        doctorId,
                    },
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
                lastVisit: "desc",
            },
            take: limit,
        })

        return patients.map((patient) => ({
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
        }))
    } catch (error) {
        console.error("Error fetching doctor patients:", error)
        throw new Error("Failed to fetch patients")
    }
}

export async function searchPatients(query: string, limit = 20): Promise<PatientData[]> {
    try {
        const patients = await prisma.patient.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { id: { contains: query, mode: "insensitive" } },
                    { phone: { contains: query } },
                ],
                status: "Active",
            },
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
                name: "asc",
            },
            take: limit,
        })

        return patients.map((patient) => ({
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
        }))
    } catch (error) {
        console.error("Error searching patients:", error)
        throw new Error("Failed to search patients")
    }
}

export async function getPatientDetails(patientId: string): Promise<PatientData | null> {
    try {
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
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
        }
    } catch (error) {
        console.error("Error fetching patient details:", error)
        throw new Error("Failed to fetch patient details")
    }
}

export async function createPrescription(data: CreatePrescriptionData): Promise<PrescriptionData> {
    try {
        const drugPromises = data.medications.map(async (med) => {
            let drug = await prisma.drugInventory.findFirst({
                where: { drugName: { equals: med.drugName, mode: "insensitive" } },
            })

            if (!drug) {
                drug = await prisma.drugInventory.create({
                    data: {
                        drugName: med.drugName,
                        currentStock: 100, 
                        minStock: 10,
                        status: "normal",
                    },
                })
            }

            return drug
        })

        const drugs = await Promise.all(drugPromises)
        
        const prescription = await prisma.prescription.create({
            data: {
                patientId: data.patientId,
                doctorId: data.doctorId,
                notes: data.notes,
                status: "Pending",
                items: {
                    create: data.medications.map((med, index) => ({
                        drugId: drugs[index].id,
                        dosage: med.dosage,
                        frequency: med.frequency,
                        duration: med.duration,
                        instructions: med.instructions,
                    })),
                },
            },
            include: {
                patient: {
                    select: {
                        name: true,
                        age: true,
                    },
                },
                items: {
                    include: {
                        drug: {
                            select: {
                                drugName: true,
                            },
                        },
                    },
                },
            },
        })
        
        await prisma.patient.update({
            where: { id: data.patientId },
            data: {
                lastVisit: new Date(),
            },
        })

        revalidatePath("/doctor")

        return {
            id: prescription.id,
            patientId: prescription.patientId,
            doctorId: prescription.doctorId,
            status: prescription.status,
            notes: prescription.notes,
            patient: prescription.patient,
            items: prescription.items.map((item) => ({
                id: item.id,
                drugId: item.drugId,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instructions: item.instructions,
                drug: item.drug,
            })),
            createdAt: prescription.createdAt,
        }
    } catch (error) {
        console.error("Error creating prescription:", error)
        throw new Error("Failed to create prescription")
    }
}

export async function getDoctorPrescriptions(doctorId: string, limit = 50): Promise<PrescriptionData[]> {
    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { doctorId },
            include: {
                patient: {
                    select: {
                        name: true,
                        age: true,
                    },
                },
                items: {
                    include: {
                        drug: {
                            select: {
                                drugName: true,
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

        return prescriptions.map((prescription) => ({
            id: prescription.id,
            patientId: prescription.patientId,
            doctorId: prescription.doctorId,
            status: prescription.status,
            notes: prescription.notes,
            patient: prescription.patient,
            items: prescription.items.map((item) => ({
                id: item.id,
                drugId: item.drugId,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instructions: item.instructions,
                drug: item.drug,
            })),
            createdAt: prescription.createdAt,
        }))
    } catch (error) {
        console.error("Error fetching doctor prescriptions:", error)
        throw new Error("Failed to fetch prescriptions")
    }
}

export async function updateAppointmentStatus(appointmentId: string, status: string): Promise<boolean> {
    try {
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
        })

        revalidatePath("/doctor")
        return true
    } catch (error) {
        console.error("Error updating appointment status:", error)
        throw new Error("Failed to update appointment status")
    }
}

export async function getDoctorStats(doctorId: string) {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const [todayAppointments, totalPatients, pendingPrescriptions, completedAppointments] = await Promise.all([
            prisma.appointment.count({
                where: {
                    doctorId,
                    date: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),
            prisma.patient.count({
                where: {
                    appointments: {
                        some: { doctorId },
                    },
                },
            }),
            prisma.prescription.count({
                where: {
                    doctorId,
                    status: "Pending",
                },
            }),
            prisma.appointment.count({
                where: {
                    doctorId,
                    date: {
                        gte: today,
                        lt: tomorrow,
                    },
                    status: "Completed",
                },
            }),
        ])

        return {
            todayAppointments,
            totalPatients,
            pendingPrescriptions,
            completedAppointments,
        }
    } catch (error) {
        console.error("Error fetching doctor stats:", error)
        throw new Error("Failed to fetch doctor statistics")
    }
}

export async function getAvailableDrugs(query?: string): Promise<{ id: string; drugName: string }[]> {
    try {
        const drugs = await prisma.drugInventory.findMany({
            where: query
                ? {
                    drugName: {
                        contains: query,
                        mode: "insensitive",
                    },
                }
                : {},
            select: {
                id: true,
                drugName: true,
            },
            orderBy: {
                drugName: "asc",
            },
            take: 50,
        })

        return drugs
    } catch (error) {
        console.error("Error fetching available drugs:", error)
        throw new Error("Failed to fetch available drugs")
    }
}
