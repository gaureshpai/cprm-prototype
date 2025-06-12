"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface DepartmentData {
    id: string
    name: string
    description: string
    location: string
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
        const departments = await prisma.department.findMany({
            orderBy: { name: "asc" },
        })

        const departmentData: DepartmentData[] = departments.map((dept) => ({
            id: dept.id,
            name: dept.name,
            description: dept.description,
            location: dept.location,
            contactNumber: dept.contactNumber || "",
            email: dept.email || "",
            operatingHours: dept.operatingHours,
            status: dept.status as "Active" | "Inactive" | "Maintenance",
            capacity: dept.capacity,
            currentOccupancy: dept.currentOccupancy,
            specializations: dept.specializations,
            equipment: dept.equipment,
            createdAt: dept.createdAt,
            updatedAt: dept.updatedAt,
        }))

        return { success: true, data: departmentData }
    } catch (error) {
        console.error("Error fetching departments:", error)
        return { success: false, error: "Failed to fetch departments" }
    } finally {
        await prisma.$disconnect()
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
        const contactNumber = formData.get("contactNumber") as string
        const email = formData.get("email") as string
        const operatingHours = formData.get("operatingHours") as string
        const capacity = Number.parseInt(formData.get("capacity") as string) || 50
        const specializations = (formData.get("specializations") as string)
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        const equipment = (formData.get("equipment") as string)
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e.length > 0)

        if (!name || !description || !location) {
            return { success: false, error: "Required fields are missing" }
        }

        const department = await prisma.department.create({
            data: {
                name,
                description,
                location,
                contactNumber,
                email,
                operatingHours,
                capacity,
                specializations,
                equipment,
            },
        })

        const departmentData: DepartmentData = {
            id: department.id,
            name: department.name,
            description: department.description,
            location: department.location,
            contactNumber: department.contactNumber || "",
            email: department.email || "",
            operatingHours: department.operatingHours,
            status: department.status as "Active" | "Inactive" | "Maintenance",
            capacity: department.capacity,
            currentOccupancy: department.currentOccupancy,
            specializations: department.specializations,
            equipment: department.equipment,
            createdAt: department.createdAt,
            updatedAt: department.updatedAt,
        }

        revalidatePath("/admin/departments")
        revalidatePath("/admin/users")

        return { success: true, data: departmentData }
    } catch (error) {
        console.error("Error creating department:", error)
        return { success: false, error: "Failed to create department" }
    } finally {
        await prisma.$disconnect()
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
        const contactNumber = formData.get("contactNumber") as string
        const email = formData.get("email") as string
        const operatingHours = formData.get("operatingHours") as string
        const status = formData.get("status") as "Active" | "Inactive" | "Maintenance"
        const capacity = Number.parseInt(formData.get("capacity") as string)
        const currentOccupancy = Number.parseInt(formData.get("currentOccupancy") as string)
        const specializations = (formData.get("specializations") as string)
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        const equipment = (formData.get("equipment") as string)
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e.length > 0)

        const department = await prisma.department.update({
            where: { id },
            data: {
                name,
                description,
                location,
                contactNumber,
                email,
                operatingHours,
                status,
                capacity,
                currentOccupancy,
                specializations,
                equipment,
            },
        })

        const departmentData: DepartmentData = {
            id: department.id,
            name: department.name,
            description: department.description,
            location: department.location,
            contactNumber: department.contactNumber || "",
            email: department.email || "",
            operatingHours: department.operatingHours,
            status: department.status as "Active" | "Inactive" | "Maintenance",
            capacity: department.capacity,
            currentOccupancy: department.currentOccupancy,
            specializations: department.specializations,
            equipment: department.equipment,
            createdAt: department.createdAt,
            updatedAt: department.updatedAt,
        }

        revalidatePath("/admin/departments")

        return { success: true, data: departmentData }
    } catch (error) {
        console.error("Error updating department:", error)
        return { success: false, error: "Failed to update department" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function deleteDepartmentAction(id: string): Promise<DepartmentResponse<boolean>> {
    try {
        await prisma.department.delete({
            where: { id },
        })

        revalidatePath("/admin/departments")

        return { success: true, data: true }
    } catch (error) {
        console.error("Error deleting department:", error)
        return { success: false, error: "Failed to delete department" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function getDepartmentStatsAction(): Promise<DepartmentResponse<DepartmentStats>> {
    try {
        const departments = await prisma.department.findMany()

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
    } finally {
        await prisma.$disconnect()
    }
}

export async function getDepartmentOptions(): Promise<string[]> {
    try {
        const departments = await prisma.department.findMany({
            select: { name: true },
            orderBy: { name: "asc" },
        })

        return departments.map((dept) => dept.name)
    } catch (error) {
        console.error("Error getting department options:", error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}