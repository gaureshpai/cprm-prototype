import { NextResponse } from "next/server"
import prisma  from "@/lib/prisma"

export async function GET() {
    try {
        const patients = await prisma.patient.findMany({
            where: { status: "Active" },
            select: {
                id: true,
                name: true,
                condition: true,
                age: true,
                gender: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        })

        return NextResponse.json(patients)
    } catch (error) {
        console.error("Error fetching patients:", error)
        return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
    }
}
