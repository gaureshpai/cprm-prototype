"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export interface DepartmentData {
    id: string
    name: string
    description: string
    location: string
    headOfDepartment: string
    contactNumber: string
    email: string
    operatingHours: string
    status: "Active" | "Inactive" | "Maintenance"
    capacity: number
    currentOccupancy: number
    specializations: string[]
    equipment: string[]
    createdAt: Date
    updatedAt: Date
}

export interface DepartmentStats {
    totalDepartments: number
    activeDepartments: number
    totalCapacity: number
    currentOccupancy: number
    occupancyRate: number
    byStatus: Record<string, number>
    bySpecialization: Record<string, number>
}

export interface DepartmentResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function getAllDepartmentsAction(): Promise<DepartmentResponse<DepartmentData[]>> {
    try {
        const departments: DepartmentData[] = [
            {
                id: "D001",
                name: "Cardiology",
                description: "Comprehensive cardiac care and treatment",
                location: "Block A, Floor 1",
                headOfDepartment: "Dr. Rajesh Kumar",
                contactNumber: "+91 824 242 1001",
                email: "cardiology@udalhospital.com",
                operatingHours: "24/7",
                status: "Active",
                capacity: 50,
                currentOccupancy: 35,
                specializations: ["Interventional Cardiology", "Electrophysiology", "Heart Surgery"],
                equipment: ["ECG Machines", "Echocardiogram", "Cardiac Catheterization Lab", "Defibrillators"],
                createdAt: new Date("2020-01-01"),
                updatedAt: new Date("2024-01-15"),
            },
            {
                id: "D002",
                name: "Orthopedics",
                description: "Bone, joint, and musculoskeletal treatment",
                location: "Block B, Floor 2",
                headOfDepartment: "Dr. Priya Sharma",
                contactNumber: "+91 824 242 1002",
                email: "orthopedics@udalhospital.com",
                operatingHours: "6:00 AM - 10:00 PM",
                status: "Active",
                capacity: 40,
                currentOccupancy: 28,
                specializations: ["Joint Replacement", "Sports Medicine", "Spine Surgery", "Trauma Surgery"],
                equipment: ["X-Ray Machines", "MRI Scanner", "Arthroscopy Equipment", "Bone Densitometer"],
                createdAt: new Date("2020-01-01"),
                updatedAt: new Date("2024-01-18"),
            },
            {
                id: "D003",
                name: "Emergency",
                description: "24/7 emergency medical services",
                location: "Block C, Ground Floor",
                headOfDepartment: "Dr. Arun Menon",
                contactNumber: "+91 824 242 1003",
                email: "emergency@udalhospital.com",
                operatingHours: "24/7",
                status: "Active",
                capacity: 30,
                currentOccupancy: 15,
                specializations: ["Trauma Care", "Critical Care", "Emergency Surgery", "Poison Control"],
                equipment: ["Ventilators", "Defibrillators", "Emergency Monitors", "Crash Carts"],
                createdAt: new Date("2020-01-01"),
                updatedAt: new Date("2024-01-20"),
            },
            {
                id: "D004",
                name: "General Medicine",
                description: "Primary healthcare and internal medicine",
                location: "Block A, Floor 2",
                headOfDepartment: "Dr. Sunita Rao",
                contactNumber: "+91 824 242 1004",
                email: "generalmedicine@udalhospital.com",
                operatingHours: "8:00 AM - 8:00 PM",
                status: "Active",
                capacity: 60,
                currentOccupancy: 45,
                specializations: ["Internal Medicine", "Preventive Care", "Chronic Disease Management"],
                equipment: ["Examination Tables", "Blood Pressure Monitors", "Stethoscopes", "Thermometers"],
                createdAt: new Date("2020-01-01"),
                updatedAt: new Date("2024-01-16"),
            },
            {
                id: "D005",
                name: "Pharmacy",
                description: "Medication dispensing and pharmaceutical care",
                location: "Block D, Ground Floor",
                headOfDepartment: "Dr. Kavitha Nair",
                contactNumber: "+91 824 242 1005",
                email: "pharmacy@udalhospital.com",
                operatingHours: "24/7",
                status: "Active",
                capacity: 20,
                currentOccupancy: 12,
                specializations: ["Clinical Pharmacy", "Drug Information", "Medication Therapy Management"],
                equipment: ["Automated Dispensing Systems", "Refrigeration Units", "Compounding Equipment"],
                createdAt: new Date("2020-01-01"),
                updatedAt: new Date("2024-01-19"),
            },
            {
                id: "D006",
                name: "Radiology",
                description: "Medical imaging and diagnostic services",
                location: "Block B, Floor 1",
                headOfDepartment: "Dr. Mohan Das",
                contactNumber: "+91 824 242 1006",
                email: "radiology@udalhospital.com",
                operatingHours: "24/7",
                status: "Maintenance",
                capacity: 25,
                currentOccupancy: 0,
                specializations: ["CT Scan", "MRI", "Ultrasound", "X-Ray", "Nuclear Medicine"],
                equipment: ["CT Scanner", "MRI Machine", "Ultrasound Machines", "X-Ray Equipment"],
                createdAt: new Date("2020-01-01"),
                updatedAt: new Date("2024-01-21"),
            },
        ]

        return { success: true, data: departments }
    } catch (error) {
        console.error("Error fetching departments:", error)
        return { success: false, error: "Failed to fetch departments" }
    }
}

