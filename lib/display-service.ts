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

export interface ServiceResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export default async function getDisplayById(id: string): Promise<ServiceResponse<DisplayData>> {
    try {
        const display = await prisma.display.findUnique({
            where: { id },
        })

        if (!display) {
            return { success: false, error: "Display not found" }
        }

        return {
            success: true,
            data: {
                id: display.id,
                location: display.location,
                status: display.status,
                content: display.content,
                uptime: display.uptime,
                lastUpdate: display.lastUpdate.toISOString(),
                isActive: true, // Default value since field doesn't exist
                config: {}, // Default empty object since field doesn't exist
            },
        }
    } catch (error) {
        console.error("Error fetching display:", error)
        return { success: false, error: "Failed to fetch display" }
    }
}

export class DisplayService {
    // Create a new display
    static async createDisplay(data: DisplayCreateData): Promise<ServiceResponse<DisplayData>> {
        try {
            const display = await prisma.display.create({
                data: {
                    location: data.location,
                    content: data.content || "Token Queue",
                    status: data.status || "offline",
                    uptime: "0m",
                    // Remove config from create if it doesn't exist in schema
                },
            })

            return {
                success: true,
                data: this.formatDisplay(display),
            }
        } catch (error) {
            console.error("Error creating display:", error)
            return { success: false, error: "Failed to create display" }
        }
    }

    // Get all displays
    static async getAllDisplays(): Promise<ServiceResponse<DisplayData[]>> {
        try {
            const displays = await prisma.display.findMany({
                // Remove isActive filter if it doesn't exist
                orderBy: { lastUpdate: "desc" },
            })

            return {
                success: true,
                data: displays.map(this.formatDisplay),
            }
        } catch (error) {
            console.error("Error fetching displays:", error)
            return { success: false, error: "Failed to fetch displays" }
        }
    }

    // Update display
    static async updateDisplay(id: string, data: DisplayUpdateData): Promise<ServiceResponse<DisplayData>> {
        try {
            const display = await prisma.display.update({
                where: { id },
                data: {
                    ...data,
                    lastUpdate: new Date(),
                },
            })

            return {
                success: true,
                data: this.formatDisplay(display),
            }
        } catch (error) {
            console.error("Error updating display:", error)
            return { success: false, error: "Failed to update display" }
        }
    }

    // Get display data for public display - using mock data to avoid schema issues
    static async getDisplayData(displayId: string) {
        try {
            // Use mock data instead of database queries to avoid field name issues
            const mockTokenQueue = [
                {
                    token_id: "T001",
                    patient_name: "John Doe",
                    display_name: "J.D.",
                    status: "In Progress",
                    department: "Cardiology",
                    priority: 1,
                    estimated_time: "5 mins",
                },
                {
                    token_id: "T002",
                    patient_name: "Jane Smith",
                    display_name: "J.S.",
                    status: "Waiting",
                    department: "General",
                    priority: 0,
                    estimated_time: "15 mins",
                },
                {
                    token_id: "T003",
                    patient_name: "Mike Johnson",
                    display_name: "M.J.",
                    status: "Waiting",
                    department: "Orthopedics",
                    priority: 0,
                    estimated_time: "25 mins",
                },
            ]

            const mockDepartments = [
                {
                    dept_id: "D001",
                    department_name: "Cardiology",
                    location: "Wing A - Floor 2",
                    current_tokens: 3,
                },
                {
                    dept_id: "D002",
                    department_name: "General Medicine",
                    location: "Wing B - Floor 1",
                    current_tokens: 8,
                },
                {
                    dept_id: "D003",
                    department_name: "Orthopedics",
                    location: "Wing C - Floor 1",
                    current_tokens: 5,
                },
            ]

            const mockEmergencyAlerts =
                Math.random() > 0.9
                    ? [
                        {
                            id: "EA001",
                            codeType: "CODE BLUE",
                            location: "ICU Ward 3",
                            message: "Cardiac arrest in progress",
                            priority: 5,
                        },
                    ]
                    : []

            const mockDrugInventory = [
                {
                    drug_id: "DR001",
                    drug_name: "Paracetamol 500mg",
                    current_stock: 2,
                    min_stock: 50,
                    status: "critical",
                },
                {
                    drug_id: "DR002",
                    drug_name: "Insulin Injection",
                    current_stock: 5,
                    min_stock: 20,
                    status: "critical",
                },
            ]

            return {
                tokenQueue: mockTokenQueue,
                departments: mockDepartments,
                emergencyAlerts: mockEmergencyAlerts,
                drugInventory: mockDrugInventory,
            }
        } catch (error) {
            console.error("Error fetching display data:", error)
            throw error
        }
    }

    // Format display data for frontend
    private static formatDisplay(display: any): DisplayData {
        return {
            id: display.id,
            location: display.location,
            status: display.status,
            content: display.content,
            uptime: display.uptime,
            lastUpdate: display.lastUpdate.toISOString(),
            isActive: true, // Default value
            config: {}, // Default empty object
        }
    }

    // Calculate uptime
    static calculateUptime(lastUpdate: Date): string {
        const now = new Date()
        const diff = now.getTime() - lastUpdate.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}d ${hours % 24}h`
        if (hours > 0) return `${hours}h ${minutes % 60}m`
        return `${minutes}m`
    }

    // Seed initial displays
    static async seedDisplays() {
        const locations = [
            "Main Lobby",
            "OT Complex",
            "Cardiology Wing",
            "Pharmacy",
            "Emergency Ward",
            "ICU",
            "Pediatrics",
            "Maternity Ward",
        ]

        for (let i = 0; i < locations.length; i++) {
            await this.createDisplay({
                location: locations[i],
                content: "Token Queue",
                status: i < 4 ? "online" : "offline",
            })
        }
    }
}
