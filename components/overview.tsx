"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface MonthlyData {
  name: string
  total: number
}

export function Overview() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { agentData } = useAuth()

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setIsLoading(true)

        // Fetch orders
        const ordersRef = ref(db, "orders")
        const ordersSnapshot = await get(ordersRef)

        if (ordersSnapshot.exists()) {
          const ordersData = ordersSnapshot.val()

          // Initialize monthly data
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          const monthlyTotals: { [key: string]: number } = {}
          months.forEach((month) => {
            monthlyTotals[month] = 0
          })

          // Filter by agent if we have agent data
          const agentId = agentData?.id

          // Calculate monthly totals
          Object.values(ordersData).forEach((order: any) => {
            // Skip if not for this agent
            if (agentId && order.agent_id !== agentId) {
              return
            }

            if (order.order_date && order.total_amount) {
              const date = new Date(order.order_date)
              const month = months[date.getMonth()]
              monthlyTotals[month] += order.total_amount
            }
          })

          // Format data for chart
          const formattedData = months.map((month) => ({
            name: month,
            total: monthlyTotals[month],
          }))

          setMonthlyData(formattedData)
        }
      } catch (error) {
        console.error("Error fetching monthly data:", error)
        toast({
          title: "Error",
          description: "Failed to load sales overview data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonthlyData()
  }, [toast, agentData])

  if (isLoading) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="h-full w-full bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={monthlyData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₱${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`₱${value.toLocaleString()}`, "Revenue"]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

