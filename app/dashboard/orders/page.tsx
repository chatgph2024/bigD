import { Suspense } from "react"
import { OrdersList } from "@/components/orders/orders-list"
import { OrdersSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function OrdersPage() {
  return (
    <main className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>
      <div className="mt-4">
        <ErrorBoundary fallback={<div className="p-4">Something went wrong loading orders</div>}>
          <Suspense fallback={<OrdersSkeleton />}>
            <OrdersList />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
}

