import { Suspense } from "react"
import { AdminSettingsForm } from "@/components/admin/settings/admin-settings-form"
import { SettingsSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function AdminSettingsPage() {
  return (
    <main className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Settings</h2>
      </div>
      <div className="mt-4">
        <ErrorBoundary fallback={<div className="p-4">Something went wrong loading settings</div>}>
          <Suspense fallback={<SettingsSkeleton />}>
            <AdminSettingsForm />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
}

