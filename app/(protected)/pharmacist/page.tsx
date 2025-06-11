import { Suspense } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import {
  getPharmacyStatisticsAction,
  getTopMedicationsAction,
  getPrescriptionTrendsAction,
} from "@/lib/pharmacist-actions"
import PharmacyDashboardClient from "@/components/pharmacy-dashboard-client"

export default async function PharmacistDashboard() {
  const statistics = await getPharmacyStatisticsAction()
  const topMedications = await getTopMedicationsAction()
  const prescriptionTrends = await getPrescriptionTrendsAction()

  return (
    <AuthGuard allowedRoles={["pharmacist"]} className="container mx-auto p-6 space-y-6">
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
              <p className="text-gray-500">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <Suspense fallback={<div>Loading statistics...</div>}>
            <PharmacyDashboardClient
              statistics={statistics}
              topMedications={topMedications}
              prescriptionTrends={prescriptionTrends}
            />
          </Suspense>
        </main>
      </div>
    </AuthGuard>
  )
}