"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import type { DisplayData } from "@/lib/helpers"

export interface DisplayCreateData {
    location: string
    content?: string
    status?: string
    config?: any
}

export interface DisplayUpdateData {
    location?: string
    content?: string
    status?: string
    config?: any
    isActive?: boolean
}

interface DisplayConfig {
    departmentId?: string
    [key: string]: any
}

export interface ActionResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function getAllDisplaysAction(): Promise<ActionResponse<any[]>> {
    try {
        const displays = await prisma.display.findMany({
            orderBy: { lastUpdate: "desc" },
        })

        const formattedDisplays = displays.map(formatDisplay)

        return {
            success: true,
            data: formattedDisplays,
        }
    } catch (error) {
        console.error("Error fetching displays:", error)
        return { success: false, error: "Failed to fetch displays" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function getDisplayByIdAction(id: string): Promise<ActionResponse<any>> {
    try {
        const display = await prisma.display.findUnique({
            where: { id },
        })

        if (!display) {
            return { success: false, error: "Display not found" }
        }

        return {
            success: true,
            data: formatDisplay(display),
        }
    } catch (error) {
        console.error("Error fetching display:", error)
        return { success: false, error: "Failed to fetch display" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function createDisplayAction(formData: FormData): Promise<ActionResponse<any>> {
    try {
        const location = formData.get("location") as string
        const content = (formData.get("content") as string) || "Token Queue"
        const status = (formData.get("status") as string) || "offline"
        const configStr = formData.get("config") as string

        if (!location) {
            return { success: false, error: "Location is required" }
        }

        let config = {}
        if (configStr) {
            try {
                config = JSON.parse(configStr)
            } catch (e) {
                console.warn("Invalid config JSON:", configStr)
            }
        }

        const display = await prisma.display.create({
            data: {
                location,
                content,
                status,
                config,
                lastUpdate: new Date(),
            },
        })

        revalidatePath("/admin/displays")

        return {
            success: true,
            data: formatDisplay(display),
        }
    } catch (error) {
        console.error("Error creating display:", error)
        return { success: false, error: "Failed to create display" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function updateDisplayAction(id: string, formData: FormData): Promise<ActionResponse<any>> {
    try {
        const location = formData.get("location") as string
        const content = formData.get("content") as string
        const status = formData.get("status") as string
        const configStr = formData.get("config") as string

        let config = {}
        if (configStr) {
            try {
                config = JSON.parse(configStr)
            } catch (e) {
                console.warn("Invalid config JSON:", configStr)
            }
        }

        const display = await prisma.display.update({
            where: { id },
            data: {
                location,
                content,
                status,
                config,
                lastUpdate: new Date(),
            },
        })

        revalidatePath("/admin/displays")
        revalidatePath(`/display/${id}`)

        return {
            success: true,
            data: formatDisplay(display),
        }
    } catch (error) {
        console.error("Error updating display:", error)
        return { success: false, error: "Failed to update display" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function deleteDisplayAction(id: string): Promise<ActionResponse<boolean>> {
    try {
        await prisma.display.delete({
            where: { id },
        })

        revalidatePath("/admin/displays")

        return {
            success: true,
            data: true,
        }
    } catch (error) {
        console.error("Error deleting display:", error)
        return { success: false, error: "Failed to delete display" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function restartDisplayAction(id: string): Promise<ActionResponse<any>> {
    try {
        const display = await prisma.display.update({
            where: { id },
            data: {
                status: "online",
                lastUpdate: new Date(),
            },
        })

        revalidatePath("/admin/displays")
        revalidatePath(`/display/${id}`)

        return {
            success: true,
            data: formatDisplay(display),
        }
    } catch (error) {
        console.error("Error restarting display:", error)
        return { success: false, error: "Failed to restart display" }
    } finally {
        await prisma.$disconnect()
    }
}

export async function getDisplayDataAction(displayId: string): Promise<DisplayData> {
    try {
        const display = await prisma.display.findUnique({
            where: { id: displayId },
        })

        if (!display) {
            console.log("Display not found:", displayId)
            return getEmptyDisplayData()
        }

        const data: DisplayData = {
            tokenQueue: [],
            departments: [],
            emergencyAlerts: [],
            drugInventory: [],
            bloodBank: [],
            contentType: display.content,
        }

        const shouldFetchTokenQueue =
            display.content === "Token Queue" ||
            display.content === "Department Token Queue" ||
            display.content === "Mixed Dashboard" ||
            display.content === "Patient Dashboard" ||
            display.content === "Staff Dashboard"
        const shouldFetchDepartments =
            display.content === "Department Status" ||
            display.content === "Mixed Dashboard" ||
            display.content === "Patient Dashboard" ||
            display.content === "Staff Dashboard"
        const shouldFetchEmergencyAlerts = display.content === "Emergency Alerts" || display.content === "Mixed Dashboard"
        const shouldFetchDrugInventory =
            display.content === "Drug Inventory" ||
            display.content === "Mixed Dashboard" ||
            display.content === "Staff Dashboard"
        const shouldFetchBloodBank =
            display.content === "Blood Bank" || display.content === "Mixed Dashboard" || display.content === "Staff Dashboard"

        if (shouldFetchTokenQueue) {
            try {
                const whereClause: any = {
                    status: { in: ["Waiting", "Called", "In Progress"] },
                }

                if (
                    display.content === "Department Token Queue" &&
                    display.config &&
                    typeof display.config === "object" &&
                    "departmentId" in display.config
                ) {
                    const config = display.config as { departmentId: string }
                    whereClause.departmentId = config.departmentId
                }

                const tokenQueue = await prisma.tokenQueue.findMany({
                    where: whereClause,
                    include: {
                        patient: true,
                        department: true,
                    },
                    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
                    take: display.content === "Department Token Queue" ? 4 : 10,
                })

                data.tokenQueue = tokenQueue.map((token) => ({
                    token_id: token.tokenNumber,
                    patient_name: token.patientName,
                    display_name: token.displayName,
                    status: token.status.toLowerCase(),
                    department: token.departmentName,
                    priority: token.priority === "Emergency" ? 3 : token.priority === "Urgent" ? 2 : 1,
                    estimated_time: `${token.estimatedWaitTime} min`,
                }))
            } catch (error) {
                console.log("Token queue error:", error instanceof Error ? error.message : String(error))
            }
        }

        if (shouldFetchDepartments) {
            try {
                const departments = await prisma.department.findMany({
                    include: {
                        tokenQueue: {
                            where: {
                                status: { in: ["Waiting", "Called", "In Progress"] },
                            },
                        },
                    },
                    orderBy: {
                        name: "asc",
                    },
                })

                data.departments = departments.map((dept) => ({
                    dept_id: dept.id,
                    department_name: dept.name,
                    location: dept.location,
                    current_tokens: dept.tokenQueue.length,
                }))
            } catch (error) {
                console.log("Departments error:", error instanceof Error ? error.message : String(error))
            }
        }

        if (shouldFetchEmergencyAlerts) {
            try {
                const emergencyAlerts = await prisma.emergencyAlert.findMany({
                    where: {
                        status: "active",
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                })

                data.emergencyAlerts = emergencyAlerts.map((alert) => ({
                    id: alert.id,
                    codeType: alert.codeType,
                    location: alert.location,
                    message: alert.message || `Emergency ${alert.codeType} in ${alert.location}`,
                    priority: alert.priority,
                }))
            } catch (error) {
                console.log("Emergency alerts error:", error instanceof Error ? error.message : String(error))
            }
        }

        if (shouldFetchDrugInventory) {
            try {
                const drugInventory = await prisma.drugInventory.findMany({
                    where: {
                        OR: [{ status: "critical" }, { status: "out_of_stock" }, { status: "low" }],
                    },
                    orderBy: {
                        drugName: "asc",
                    },
                    take: 20,
                })

                data.drugInventory = drugInventory.map((drug) => ({
                    drug_id: drug.id,
                    drug_name: drug.drugName,
                    current_stock: drug.currentStock,
                    min_stock: drug.minStock,
                    status: drug.status,
                }))
            } catch (error) {
                console.log("Drug inventory error:", error instanceof Error ? error.message : String(error))
            }
        }

        if (shouldFetchBloodBank) {
            try {
                const bloodBank = await prisma.bloodBank.findMany({
                    where: {
                        OR: [{ status: "Critical" }, { status: "Low" }],
                    },
                    orderBy: {
                        bloodType: "asc",
                    },
                })

                data.bloodBank = bloodBank.map((blood) => ({
                    blood_id: blood.id,
                    blood_type: blood.bloodType,
                    units_available: blood.unitsAvailable,
                    critical_level: blood.criticalLevel,
                    status: blood.status,
                    expiry_date: blood.expiryDate.toISOString().split("T")[0],
                }))
            } catch (error) {
                console.log("Blood bank error:", error instanceof Error ? error.message : String(error))
            }
        }

        return data
    } catch (error) {
        console.error("Error fetching display data:", error)
        return getEmptyDisplayData()
    } finally {
        await prisma.$disconnect()
    }
}

function getEmptyDisplayData(): DisplayData {
    return {
        tokenQueue: [],
        departments: [],
        emergencyAlerts: [],
        drugInventory: [],
        bloodBank: [],
        contentType: "Mixed Dashboard",
    }
}

export async function seedDisplaysAction(): Promise<ActionResponse<boolean>> {
    try {
        const locations = [
            "Main Lobby",
            "Emergency Ward",
            "ICU Wing A",
            "ICU Wing B",
            "OT Complex 1",
            "OT Complex 2",
            "Cardiology Dept",
            "Neurology Dept",
            "Pediatrics Ward",
            "Maternity Ward",
            "Pharmacy Main",
            "Pharmacy Emergency",
            "Blood Bank",
            "Laboratory",
            "Radiology",
            "Cafeteria",
            "Admin Office",
            "Reception Desk",
            "Waiting Area A",
            "Waiting Area B",
            "Corridor 1A",
            "Corridor 1B",
            "Corridor 2A",
            "Corridor 2B",
            "Elevator Bank 1",
            "Elevator Bank 2",
            "Parking Entrance",
        ]

        const contentTypes = [
            "Token Queue",
            "Department Status",
            "Emergency Alerts",
            "Drug Inventory",
            "Blood Bank",
            "Mixed Dashboard",
            "Patient Dashboard",
            "Staff Dashboard",
            "Department Token Queue",
        ]

        const existingDisplays = await prisma.display.count()
        if (existingDisplays > 0) {
            return { success: false, error: "Displays already exist" }
        }

        const displaysToCreate = []
        for (let i = 0; i < 73; i++) {
            const location =
                i < locations.length
                    ? locations[i]
                    : `Ward ${Math.ceil((i - locations.length + 1) / 4)} - Room ${((i - locations.length) % 4) + 1}`

            const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)]
            let config = {}

            if (contentType === "Department Token Queue") {
                const departments = await prisma.department.findMany({ take: 5 })
                if (departments.length > 0) {
                    config = { departmentId: departments[Math.floor(Math.random() * departments.length)].id }
                }
            }

            displaysToCreate.push({
                location,
                content: contentType,
                status: "offline",
                config,
                lastUpdate: new Date(Date.now() - Math.random() * 3600000),
            })
        }

        await prisma.display.createMany({
            data: displaysToCreate,
        })

        revalidatePath("/admin/displays")

        return {
            success: true,
            data: true,
        }
    } catch (error) {
        console.error("Error seeding displays:", error)
        return { success: false, error: "Failed to seed displays" }
    } finally {
        await prisma.$disconnect()
    }
}

function formatDisplay(display: any): any {
    return {
        id: display.id,
        location: display.location,
        status: display.status,
        content: display.content,
        lastUpdate: display.lastUpdate.toISOString(),
        isActive: display.isActive ?? true,
        config: display.config ?? {},
    }
}