import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { displayId, status = "online", timestamp } = body

        if (!displayId) {
            return NextResponse.json({ error: "Display ID is required" }, { status: 400 })
        }

        console.log(`Heartbeat received for ${displayId}: ${status} at ${timestamp || new Date().toISOString()}`)

        const updatedDisplay = await prisma.display.update({
            where: { id: displayId },
            data: {
                status: status,
                lastUpdate: new Date(),
            },
        })

        await prisma.$disconnect()

        return NextResponse.json({
            success: true,
            displayId,
            status: updatedDisplay.status,
            timestamp: updatedDisplay.lastUpdate,
        })
    } catch (error) {
        console.error("Error in display heartbeat:", error)
        await prisma.$disconnect()
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}