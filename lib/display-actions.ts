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

// Get all displays
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

// Get display by ID
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

// Create display
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
                // Remove isActive since it doesn't exist in schema
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

// Update display
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
                // Remove isActive since it doesn't exist in schema
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

// Delete display
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

// Restart display
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

// Get display data for public display
export async function getDisplayDataAction(displayId: string) {
    try {
        // Get token queue data using actual field names
        const tokenQueue = await prisma.tokenQueue.findMany({
            where: {
                status: { in: ["waiting", "in_progress"] },
            },
            orderBy: [
                { timestamp: "asc" }, // Use timestamp instead of createdAt
            ],
            take: 10,
        })

        // Get departments using actual field names
        const departments = await prisma.department.findMany({
            orderBy: {
                department_name: "asc", // Use snake_case field name
            },
        })

        // Get active emergency alerts using actual field names
        const emergencyAlerts = await prisma.emergencyAlert.findMany({
            where: {
                status: "active",
            },
            orderBy: {
                timestamp: "desc", // Use timestamp instead of id
            },
        })

        // Get critical drug inventory using actual field names
        const drugInventory = await prisma.drugInventory.findMany({
            where: {
                status: "critical",
            },
            orderBy: {
                drug_name: "asc", // Use snake_case field name
            },
            take: 20,
        })

        // Map the data using actual field names from your database
        return {
            tokenQueue: tokenQueue.map((token) => ({
                token_id: token.id,
                patient_name: token.patient_name, // Use actual field name
                display_name: null, // Field doesn't exist, set to null
                status: token.status,
                department: token.dept_id, // Use actual field name
                priority: 0, // Field doesn't exist, set default
                estimated_time: `${token.estimated_wait} min`, // Convert number to string
            })),
            departments: departments.map((dept) => ({
                dept_id: dept.id,
                department_name: dept.department_name, // Use actual field name
                location: dept.location,
                current_tokens: dept.current_tokens, // Use actual field name
            })),
            emergencyAlerts: emergencyAlerts.map((alert) => ({
                id: alert.id,
                codeType: alert.code_type, // Use actual field name
                location: alert.department, // Use department as location
                message: `Emergency ${alert.code_type} in ${alert.department}`, // Create message from available fields
                priority: alert.severity === "high" ? 5 : 3, // Convert severity to priority
            })),
            drugInventory: drugInventory.map((drug) => ({
                drug_id: drug.id,
                drug_name: drug.drug_name, // Use actual field name
                current_stock: drug.stock_qty, // Use actual field name
                min_stock: drug.reorder_level, // Use actual field name
                status: drug.status,
            })),
        }
    } catch (error) {
        console.error("Error fetching display data:", error)
        // Return empty data on error
        return {
            tokenQueue: [],
            departments: [],
            emergencyAlerts: [],
            drugInventory: [],
        }
    }
}

// Seed displays
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

        const contentTypes = ["Token Queue", "Department Status", "Emergency Alerts", "Drug Inventory", "Mixed Dashboard"]

        // Check if displays already exist
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
                status: Math.random() > 0.3 ? "online" : Math.random() > 0.5 ? "offline" : "warning",
                uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
                lastUpdate: new Date(Date.now() - Math.random() * 3600000),
                // Remove isActive and config since they don't exist in schema
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

// Helper function to format display data
function formatDisplay(display: any): DisplayData {
    // Handle both snake_case and camelCase field names
    return {
        id: display.id,
        location: display.location,
        status: display.status,
        content: display.content,
        uptime: display.uptime,
        lastUpdate: display.lastUpdate.toISOString(),
        isActive: display.isActive ?? true, // Provide default if field doesn't exist
        config: display.config ?? {}, // Provide default if field doesn't exist
    }
}

// Calculate uptime
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