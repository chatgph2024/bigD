"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, Package, Settings, LayoutDashboard, Map, User } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <div className="hidden border-r bg-background md:block md:w-64 shrink-0">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex h-12 items-center border-b px-4 font-semibold">
          <span>Navigation</span>
        </div>
        <nav className="grid gap-1 px-2 text-sm font-medium">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/dashboard") &&
              !isActive("/dashboard/customers") &&
              !isActive("/dashboard/orders") &&
              !isActive("/dashboard/agents-tracking") &&
              !isActive("/dashboard/reports") &&
              !isActive("/dashboard/profile") &&
              !isActive("/dashboard/settings")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/customers"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/dashboard/customers")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Customers</span>
          </Link>
          <Link
            href="/dashboard/orders"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/dashboard/orders")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Orders</span>
          </Link>
          <Link
            href="/dashboard/agents-tracking"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/dashboard/agents-tracking")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Map className="h-4 w-4" />
            <span>Agent Tracking</span>
          </Link>
          <Link
            href="/dashboard/reports"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/dashboard/reports")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Reports</span>
          </Link>
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/dashboard/profile")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/dashboard/settings")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}

