import { Suspense } from "react"
import { CreateOrderForm } from "@/components/orders/create-order-form"
import { DashboardSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function CreateOrderPage() {
  return (
    <main className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create New Order</h2>
      </div>
      <div className="mt-4">
        <ErrorBoundary fallback={<div className="p-4">Something went wrong loading the form</div>}>
          <Suspense fallback={<DashboardSkeleton />}>
            <CreateOrderForm />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
}

