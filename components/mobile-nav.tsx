"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Package, User, Settings } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center w-1/5 ${
            isActive("/dashboard") &&
            !isActive("/dashboard/customers") &&
            !isActive("/dashboard/orders") &&
            !isActive("/dashboard/profile") &&
            !isActive("/dashboard/settings")
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link
          href="/dashboard/customers"
          className={`flex flex-col items-center justify-center w-1/5 ${
            isActive("/dashboard/customers") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Customers</span>
        </Link>
        <Link
          href="/dashboard/orders"
          className={`flex flex-col items-center justify-center w-1/5 ${
            isActive("/dashboard/orders") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Package className="h-5 w-5" />
          <span className="text-xs mt-1">Orders</span>
        </Link>
        <Link
          href="/dashboard/profile"
          className={`flex flex-col items-center justify-center w-1/5 ${
            isActive("/dashboard/profile") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
        <Link
          href="/dashboard/settings"
          className={`flex flex-col items-center justify-center w-1/5 ${
            isActive("/dashboard/settings") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </div>
  )
}

