"use server"

import prisma from "@/lib/prisma"

export interface Patient {
    id: string
    name: string
    age: number
    gender: string
    bed: string
    condition: string
    status: string
    doctor: string
    department: string
    admissionDate: string
    vitals: {
        temp: string
        bp: string
        pulse: string
        spo2: string
        lastUpdated: string
    }
    medications: {
        name: string
        dosage: string
        frequency: string
        nextDue: string
        status: "due" | "administered" | "missed"
    }[]
    notes?: string
}

export interface Surgery {
    id: string
    patientName: string
    surgeon: string
    procedure: string
    theater: string
    scheduledTime: string
    status: "scheduled" | "in-progress" | "completed" | "cancelled"
    estimatedDuration: string
}

export interface Task {
    id: string
    patientId: string
    patientName: string
    task: string
    priority: "high" | "medium" | "low"
    time: string
    completed: boolean
    assignedBy: string
}

export interface NurseDashboardData {
    patients: Patient[]
    surgeries: Surgery[]
    tasks: Task[]
}

export async function getEmergencyAlerts() {
    try {
        const alerts = await prisma.emergencyAlert.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
        })

        return alerts.map((alert) => ({
            id: alert.id,
            codeType: alert.codeType,
            location: alert.location,
            message: alert.message,
            status: alert.status,
            priority: alert.priority,
            createdAt: alert.createdAt.toISOString(),
            resolvedAt: alert.resolvedAt?.toISOString() || null,
            broadcastTo: alert.broadcastTo,
        }))
    } catch (error) {
        console.error("Error fetching emergency alerts:", error)
        throw new Error("Failed to fetch emergency alerts")
    }
}
  
export async function getNurseDashboardData(): Promise<NurseDashboardData> {
    try {
        const patientsData = await prisma.patient.findMany({
            where: {
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
                        doctor: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1, 
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })
        
        const patients: Patient[] = patientsData.map((patient) => {
            const vitals =
                typeof patient.vitals === "object" && patient.vitals !== null
                    ? (patient.vitals as { bp?: string; pulse?: string; temp?: string; spo2?: string })
                    : { bp: "", pulse: "", temp: "", spo2: "" }

            const latestPrescription = patient.prescriptions[0]
            const medications =
                latestPrescription?.items.map((item) => ({
                    name: item.drug.drugName,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    nextDue: getNextDueTime(item.frequency),
                    status: "due" as const, 
                })) || []

            return {
                id: patient.id,
                name: patient.name,
                age: patient.age,
                gender: patient.gender,
                bed: `${patient.id.slice(-3)}`, 
                condition: patient.condition || "Stable",
                status: patient.status,
                doctor: latestPrescription?.doctor.name || "Dr. Assigned",
                department: "General", 
                admissionDate: patient.createdAt.toISOString().split("T")[0],
                vitals: {
                    temp: vitals.temp || "98.6°F",
                    bp: vitals.bp || "120/80",
                    pulse: vitals.pulse || "72 bpm",
                    spo2: vitals.spo2 || "98%",
                    lastUpdated: patient.updatedAt.toISOString(),
                },
                medications,
                notes: "", 
            }
        })
        
        const surgeriesData = await prisma.oTStatus.findMany({
            where: {
                patientName: { not: "null" },
                procedure: { not: "Available" },
                startTime: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lte: new Date(new Date().setHours(23, 59, 59, 999)),
                },
            },
            orderBy: {
                startTime: "asc",
            },
        })
        
        const surgeries: Surgery[] = surgeriesData.map((surgery) => {
            const now = new Date()
            const startTime = new Date(surgery.startTime)
            const estimatedEnd = new Date(surgery.estimatedEnd)

            let status: "scheduled" | "in-progress" | "completed" | "cancelled" = "scheduled"
            if (surgery.status === "In Progress" || (now >= startTime && now <= estimatedEnd)) {
                status = "in-progress"
            } else if (surgery.status === "Completed" || now > estimatedEnd) {
                status = "completed"
            } else if (surgery.status === "Cancelled") {
                status = "cancelled"
            }

            const duration = Math.floor((estimatedEnd.getTime() - startTime.getTime()) / (1000 * 60 * 60))

            return {
                id: surgery.id,
                patientName: surgery.patientName || "Unknown Patient",
                surgeon: surgery.surgeon || "Dr. Assigned",
                procedure: surgery.procedure,
                theater: surgery.id,
                scheduledTime: startTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                status,
                estimatedDuration: `${duration} hours`,
            }
        })
        
        const tasks: Task[] = patients
            .filter((patient) => patient.condition === "Critical" || patient.medications.length > 0)
            .map((patient, index) => ({
                id: `task-${patient.id}-${index}`,
                patientId: patient.id,
                patientName: patient.name,
                task: patient.condition === "Critical" ? "Monitor vitals every hour" : "Administer scheduled medications",
                priority: patient.condition === "Critical" ? "high" : "medium",
                time: new Date(Date.now() + index * 60 * 60 * 1000).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                completed: false,
                assignedBy: patient.doctor,
            }))

        return {
            patients,
            surgeries,
            tasks,
        }
    } catch (error) {
        console.error("Error fetching nurse dashboard data:", error)
        throw new Error("Failed to fetch nurse dashboard data")
    }
}

