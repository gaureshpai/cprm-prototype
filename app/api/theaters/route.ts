import { NextResponse } from "next/server"
import { createTheater, getOTStatus } from "@/lib/ot-service"

export async function GET() {
    try {
        const otData = await getOTStatus()
        return NextResponse.json(otData.theaters)
    } catch (error) {
        console.error("Error fetching theaters:", error)
        return NextResponse.json({ error: "Failed to fetch theaters" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const theaterData = await request.json()
        const result = await createTheater(theaterData)
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error creating theater:", error)
        return NextResponse.json({ error: "Failed to create theater" }, { status: 500 })
    }
}
