"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminNav } from "@/components/admin/admin-nav"
import { MobileAdminNav } from "@/components/admin/mobile-admin-nav"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const router = useRouter()

  // In a real app, you would check if the user is authenticated and has admin privileges
  useEffect(() => {
    // Simulate checking admin status
    const checkAdminStatus = async () => {
      try {
        // In a real app, you would check from your auth context or make an API call
        // For demo purposes, we'll just set isAdmin to true after a short delay
        setTimeout(() => {
          // Check if we're on login or signup pages
          const isAuthPage =
            window.location.pathname.includes("/admin/login") || window.location.pathname.includes("/admin/signup")

          // If we're on an auth page, don't redirect
          if (isAuthPage) {
            setIsAdmin(true)
            return
          }

          // For demo purposes, we'll just set isAdmin to true
          setIsAdmin(true)

          // If you want to simulate a non-admin user, uncomment the following:
          // setIsAdmin(false);
          // router.push("/admin/login");
        }, 1000)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
        router.push("/admin/login")
      }
    }

    checkAdminStatus()
  }, [router])

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Check if we're on login or signup pages
  const isAuthPage =
    typeof window !== "undefined" &&
    (window.location.pathname.includes("/admin/login") || window.location.pathname.includes("/admin/signup"))

  // If we're on an auth page, just render the children without the admin layout
  if (isAuthPage) {
    return <>{children}</>
  }

  // Otherwise, render the admin layout
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AdminHeader />
      <div className="flex flex-1 w-full">
        <AdminNav />
        <div className="flex-1 w-full overflow-auto">{children}</div>
      </div>
      <MobileAdminNav />
    </div>
  )
}

