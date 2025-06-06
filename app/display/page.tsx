import ErrorBoundary from "@/components/display/ErrorBoundary"
import DisplayScreen from "@/components/display/Display"
import { AlertTriangle } from "lucide-react"

export default function Page() {
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 border border-red-300 rounded-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-700">Display Error</h2>
          <p className="text-gray-600 mt-2">
            Failed to load display data. Please refresh or contact support.
          </p>
        </div>
      </div>
    }>
      <DisplayScreen />
    </ErrorBoundary>
  )
}