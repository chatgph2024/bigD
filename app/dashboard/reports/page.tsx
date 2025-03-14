import { Suspense } from "react"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"
import { ReportsSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function ReportsPage() {
  return (
    <main className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>
      <div className="mt-4">
        <ErrorBoundary fallback={<div className="p-4">Something went wrong loading reports</div>}>
          <Suspense fallback={<ReportsSkeleton />}>
            <ReportsDashboard />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
}

