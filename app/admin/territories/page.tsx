import { Suspense } from "react"
import { TerritoryMapping } from "@/components/admin/territories/territory-mapping"
import { DashboardSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function TerritoryMappingPage() {
  return (
    <main className="flex-1">
      <ErrorBoundary fallback={<div className="p-4">Something went wrong loading the map</div>}>
        <Suspense fallback={<DashboardSkeleton />}>
          <TerritoryMapping />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

