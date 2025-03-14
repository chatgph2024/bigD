import { Suspense } from "react"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { DashboardSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function AdminDashboardPage() {
  return (
    <main className="flex-1">
      <ErrorBoundary fallback={<div className="p-4">Something went wrong with the admin dashboard</div>}>
        <Suspense fallback={<DashboardSkeleton />}>
          <AdminDashboard />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