export async function updatePatient(
    patientId: string,
    patientData: {
        name?: string
        age?: number
        gender?: string
        condition?: string
        notes?: string
    },
): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.patient.update({
            where: { id: patientId },
            data: {
                name: patientData.name,
                age: patientData.age,
                gender: patientData.gender,
                condition: patientData.condition,
                updatedAt: new Date(),
            },
        })

        return { success: true, message: "Patient updated successfully" }
    } catch (error) {
        console.error("Error updating patient:", error)
        throw new Error("Failed to update patient")
    }
}

export async function updatePatientVitals(
    patientId: string,
    vitalsData: {
        temp?: string
        bp?: string
        pulse?: string
        spo2?: string
        notes?: string
    },
): Promise<{ success: boolean; message: string }> {
    try {
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: { vitals: true },
        })

        const currentVitals =
            typeof patient?.vitals === "object" && patient.vitals !== null ? (patient.vitals as Record<string, any>) : {}
        
        const updatedVitals = {
            ...currentVitals,
            temp: vitalsData.temp || currentVitals.temp,
            bp: vitalsData.bp || currentVitals.bp,
            pulse: vitalsData.pulse || currentVitals.pulse,
            spo2: vitalsData.spo2 || currentVitals.spo2,
            lastUpdated: new Date().toISOString(),
        }

        await prisma.patient.update({
            where: { id: patientId },
            data: {
                vitals: updatedVitals,
                updatedAt: new Date(),
            },
        })

        return { success: true, message: "Vitals updated successfully" }
    } catch (error) {
        console.error("Error updating vitals:", error)
        throw new Error("Failed to update vitals")
    }
}

export async function administerMedication(
    patientId: string,
    medicationName: string,
    nurseId: string,
): Promise<{ success: boolean; message: string }> {
    try {
        const prescriptionItem = await prisma.prescriptionItem.findFirst({
            where: {
                prescription: {
                    patientId: patientId,
                },
                drug: {
                    drugName: {
                        contains: medicationName,
                        mode: "insensitive",
                    },
                },
            },
            include: {
                drug: true,
                prescription: true,
            },
        })

        if (!prescriptionItem) {
            return { success: false, message: "Medication not found in patient's prescription" }
        }

        if (prescriptionItem.drug.currentStock > 0) {
            await prisma.drugInventory.update({
                where: { id: prescriptionItem.drug.id },
                data: {
                    currentStock: prescriptionItem.drug.currentStock - 1,
                    updatedAt: new Date(),
                },
            })
        }

        return { success: true, message: "Medication administered successfully" }
    } catch (error) {
        console.error("Error administering medication:", error)
        throw new Error("Failed to administer medication")
    }
}

export async function completeTask(taskId: string, nurseId: string): Promise<{ success: boolean; message: string }> {
    try {
        console.log(`Task ${taskId} completed by nurse ${nurseId}`)

        return { success: true, message: "Task completed successfully" }
    } catch (error) {
        console.error("Error completing task:", error)
        throw new Error("Failed to complete task")
    }
}

export async function getNurseStats() {
    try {
        const [totalPatients, criticalPatients, totalSurgeries, activeSurgeries] = await Promise.all([
            prisma.patient.count({
                where: { status: "Active" },
            }),
            prisma.patient.count({
                where: {
                    status: "Active",
                    condition: "Critical",
                },
            }),
            prisma.oTStatus.count({
                where: {
                    patientName: { not: "null" },
                    procedure: { not: "Available" },
                },
            }),
            prisma.oTStatus.count({
                where: {
                    status: "In Progress",
                },
            }),
        ])

        return {
            totalPatients,
            criticalPatients,
            totalSurgeries,
            activeSurgeries,
        }
    } catch (error) {
        console.error("Error fetching nurse stats:", error)
        throw new Error("Failed to fetch nurse statistics")
    }
}

function getNextDueTime(frequency: string): string {
    const now = new Date()
    const nextDue = new Date(now)
    
    if (frequency.toLowerCase().includes("daily") || frequency.toLowerCase().includes("once")) {
        nextDue.setHours(9, 0, 0, 0) 
        if (nextDue <= now) {
            nextDue.setDate(nextDue.getDate() + 1)
        }
    } else if (frequency.toLowerCase().includes("6 hours")) {
        const hours = Math.ceil((now.getHours() + 1) / 6) * 6
        nextDue.setHours(hours % 24, 0, 0, 0)
        if (hours >= 24) {
            nextDue.setDate(nextDue.getDate() + 1)
        }
    } else if (frequency.toLowerCase().includes("8 hours")) {
        const hours = Math.ceil((now.getHours() + 1) / 8) * 8
        nextDue.setHours(hours % 24, 0, 0, 0)
        if (hours >= 24) {
            nextDue.setDate(nextDue.getDate() + 1)
        }
    } else {
        nextDue.setHours(now.getHours() + 1, 0, 0, 0)
    }

    return nextDue.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}