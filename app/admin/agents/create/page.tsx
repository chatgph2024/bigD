import { Suspense } from "react"
import { CreateAgentForm } from "@/components/admin/agents/create-agent-form"
import { DashboardSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function CreateAgentPage() {
  return (
    <main className="flex-1 p-8 pt-6">
      <ErrorBoundary fallback={<div className="p-4">Something went wrong loading the form</div>}>
        <Suspense fallback={<DashboardSkeleton />}>
          <CreateAgentForm />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

