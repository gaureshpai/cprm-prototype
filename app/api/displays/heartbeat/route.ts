import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { displayId, status = "online", timestamp } = body

        if (!displayId) {
            return NextResponse.json({ error: "Display ID is required" }, { status: 400 })
        }

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