"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Users,
  Package,
  Settings,
  LayoutDashboard,
  UserCog,
  ShieldCheck,
  FileText,
  Store,
  Map,
  Home,
  Clipboard,
  ShoppingCart,
} from "lucide-react"

export function AdminNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <div className="hidden border-r bg-background md:block md:w-64 shrink-0">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex h-12 items-center border-b px-4 font-semibold">
          <span>Admin Navigation</span>
        </div>
        <nav className="grid gap-1 px-2 text-sm font-medium">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/dashboard")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          {/* Management Tools Section */}
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-muted-foreground">Management Tools</div>

          <Link
            href="/admin/inventory"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/inventory")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Inventory Management</span>
          </Link>

          <Link
            href="/admin/agents"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/agents")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <UserCog className="h-4 w-4" />
            <span>Agent Management</span>
          </Link>

          <Link
            href="/admin/sales"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/sales")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Sales Management</span>
          </Link>

          <Link
            href="/admin/customers"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/customers")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Customer Management</span>
          </Link>

          {/* Other Resources Section */}
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-muted-foreground">Other Resources</div>

          <Link
            href="/admin/orders"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/orders")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Orders</span>
          </Link>

          <Link
            href="/admin/products"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/products")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Clipboard className="h-4 w-4" />
            <span>Products</span>
          </Link>

          <Link
            href="/admin/territories"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/territories")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Map className="h-4 w-4" />
            <span>Territory Mapping</span>
          </Link>

          <Link
            href="/admin/reports"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/reports")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Reports</span>
          </Link>

          {/* System Section */}
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-muted-foreground">System</div>

          <Link
            href="/admin/audit-logs"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/audit-logs")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Audit Logs</span>
          </Link>

          <Link
            href="/admin/permissions"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/permissions")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Permissions</span>
          </Link>

          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              isActive("/admin/settings")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>

          <div className="my-2 border-t"></div>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Home className="h-4 w-4" />
            <span>Back to Front-end</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}

