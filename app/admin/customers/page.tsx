import { Suspense } from "react"
import { AdminCustomers } from "@/components/admin/customers/admin-customers"
import { DashboardSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function AdminCustomersPage() {
  return (
    <main className="flex-1">
      <ErrorBoundary fallback={<div className="p-4">Something went wrong loading customers</div>}>
        <Suspense fallback={<DashboardSkeleton />}>
          <AdminCustomers />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

