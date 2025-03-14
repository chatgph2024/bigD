"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Settings, Store, ShoppingCart } from "lucide-react"

export function MobileAdminNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around">
        <Link
          href="/admin/dashboard"
          className={`flex flex-col items-center justify-center w-1/5 ${
            isActive("/admin/dashboard") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link
          href="/admin/inventory"
          className={`flex flex-col items-center justify-center w-1/5 ${
            isActive("/admin/inventory") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Store className="h-5 w-5" />
          <span className="text-xs mt-1">Inventory</span>
        </Link>
        <Link
          href="/admin/sales"
          className={`flex flex-col items-center justify-center w-1/5 ${
            isActive("/admin/sales") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-xs mt-1">Sales</span>
        </Link>
        <Link
          href="/admin/customers"
          className={`flex flex-col items-center justify-center w-1/5 ${
            isActive("/admin/customers") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Customers</span>
        </Link>
        <Link
          href="/admin/settings"
          className={`flex flex-col items-center justify-center w-1/5 ${
            isActive("/admin/settings") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </div>
  )
}

