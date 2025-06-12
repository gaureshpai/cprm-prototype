"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
        id: string
        drugName: string
        currentStock: number
        minStock: number
        status: string
        category?: string | null
        batchNumber?: string | null
        expiryDate?: Date | null
        location: string
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
    doctorUsername: string
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

async function getOrCreateDoctorByUsername(username: string): Promise<string> {
    try {
        let doctor = await prisma.user.findFirst({
            where: {
                username: username,
                role: "DOCTOR",
            },
        })

        if (!doctor) {
            doctor = await prisma.user.create({
                data: {
                    username: username,
                    name: username,
                    email: `${username.toLowerCase().replace(/\s+/g, ".")}@wenlock.hospital`,
                    password: "demo123",
                    role: "DOCTOR",
                    status: "ACTIVE",
                },
            })
        }

        return doctor.id
    } catch (error) {
        console.error("Error getting/creating doctor:", error)
        throw new Error(`Failed to get doctor with username: ${username}`)
    }
}

export async function getDoctorAppointments(doctorUsername: string, date?: Date): Promise<AppointmentData[]> {
    try {
        const doctorId = await getOrCreateDoctorByUsername(doctorUsername)

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

        return appointments.map((appointment:any) => ({
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

export async function getDoctorPatients(doctorUsername: string, limit = 50): Promise<PatientData[]> {
    try {
        const patients = await prisma.patient.findMany({
            where: {
                status: "Active",
            },
            include: {
                prescriptions: {
                    include: {
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
                    take: 5,
                },
            },
            orderBy: {
                lastVisit: "desc",
            },
            take: limit,
        })

        return patients.map((patient:any) => ({
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
                })),
            ),
            medicalHistory: [],
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
        }))
    } catch (error) {
        console.error("Error fetching all patients:", error)
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
                    take: 5,
                },
            },
            orderBy: {
                name: "asc",
            },
            take: limit,
        })

        return patients.map((patient:any) => ({
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
        const doctorId = await getOrCreateDoctorByUsername(data.doctorUsername)

        const drugPromises = data.medications.map(async (med) => {
            let drug = await prisma.drugInventory.findFirst({
                where: { drugName: { equals: med.drugName, mode: "insensitive" } },
            })

            if (!drug) {
                drug = await prisma.drugInventory.create({
                    data: {
                        drugName: med.drugName,
                        currentStock: 0,
                        minStock: 10,
                        status: "normal",
                    },
                })
            }

            if (drug.currentStock <= 0) {
                console.warn(`Drug ${drug.drugName} is out of stock but allowing prescription`)
            }

            if (drug.expiryDate && drug.expiryDate < new Date()) {
                console.warn(`Drug ${drug.drugName} has expired but allowing prescription`)
            }

            return drug
        })

        const drugs = await Promise.all(drugPromises)

        const prescription = await prisma.prescription.create({
            data: {
                patientId: data.patientId,
                doctorId: doctorId,
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
            items: prescription.items.map((item:any) => ({
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
        throw new Error(`Failed to create prescription: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
}

export async function getDoctorPrescriptions(doctorUsername: string, limit = 50): Promise<PrescriptionData[]> {
    try {
        const doctorId = await getOrCreateDoctorByUsername(doctorUsername)

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

        return prescriptions.map((prescription:any) => ({
            id: prescription.id,
            patientId: prescription.patientId,
            doctorId: prescription.doctorId,
            status: prescription.status,
            notes: prescription.notes,
            patient: prescription.patient,
            items: prescription.items.map((item:any) => ({
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

export async function getDoctorStats(doctorUsername: string) {
    try {
        const doctorId = await getOrCreateDoctorByUsername(doctorUsername)

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const [todayAppointments, totalPatients, pendingPrescriptions, completedAppointments, prescriptionsToday] =
            await Promise.all([
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
                        status: "Active",
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
                
                prisma.prescription.count({
                    where: {
                        doctorId,
                        createdAt: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                }),
            ])

        return {
            todayAppointments,
            totalPatients,
            pendingPrescriptions,
            completedAppointments,
            prescriptionsToday,
        }
    } catch (error) {
        console.error("Error fetching doctor stats:", error)
        throw new Error("Failed to fetch doctor statistics")
    }
}

export async function getAvailableDrugs(query?: string): Promise<
    {
        id: string
        drugName: string
        currentStock: number
        minStock: number
        status: string
        category?: string | null
        expiryDate?: Date | null
        location: string
    }[]
> {
    try {
        const drugs = await prisma.drugInventory.findMany({
            where: {
                AND: [
                    query
                        ? {
                            drugName: {
                                contains: query,
                                mode: "insensitive",
                            },
                        }
                        : {},
                    {
                        OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
                    },
                ],
            },
            select: {
                id: true,
                drugName: true,
                currentStock: true,
                minStock: true,
                status: true,
                category: true,
                expiryDate: true,
                location: true,
            },
            orderBy: [{ currentStock: "desc" }, { status: "asc" }, { drugName: "asc" }],
            take: 100,
        })

        return drugs
    } catch (error) {
        console.error("Error fetching available drugs:", error)
        throw new Error("Failed to fetch available drugs")
    }
}

export async function getAllDrugsForSelection(query?: string): Promise<
    {
        id: string
        drugName: string
        currentStock: number
        minStock: number
        status: string
        category?: string | null
        expiryDate?: Date | null
        location: string
        isAvailable: boolean
    }[]
> {
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
                currentStock: true,
                minStock: true,
                status: true,
                category: true,
                expiryDate: true,
                location: true,
            },
            orderBy: [{ currentStock: "desc" }, { drugName: "asc" }],
            take: 100,
        })
        
        return drugs.map((drug:any) => ({
            ...drug,
            location: drug.location || "Main Pharmacy",
            isAvailable: drug.currentStock > 0 && (!drug.expiryDate || drug.expiryDate > new Date()),
        }))
    } catch (error) {
        console.error("Error fetching all drugs:", error)
        throw new Error(`Failed to fetch drugs: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
}