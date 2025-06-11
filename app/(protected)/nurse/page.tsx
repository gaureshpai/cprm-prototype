import { Suspense } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import NurseDashboardContent from "@/components/nurse-dashboard-content"
import { getNurseDashboardData } from "@/lib/nurse-service"

export default async function NurseDashboard() {
  const dashboardData = await getNurseDashboardData()

  return (
    <AuthGuard allowedRoles={["nurse", "admin"]} className="container mx-auto p-6 space-y-6">
      <Navbar />
      <Suspense fallback={<DashboardSkeleton />}>
        <NurseDashboardContent initialData={dashboardData} />
      </Suspense>
    </AuthGuard>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}