import { Suspense } from "react"
import { ProfileView } from "@/components/profile/profile-view"
import { ProfileSkeleton } from "@/components/skeletons"
import { ErrorBoundary } from "@/components/error-boundary"

export default function ProfilePage() {
  return (
    <main className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Agent Profile</h2>
      </div>
      <div className="mt-4">
        <ErrorBoundary fallback={<div className="p-4">Something went wrong loading profile</div>}>
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfileView />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
}

