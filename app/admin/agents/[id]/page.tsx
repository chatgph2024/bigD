import { Suspense } from "react"
import { AgentDetails } from "@/components/admin/agents/agent-details"
import { DashboardSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function AgentDetailsPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex-1 p-8 pt-6">
      <ErrorBoundary fallback={<div className="p-4">Something went wrong loading agent details</div>}>
        <Suspense fallback={<DashboardSkeleton />}>
          <AgentDetails id={params.id} />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

