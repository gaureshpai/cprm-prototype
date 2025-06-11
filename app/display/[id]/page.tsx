import PublicDisplayPage from "@/components/PublicDisplayPage"
import { DisplayPageProps } from "@/lib/helpers"
import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"

export default async function DisplayPage({ params }: DisplayPageProps) {
  const { id } = await params
  const prisma = new PrismaClient()

  try {
    const display = await prisma.display.findUnique({
      where: { id },
    })

    if (!display) {
      console.log(`Display ${id} not found`)
      await prisma.$disconnect()
      notFound()
    }
    
    const displayData = {
      id: display.id,
      location: display.location,
      status: display.status,
      content: display.content,
      uptime: display.uptime,
      lastUpdate: display.lastUpdate.toISOString(),
      isActive: true, 
      config: {}, 
    }

    await prisma.$disconnect()

    return <PublicDisplayPage displayId={id} displayData={displayData} />
  } catch (error) {
    console.error(`Error loading display ${id}:`, error)
    
    try {
      const existingDisplay = await prisma.display.findUnique({
        where: { id },
      })

      if (existingDisplay) {
        await prisma.display.update({
          where: { id },
          data: {
            status: "warning",
            lastUpdate: new Date(),
          },
        })
      } else {
        console.log(`Display ${id} does not exist, cannot update status`)
      }
    } catch (updateError) {
      console.error(`Error updating display ${id} status:`, updateError)
    } finally {
      await prisma.$disconnect()
    }
    
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Display Error</h1>
          <p className="text-gray-700 mb-6">Display ID "{id}" could not be found or there was an error loading it.</p>
          <p className="text-sm text-gray-500 mb-4">Please check the display ID or contact the administrator.</p>
          <a
            href="/admin/displays"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Display Management
          </a>
        </div>
      </div>
    )
  }
}