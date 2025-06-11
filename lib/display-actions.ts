"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export interface DisplayData {
    id: string
    location: string
    status: string
    content: string
    uptime: string
    lastUpdate: string
    isActive: boolean
    config?: any
}

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

export interface ActionResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export async function getAllDisplaysAction(): Promise<ActionResponse<DisplayData[]>> {
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
    }
}

export async function getDisplayByIdAction(id: string): Promise<ActionResponse<DisplayData>> {
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
    }
}

export async function createDisplayAction(formData: FormData): Promise<ActionResponse<DisplayData>> {
    try {
        const location = formData.get("location") as string
        const content = (formData.get("content") as string) || "Token Queue"
        const status = (formData.get("status") as string) || "offline"

        if (!location) {
            return { success: false, error: "Location is required" }
        }

        const display = await prisma.display.create({
            data: {
                location,
                content,
                status,
                uptime: "0m",
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
    }
}

export async function updateDisplayAction(id: string, formData: FormData): Promise<ActionResponse<DisplayData>> {
    try {
        const location = formData.get("location") as string
        const content = formData.get("content") as string
        const status = formData.get("status") as string

        const display = await prisma.display.update({
            where: { id },
            data: {
                location,
                content,
                status,
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
    }
}

export async function restartDisplayAction(id: string): Promise<ActionResponse<DisplayData>> {
    try {
        const display = await prisma.display.update({
            where: { id },
            data: {
                status: "online",
                uptime: "0m",
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
    }
}

export async function getDisplayDataAction(displayId: string) {
    try {
        
        const display = await prisma.display.findUnique({
            where: { id: displayId },
        })

        if (!display) {
            console.log("Display not found:", displayId)
            return {
                tokenQueue: [] as Array<{
                    token_id: string
                    patient_name: string
                    display_name?: string | null
                    status: string
                    department: string
                    priority: number
                    estimated_time?: string | null
                }>,
                departments: [] as Array<{
                    dept_id: string
                    department_name: string
                    location: string
                    current_tokens: number
                }>,
                emergencyAlerts: [] as Array<{
                    id: string
                    codeType: string
                    location: string
                    message: string
                    priority: number
                }>,
                drugInventory: [] as Array<{
                    drug_id: string
                    drug_name: string
                    current_stock: number
                    min_stock: number
                    status: string
                }>,
                contentType: "Mixed Dashboard",
            }
        }

        console.log(`Fetching data for display: ${displayId}, content type: ${display.content}`)
        
        const data = {
            tokenQueue: [] as Array<{
                token_id: string
                patient_name: string
                display_name?: string | null
                status: string
                department: string
                priority: number
                estimated_time?: string | null
            }>,
            departments: [] as Array<{
                dept_id: string
                department_name: string
                location: string
                current_tokens: number
            }>,
            emergencyAlerts: [] as Array<{
                id: string
                codeType: string
                location: string
                message: string
                priority: number
            }>,
            drugInventory: [] as Array<{
                drug_id: string
                drug_name: string
                current_stock: number
                min_stock: number
                status: string
            }>,
            contentType: display.content,
        }
        
        const shouldFetchTokenQueue = display.content === "Token Queue" || display.content === "Mixed Dashboard"
        const shouldFetchDepartments = display.content === "Department Status" || display.content === "Mixed Dashboard"
        const shouldFetchEmergencyAlerts = display.content === "Emergency Alerts" || display.content === "Mixed Dashboard"
        const shouldFetchDrugInventory = display.content === "Drug Inventory" || display.content === "Mixed Dashboard"
        
        if (shouldFetchTokenQueue) {
            try {
                const tokenQueue = await prisma.tokenQueue.findMany({
                    where: {
                        status: { in: ["waiting", "in_progress"] },
                    },
                    orderBy: [
                        { createdAt: "asc" }, 
                    ],
                    take: 10,
                })

                data.tokenQueue = tokenQueue.map((token) => ({
                    token_id: token.tokenId,
                    patient_name: token.patientName, 
                    display_name: token.displayName,
                    status: token.status,
                    department: token.department, 
                    priority: token.priority,
                    estimated_time: token.estimatedTime, 
                }))
            } catch (error) {
                console.log("Token queue error:", error instanceof Error ? error.message : String(error))
            }
        }
        
        if (shouldFetchDepartments) {
            try {
                const departments = await prisma.department.findMany({
                    orderBy: {
                        departmentName: "asc", 
                    },
                })

                data.departments = departments.map((dept) => ({
                    dept_id: dept.id,
                    department_name: dept.departmentName, 
                    location: dept.location,
                    current_tokens: dept.currentTokens, 
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
                        status: "critical",
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

        console.log("Final data summary:")
        console.log(`- Content Type: ${data.contentType}`)
        console.log(`- Token Queue: ${data.tokenQueue.length} items`)
        console.log(`- Departments: ${data.departments.length} items`)
        console.log(`- Emergency Alerts: ${data.emergencyAlerts.length} items`)
        console.log(`- Drug Inventory: ${data.drugInventory.length} items`)

        return data
    } catch (error) {
        console.error("Error fetching display data:", error)

        return {
            tokenQueue: [] as Array<{
                token_id: string
                patient_name: string
                display_name?: string | null
                status: string
                department: string
                priority: number
                estimated_time?: string | null
            }>,
            departments: [] as Array<{
                dept_id: string
                department_name: string
                location: string
                current_tokens: number
            }>,
            emergencyAlerts: [] as Array<{
                id: string
                codeType: string
                location: string
                message: string
                priority: number
            }>,
            drugInventory: [] as Array<{
                drug_id: string
                drug_name: string
                current_stock: number
                min_stock: number
                status: string
            }>,
            contentType: "Mixed Dashboard",
        }
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

        const contentTypes = ["Token Queue", "Department Status", "Emergency Alerts", "Drug Inventory", "Mixed Dashboard", "Patient Dashboard", "Staff Dashboard"]

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

            displaysToCreate.push({
                location,
                content: contentTypes[Math.floor(Math.random() * contentTypes.length)],
                status:"offline",
                uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
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
    }
}

function formatDisplay(display: any): DisplayData {
    return {
        id: display.id,
        location: display.location,
        status: display.status,
        content: display.content,
        uptime: display.uptime,
        lastUpdate: display.lastUpdate.toISOString(),
        isActive: display.isActive ?? true,
        config: display.config ?? {},
    }
}

export async function calculateUptime(lastUpdate: Date): Promise<string> {
    const now = new Date()
    const diff = now.getTime() - lastUpdate.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
}
