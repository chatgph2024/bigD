import { ModeToggle } from "@/components/mode-toggle"
import { AdminUserNav } from "@/components/admin/admin-user-nav"
import { Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Shield className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline-block">BIG DISTRIBUTION - Admin Panel</span>
          <span className="sm:hidden">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <ModeToggle />
          <AdminUserNav />
        </div>
      </div>
    </header>
  )
}

