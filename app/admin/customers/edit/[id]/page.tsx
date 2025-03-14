import { Suspense } from "react"
import { EditCustomerForm } from "@/components/admin/customers/edit-customer-form"
import { DashboardSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex-1 p-8 pt-6">
      <ErrorBoundary fallback={<div className="p-4">Something went wrong loading the form</div>}>
        <Suspense fallback={<DashboardSkeleton />}>
          <EditCustomerForm id={params.id} />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

