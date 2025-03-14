"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CustomerOrdersProps {
  customerId: string
}

export function CustomerOrders({ customerId }: CustomerOrdersProps) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        // Fetch all orders
        const ordersRef = ref(db, "orders")
        const ordersSnapshot = await get(ordersRef)

        if (ordersSnapshot.exists()) {
          const ordersData = ordersSnapshot.val()
          // Filter only this customer's orders
          const customerOrders = Object.entries(ordersData)
            .filter(([_, data]: [string, any]) => data.customer_id === customerId)
            .map(([id, data]: [string, any]) => ({
              id,
              order_id: data.order_id || id.substring(0, 8),
              order_date: data.order_date || "No date",
              total_amount: data.total_amount || 0,
              status: data.status || "pending",
              items_count: data.items?.length || 0,
              agent_name: data.agent_name || "Unknown Agent",
            }))
            .sort((a, b) => {
              // Sort by date (newest first)
              return new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
            })

          setOrders(customerOrders)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to load order data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [customerId, toast])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mr-2"></div>
        <span>Loading orders...</span>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No orders found for this customer.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_id}</TableCell>
              <TableCell>{order.order_date}</TableCell>
              <TableCell>{order.items_count}</TableCell>
              <TableCell>₱{order.total_amount.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{order.agent_name}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View order</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

