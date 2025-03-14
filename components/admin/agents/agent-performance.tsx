"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface AgentPerformanceProps {
  agentId: string
}

export function AgentPerformance({ agentId }: AgentPerformanceProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<any>({
    monthlySales: [],
    totalSales: 0,
    salesTarget: 0,
    performancePercentage: 0,
    customerCount: 0,
    orderCount: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setIsLoading(true)

        // Fetch agent data
        const agentRef = ref(db, `agents/${agentId}`)
        const agentSnapshot = await get(agentRef)

        // Fetch orders
        const ordersRef = ref(db, "orders")
        const ordersSnapshot = await get(ordersRef)

        // Fetch customers
        const customersRef = ref(db, "customers")
        const customersSnapshot = await get(customersRef)

        if (agentSnapshot.exists() && ordersSnapshot.exists()) {
          const agentData = agentSnapshot.val()
          const ordersData = ordersSnapshot.val()
          const customersData = customersSnapshot.exists() ? customersSnapshot.val() : {}

          // Calculate total sales
          let totalSales = 0
          let orderCount = 0
          const monthlySalesMap: Record<string, number> = {}

          // Initialize monthly data
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          months.forEach((month) => {
            monthlySalesMap[month] = 0
          })

          // Process orders
          Object.values(ordersData).forEach((order: any) => {
            if (order.agent_id === agentId && order.total_amount) {
              totalSales += order.total_amount
              orderCount++

              // Add to monthly data if order date exists
              if (order.order_date) {
                const date = new Date(order.order_date)
                const month = months[date.getMonth()]
                monthlySalesMap[month] += order.total_amount
              }
            }
          })

          // Count customers assigned to this agent
          let customerCount = 0
          Object.values(customersData).forEach((customer: any) => {
            if (customer.agent_id === agentId) {
              customerCount++
            }
          })

          // Format monthly sales for chart
          const monthlySales = months.map((month) => ({
            name: month,
            sales: monthlySalesMap[month],
          }))

          // Calculate performance percentage
          const salesTarget = agentData.sales_target || 50000
          const performancePercentage = Math.min(100, Math.round((totalSales / salesTarget) * 100))

          setPerformanceData({
            monthlySales,
            totalSales,
            salesTarget,
            performancePercentage,
            customerCount,
            orderCount,
          })
        }
      } catch (error) {
        console.error("Error fetching performance data:", error)
        toast({
          title: "Error",
          description: "Failed to load agent performance data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPerformanceData()
  }, [agentId, toast])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[300px] bg-muted animate-pulse rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-muted animate-pulse rounded-md"></div>
          <div className="h-24 bg-muted animate-pulse rounded-md"></div>
          <div className="h-24 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <div className="h-[300px] w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData.monthlySales}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₱${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`₱${value.toLocaleString()}`, "Sales"]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="sales" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Sales Performance</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{performanceData.performancePercentage}%</span>
                <span className="text-sm text-muted-foreground">
                  Target: ₱{performanceData.salesTarget.toLocaleString()}
                </span>
              </div>
              <Progress value={performanceData.performancePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">₱{performanceData.totalSales.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">From {performanceData.orderCount} orders</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Customers</p>
              <p className="text-2xl font-bold">{performanceData.customerCount}</p>
              <p className="text-sm text-muted-foreground">Assigned customers</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

