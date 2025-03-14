import { Suspense } from "react"
import { CustomersList } from "@/components/customers/customers-list"
import { CustomersSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function CustomersPage() {
  return (
    <main className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
      </div>
      <div className="mt-4">
        <ErrorBoundary fallback={<div className="p-4">Something went wrong loading customers</div>}>
          <Suspense fallback={<CustomersSkeleton />}>
            <CustomersList />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
}

