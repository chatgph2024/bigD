import { Suspense } from "react"
import { AgentsManagement } from "@/components/admin/agents-management"
import { DashboardSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function AgentsManagementPage() {
  return (
    <main className="flex-1">
      <ErrorBoundary fallback={<div className="p-4">Something went wrong loading agents management</div>}>
        <Suspense fallback={<DashboardSkeleton />}>
          <AgentsManagement />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

