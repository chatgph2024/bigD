import { Suspense } from "react"
import { AgentsMap } from "@/components/agents/agents-map"
import { AgentsSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function AgentsTrackingPage() {
  return (
    <main className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Agents Tracking</h2>
      </div>
      <div className="mt-4">
        <ErrorBoundary fallback={<div className="p-4">Something went wrong loading agent tracking</div>}>
          <Suspense fallback={<AgentsSkeleton />}>
            <AgentsMap />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
}

