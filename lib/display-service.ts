import { PrismaClient } from "@prisma/client"

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

export interface ServiceResponse<T> {
    success: boolean
    data?: T
    error?: string
}

// Remove isActive and config from all display mapping functions
function formatDisplay(display: any): DisplayData {
    return {
        id: display.id,
        location: display.location,
        status: display.status,
        content: display.content,
        uptime: display.uptime,
        lastUpdate: display.lastUpdate.toISOString(),
        isActive: true, // Always return true since field doesn't exist
        config: {}, // Always return empty object since field doesn't exist
    }
}

// Update getAllDisplays function
async function getAllDisplays(): Promise<ServiceResponse<DisplayData[]>> {
    try {
        const displays = await prisma.display.findMany()

        const displayData: DisplayData[] = displays.map(formatDisplay)

        return { success: true, data: displayData }
    } catch (error) {
        console.error("Error fetching displays:", error)
        return { success: false, error: "Failed to fetch displays" }
    }
}

async function getDisplayById(id: string): Promise<ServiceResponse<DisplayData>> {
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

// Update createDisplay function to not include isActive and config
async function createDisplay(data: {
    location: string
    content: string
    status: string
    config?: any
}): Promise<ServiceResponse<DisplayData>> {
    try {
        const display = await prisma.display.create({
            data: {
                location: data.location,
                content: data.content,
                status: data.status,
                uptime: "0m",
                lastUpdate: new Date(),
                // Remove isActive and config since they don't exist in schema
            },
        })

        return { success: true, data: formatDisplay(display) }
    } catch (error) {
        console.error("Error creating display:", error)
        return { success: false, error: "Failed to create display" }
    }
}

// Update updateDisplay function to not include isActive and config
async function updateDisplay(
    id: string,
    data: {
        location?: string
        content?: string
        status?: string
        config?: any
        isActive?: boolean
    },
): Promise<ServiceResponse<DisplayData>> {
    try {
        const display = await prisma.display.update({
            where: { id },
            data: {
                location: data.location,
                content: data.content,
                status: data.status,
                lastUpdate: new Date(),
                // Remove isActive and config since they don't exist in schema
            },
        })

        return { success: true, data: formatDisplay(display) }
    } catch (error) {
        console.error("Error updating display:", error)
        return { success: false, error: "Failed to update display" }
    }
}

async function deleteDisplay(id: string): Promise<ServiceResponse<boolean>> {
    try {
        await prisma.display.delete({
            where: { id },
        })
        return { success: true, data: true }
    } catch (error) {
        console.error("Error deleting display:", error)
        return { success: false, error: "Failed to delete display" }
    }
}

async function restartDisplay(id: string): Promise<ServiceResponse<DisplayData>> {
    try {
        const display = await prisma.display.update({
            where: { id },
            data: {
                status: "online",
                uptime: "0m",
                lastUpdate: new Date(),
            },
        })

        return { success: true, data: formatDisplay(display) }
    } catch (error) {
        console.error("Error restarting display:", error)
        return { success: false, error: "Failed to restart display" }
    }
}

async function getDisplayData(displayId: string) {
    return { message: `Data for display ${displayId}` }
}

// Update seedDisplays function to not include isActive and config
async function seedDisplays(): Promise<ServiceResponse<boolean>> {
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

        return { success: true, data: true }
    } catch (error) {
        console.error("Error seeding displays:", error)
        return { success: false, error: "Failed to seed displays" }
    }
}

export const DisplayService = {
    getAllDisplays,
    createDisplay,
    updateDisplay,
    deleteDisplay,
    restartDisplay,
    getDisplayData,
    seedDisplays,
}

export default getDisplayById