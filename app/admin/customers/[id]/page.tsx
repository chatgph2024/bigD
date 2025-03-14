import { Suspense } from "react"
import { CustomerDetails } from "@/components/admin/customers/customer-details"
import { DashboardSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex-1 p-8 pt-6">
      <ErrorBoundary fallback={<div className="p-4">Something went wrong loading customer details</div>}>
        <Suspense fallback={<DashboardSkeleton />}>
          <CustomerDetails id={params.id} />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

