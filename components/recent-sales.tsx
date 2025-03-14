"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface Customer {
  id: string
  name: string
  contact: string
  total_spent: number
}

export function RecentSales() {
  const [topCustomers, setTopCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { agentData } = useAuth()

  useEffect(() => {
    const fetchTopCustomers = async () => {
      try {
        setIsLoading(true)

        // Fetch customers
        const customersRef = ref(db, "customers")
        const customersSnapshot = await get(customersRef)

        if (customersSnapshot.exists()) {
          const customersData = customersSnapshot.val()

          // Format and filter customers
          let formattedCustomers = Object.entries(customersData).map(([id, data]: [string, any]) => ({
            id,
            name: data.name || "",
            contact: data.contact || "",
            total_spent: data.total_spent || 0,
          }))

          // Filter by agent if we have agent data
          if (agentData?.id) {
            formattedCustomers = formattedCustomers.filter((customer: any) => customer.agent_id === agentData.id)
          }

          // Sort by total spent and get top 5
          formattedCustomers.sort((a, b) => b.total_spent - a.total_spent)
          setTopCustomers(formattedCustomers.slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching top customers:", error)
        toast({
          title: "Error",
          description: "Failed to load top customers data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopCustomers()
  }, [toast, agentData])

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="ml-4 space-y-1">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="ml-auto h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {topCustomers.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No customer data available</div>
      ) : (
        topCustomers.map((customer) => (
          <div key={customer.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder.svg?height=36&width=36" alt={customer.name} />
              <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.contact}</p>
            </div>
            <div className="ml-auto font-medium">₱{customer.total_spent.toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  )
}

