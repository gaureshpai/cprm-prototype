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
    doctorUsername: string  
    diagnosis: string
    symptoms: string[]
    treatment?: string
    notes?: string
    vitals?: any
    followUpRequired: boolean
    followUpDate?: string
}


async function getDoctorByUsername(username: string) {
    const doctor = await prisma.user.findUnique({
        where: { username: username },
        select: { id: true, username: true, role: true, name: true, status: true }
    })
    return doctor
}


export async function getDoctorAppointments(doctorUsername: string, date?: Date): Promise<AppointmentData[]> {
    try {
        
        const doctor = await getDoctorByUsername(doctorUsername)
        if (!doctor) {
            throw new Error(`Doctor with username ${doctorUsername} not found`)
        }

        if (doctor.role !== 'DOCTOR') {
            throw new Error(`User ${doctor.name} (${doctorUsername}) is not a doctor`)
        }

        if (doctor.status !== 'ACTIVE') {
            throw new Error(`Doctor ${doctor.name} is not active`)
        }

        const targetDate = date || new Date()
        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctor.id,  
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


export async function getDoctorPatients(doctorUsername: string, limit = 50): Promise<PatientData[]> {
    try {
        
        const doctor = await getDoctorByUsername(doctorUsername)
        if (!doctor) {
            throw new Error(`Doctor with username ${doctorUsername} not found`)
        }

        if (doctor.role !== 'DOCTOR') {
            throw new Error(`User ${doctor.name} (${doctorUsername}) is not a doctor`)
        }

        if (doctor.status !== 'ACTIVE') {
            throw new Error(`Doctor ${doctor.name} is not active`)
        }

        
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
            medications: patient.prescriptions.flatMap((prescription) =>
                prescription.items.map((item) => ({
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
        
        const doctor = await getDoctorByUsername(data.doctorUsername)

        if (!doctor) {
            throw new Error(`Doctor with username ${data.doctorUsername} not found`)
        }

        if (doctor.role !== 'DOCTOR') {
            throw new Error(`User ${doctor.name} (${data.doctorUsername}) is not a doctor`)
        }

        if (doctor.status !== 'ACTIVE') {
            throw new Error(`Doctor ${doctor.name} is not active`)
        }

        
        const patient = await prisma.patient.findUnique({
            where: { id: data.patientId },
            select: { id: true, name: true, status: true }
        })

        if (!patient) {
            throw new Error(`Patient with ID ${data.patientId} not found`)
        }

        if (patient.status !== 'Active') {
            throw new Error(`Patient ${patient.name} is not active`)
        }

        
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

            
            if (drug.currentStock <= 0) {
                throw new Error(`${drug.drugName} is out of stock`)
            }

            
            if (drug.expiryDate && drug.expiryDate < new Date()) {
                throw new Error(`${drug.drugName} has expired`)
            }

            return drug
        })

        const drugs = await Promise.all(drugPromises)

        
        const prescription = await prisma.prescription.create({
            data: {
                patientId: data.patientId,
                doctorId: doctor.id,  
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

        
        if (error instanceof Error && error.message.includes('not found') ||
            error instanceof Error && error.message.includes('not a doctor') ||
            error instanceof Error && error.message.includes('not active')) {
            throw error
        }

        
        throw new Error("Failed to create prescription")
    }
}


export async function validatePrescriptionData(patientId: string, doctorUsername: string) {
    try {
        console.log('Validating prescription data...')
        console.log('Patient ID:', patientId)
        console.log('Doctor Username:', doctorUsername)

        
        const doctor = await getDoctorByUsername(doctorUsername)
        console.log('Doctor found:', doctor)

        
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: { id: true, name: true, status: true }
        })

        console.log('Patient found:', patient)

        return {
            doctor,
            patient,
            isValid: !!doctor && !!patient && doctor.role === 'DOCTOR' && doctor.status === 'ACTIVE' && patient.status === 'Active'
        }
    } catch (error) {
        console.error('Error validating prescription data:', error)
        return { doctor: null, patient: null, isValid: false }
    }
}


export async function getDoctorPrescriptions(doctorUsername: string, limit = 50): Promise<PrescriptionData[]> {
    try {
        
        const doctor = await getDoctorByUsername(doctorUsername)
        if (!doctor) {
            throw new Error(`Doctor with username ${doctorUsername} not found`)
        }

        if (doctor.role !== 'DOCTOR') {
            throw new Error(`User ${doctor.name} (${doctorUsername}) is not a doctor`)
        }

        if (doctor.status !== 'ACTIVE') {
            throw new Error(`Doctor ${doctor.name} is not active`)
        }

        const prescriptions = await prisma.prescription.findMany({
            where: { doctorId: doctor.id },  
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


export async function getDoctorStats(doctorUsername: string) {
    try {
        
        const doctor = await getDoctorByUsername(doctorUsername)
        if (!doctor) {
            throw new Error(`Doctor with username ${doctorUsername} not found`)
        }

        if (doctor.role !== 'DOCTOR') {
            throw new Error(`User ${doctor.name} (${doctorUsername}) is not a doctor`)
        }

        if (doctor.status !== 'ACTIVE') {
            throw new Error(`Doctor ${doctor.name} is not active`)
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const [todayAppointments, totalPatients, pendingPrescriptions, completedAppointments] = await Promise.all([
            prisma.appointment.count({
                where: {
                    doctorId: doctor.id,  
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
                    doctorId: doctor.id,  
                    status: "Pending",
                },
            }),
            prisma.appointment.count({
                where: {
                    doctorId: doctor.id,  
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
                        OR: [
                            { expiryDate: null }, 
                            { expiryDate: { gt: new Date() } }, 
                        ],
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
            orderBy: [
                { currentStock: "desc" }, 
                { status: "asc" }, 
                { drugName: "asc" },
            ],
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
            orderBy: [
                { currentStock: "desc" }, 
                { drugName: "asc" },
            ],
            take: 100,
        })

        return drugs.map((drug) => ({
            ...drug,
            isAvailable: drug.currentStock > 0 && (!drug.expiryDate || drug.expiryDate > new Date()),
        }))
    } catch (error) {
        console.error("Error fetching all drugs:", error)
        throw new Error("Failed to fetch drugs")
    }
}