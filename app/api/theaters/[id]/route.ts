import { NextResponse } from "next/server"
import { updateTheater, deleteTheater } from "@/lib/ot-service"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const theaterData = await request.json()
        const result = await updateTheater(id, theaterData)
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error updating theater:", error)
        return NextResponse.json({ error: "Failed to update theater" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const result = await deleteTheater(id)
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error deleting theater:", error)
        return NextResponse.json({ error: "Failed to delete theater" }, { status: 500 })
    }
}