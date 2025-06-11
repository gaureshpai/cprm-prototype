import { NextResponse } from "next/server"
import { checkSchedulingConflict } from "@/lib/ot-service"

export async function POST(request: Request) {
    try {
        const { theaterId, scheduledTime, estimatedDuration } = await request.json()

        const hasConflict = await checkSchedulingConflict(theaterId, new Date(scheduledTime), estimatedDuration)

        return NextResponse.json({ hasConflict })
    } catch (error) {
        console.error("Error checking scheduling conflict:", error)
        return NextResponse.json({ error: "Failed to check conflict" }, { status: 500 })
    }
}
