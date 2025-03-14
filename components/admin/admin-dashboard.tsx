"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminOverview } from "@/components/admin/admin-overview"
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity"
import { AdminSystemStatus } from "@/components/admin/admin-system-status"
import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, MapIcon, UserCog, Users, Package, Store } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalAgents: 0,
    totalProducts: 0,
    totalTerritories: 0,
    isLoading: true,
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch orders
        const ordersRef = ref(db, "orders")
        const ordersSnapshot = await get(ordersRef)
        const ordersData = ordersSnapshot.exists() ? ordersSnapshot.val() : {}
        const orders = Object.values(ordersData || {})

        // Fetch customers
        const customersRef = ref(db, "customers")
        const customersSnapshot = await get(customersRef)
        const customersData = customersSnapshot.exists() ? customersSnapshot.val() : {}
        const customers = Object.values(customersData || {})

        // Fetch agents
        const agentsRef = ref(db, "agents")
        const agentsSnapshot = await get(agentsRef)
        const agentsData = agentsSnapshot.exists() ? agentsSnapshot.val() : {}
        const agents = Object.values(agentsData || {})

        // Fetch products
        const productsRef = ref(db, "products")
        const productsSnapshot = await get(productsRef)
        const productsData = productsSnapshot.exists() ? productsSnapshot.val() : {}
        const products = Object.values(productsData || {})

        // Fetch territories (if exists)
        const territoriesRef = ref(db, "territories")
        const territoriesSnapshot = await get(territoriesRef)
        const territoriesData = territoriesSnapshot.exists() ? territoriesSnapshot.val() : {}
        const territories = Object.values(territoriesData || {})

        // Calculate dashboard metrics
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)

        setDashboardData({
          totalRevenue,
          totalCustomers: customers.length,
          totalOrders: orders.length,
          totalAgents: agents.length,
          totalProducts: products.length,
          totalTerritories: territories.length,
          isLoading: false,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data. Please try refreshing the page.",
          variant: "destructive",
        })
        // Set default values instead of keeping loading state
        setDashboardData({
          totalRevenue: 0,
          totalCustomers: 0,
          totalOrders: 0,
          totalAgents: 0,
          totalProducts: 0,
          totalTerritories: 0,
          isLoading: false,
        })
      }
    }

    fetchDashboardData()
  }, [toast])

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => {
              setDashboardData((prev) => ({ ...prev, isLoading: true }))
              // This will trigger the useEffect to run again
              setTimeout(() => {
                // Force a re-render
                setDashboardData((prev) => ({ ...prev }))
              }, 100)
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
            </svg>
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.isLoading ? (
                <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
              ) : (
                `₱${dashboardData.totalRevenue.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.isLoading ? (
                <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
              ) : (
                `+20.1% from last month`
              )}
            </p>
          </CardContent>
        </Card>

        <Card onClick={() => navigateTo("/admin/agents")} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.isLoading ? (
                <div className="h-7 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                dashboardData.totalAgents
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.isLoading ? (
                <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
              ) : (
                `Active sales agents`
              )}
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigateTo("/admin/customers")}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.isLoading ? (
                <div className="h-7 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                dashboardData.totalCustomers
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.isLoading ? (
                <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
              ) : (
                `Registered customers`
              )}
            </p>
          </CardContent>
        </Card>

        <Card onClick={() => navigateTo("/admin/orders")} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.isLoading ? (
                <div className="h-7 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                dashboardData.totalOrders
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.isLoading ? (
                <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
              ) : (
                `Total orders processed`
              )}
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigateTo("/admin/products")}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.isLoading ? (
                <div className="h-7 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                dashboardData.totalProducts
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.isLoading ? (
                <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
              ) : (
                `Active products`
              )}
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigateTo("/admin/territories")}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Territories</CardTitle>
            <MapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.isLoading ? (
                <div className="h-7 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                dashboardData.totalTerritories
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.isLoading ? (
                <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
              ) : (
                `Defined territories`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Company-wide revenue across all agents</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <AdminOverview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminRecentActivity />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Check the health of your system</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSystemStatus />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Detailed performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">Advanced analytics dashboard will be displayed here</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Access and download system reports</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">Reports dashboard will be displayed here</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

