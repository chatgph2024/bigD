"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { StatusCheck } from "@/components/status-check"
import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalProductsSold: 0,
    isLoading: true,
  })
  const { toast } = useToast()
  const { user, agentData } = useAuth()

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

        // Filter by agent if we have agent data
        const agentId = agentData?.id
        const filteredOrders = agentId ? orders.filter((order: any) => order.agent_id === agentId) : orders

        const filteredCustomers = agentId
          ? customers.filter((customer: any) => customer.agent_id === agentId)
          : customers

        // Calculate dashboard metrics
        const totalRevenue = filteredOrders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
        const totalOrders = filteredOrders.length

        // Calculate total products sold
        let totalProductsSold = 0
        filteredOrders.forEach((order: any) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              totalProductsSold += item.quantity || 0
            })
          }
        })

        setDashboardData({
          totalRevenue,
          totalCustomers: filteredCustomers.length,
          totalOrders,
          totalProductsSold,
          isLoading: false,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
        setDashboardData((prev) => ({ ...prev, isLoading: false }))
      }
    }

    fetchDashboardData()
  }, [toast, agentData])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
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
                `Based on ${dashboardData.totalOrders} total orders`
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
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
                `Active customers in database`
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.isLoading ? (
                <div className="h-7 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                dashboardData.totalProductsSold
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.isLoading ? (
                <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
              ) : (
                `Individual items sold`
              )}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Your highest spending customers</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Check the health of your system</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusCheck />
        </CardContent>
      </Card>
    </div>
  )
}