export async function getDepartmentByIdAction(id: string): Promise<DepartmentResponse<DepartmentData>> {
    try {
        const result = await getAllDepartmentsAction()
        if (!result.success || !result.data) {
            return { success: false, error: "Failed to fetch departments" }
        }

        const department = result.data.find((dept) => dept.id === id)
        if (!department) {
            return { success: false, error: "Department not found" }
        }

        return { success: true, data: department }
    } catch (error) {
        console.error("Error fetching department:", error)
        return { success: false, error: "Failed to fetch department" }
    }
}

export async function createDepartmentAction(formData: FormData): Promise<DepartmentResponse<DepartmentData>> {
    try {
        const name = formData.get("name") as string
        const description = formData.get("description") as string
        const location = formData.get("location") as string
        const headOfDepartment = formData.get("headOfDepartment") as string
        const contactNumber = formData.get("contactNumber") as string
        const email = formData.get("email") as string
        const operatingHours = formData.get("operatingHours") as string
        const capacity = Number.parseInt(formData.get("capacity") as string)
        const specializations = (formData.get("specializations") as string).split(",").map((s) => s.trim())
        const equipment = (formData.get("equipment") as string).split(",").map((e) => e.trim())

        if (!name || !description || !location || !headOfDepartment) {
            return { success: false, error: "Required fields are missing" }
        }

        const newDepartment: DepartmentData = {
            id: `D${String(Date.now()).slice(-3)}`,
            name,
            description,
            location,
            headOfDepartment,
            contactNumber,
            email,
            operatingHours,
            status: "Active",
            capacity,
            currentOccupancy: 0,
            specializations,
            equipment,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        console.log("Created new department:", newDepartment)

        revalidatePath("/admin/departments")
        revalidatePath("/technician/departments")

        return { success: true, data: newDepartment }
    } catch (error) {
        console.error("Error creating department:", error)
        return { success: false, error: "Failed to create department" }
    }
}

export async function updateDepartmentAction(
    id: string,
    formData: FormData,
): Promise<DepartmentResponse<DepartmentData>> {
    try {
        const name = formData.get("name") as string
        const description = formData.get("description") as string
        const location = formData.get("location") as string
        const headOfDepartment = formData.get("headOfDepartment") as string
        const contactNumber = formData.get("contactNumber") as string
        const email = formData.get("email") as string
        const operatingHours = formData.get("operatingHours") as string
        const status = formData.get("status") as "Active" | "Inactive" | "Maintenance"
        const capacity = Number.parseInt(formData.get("capacity") as string)
        const currentOccupancy = Number.parseInt(formData.get("currentOccupancy") as string)
        const specializations = (formData.get("specializations") as string).split(",").map((s) => s.trim())
        const equipment = (formData.get("equipment") as string).split(",").map((e) => e.trim())

        const updatedDepartment: DepartmentData = {
            id,
            name,
            description,
            location,
            headOfDepartment,
            contactNumber,
            email,
            operatingHours,
            status,
            capacity,
            currentOccupancy,
            specializations,
            equipment,
            createdAt: new Date("2020-01-01"), 
            updatedAt: new Date(),
        }

        console.log("Updated department:", updatedDepartment)

        revalidatePath("/admin/departments")
        revalidatePath("/technician/departments")

        return { success: true, data: updatedDepartment }
    } catch (error) {
        console.error("Error updating department:", error)
        return { success: false, error: "Failed to update department" }
    }
}

export async function deleteDepartmentAction(id: string): Promise<DepartmentResponse<boolean>> {
    try {
        console.log(`Deleting department ${id}`)

        revalidatePath("/admin/departments")
        revalidatePath("/technician/departments")

        return { success: true, data: true }
    } catch (error) {
        console.error("Error deleting department:", error)
        return { success: false, error: "Failed to delete department" }
    }
}

export async function getDepartmentStatsAction(): Promise<DepartmentResponse<DepartmentStats>> {
    try {
        const result = await getAllDepartmentsAction()
        if (!result.success || !result.data) {
            return { success: false, error: "Failed to fetch departments for stats" }
        }

        const departments = result.data
        const totalDepartments = departments.length
        const activeDepartments = departments.filter((dept) => dept.status === "Active").length
        const totalCapacity = departments.reduce((sum, dept) => sum + dept.capacity, 0)
        const currentOccupancy = departments.reduce((sum, dept) => sum + dept.currentOccupancy, 0)
        const occupancyRate = totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0

        const byStatus = departments.reduce(
            (acc, dept) => {
                acc[dept.status] = (acc[dept.status] || 0) + 1
                return acc
            },
            {} as Record<string, number>,
        )

        const bySpecialization = departments.reduce(
            (acc, dept) => {
                dept.specializations.forEach((spec) => {
                    acc[spec] = (acc[spec] || 0) + 1
                })
                return acc
            },
            {} as Record<string, number>,
        )

        const stats: DepartmentStats = {
            totalDepartments,
            activeDepartments,
            totalCapacity,
            currentOccupancy,
            occupancyRate,
            byStatus,
            bySpecialization,
        }

        return { success: true, data: stats }
    } catch (error) {
        console.error("Error calculating department stats:", error)
        return { success: false, error: "Failed to calculate department statistics" }
    }
}

export async function updateDepartmentOccupancyAction(
    id: string,
    occupancy: number,
): Promise<DepartmentResponse<boolean>> {
    try {
        console.log(`Updating department ${id} occupancy to ${occupancy}`)

        revalidatePath("/admin/departments")
        revalidatePath("/technician/departments")

        return { success: true, data: true }
    } catch (error) {
        console.error("Error updating department occupancy:", error)
        return { success: false, error: "Failed to update department occupancy" }
    }
}
