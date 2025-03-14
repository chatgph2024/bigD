"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, FileText, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface AgentPerformance {
  name: string
  sales: number
  target: number
}

interface CustomerRebate {
  name: string
  rebate: number
  purchases: number
}

interface ProductSale {
  name: string
  sales: number
}

export function ReportsDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [agentPerformanceData, setAgentPerformanceData] = useState<AgentPerformance[]>([])
  const [customerRebatesData, setCustomerRebatesData] = useState<CustomerRebate[]>([])
  const [productSalesData, setProductSalesData] = useState<ProductSale[]>([])
  const { toast } = useToast()
  const { agentData } = useAuth()

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true)

        // Fetch agents
        const agentsRef = ref(db, "agents")
        const agentsSnapshot = await get(agentsRef)

        // Fetch orders
        const ordersRef = ref(db, "orders")
        const ordersSnapshot = await get(ordersRef)

        // Fetch customers
        const customersRef = ref(db, "customers")
        const customersSnapshot = await get(customersRef)

        // Fetch products
        const productsRef = ref(db, "products")
        const productsSnapshot = await get(productsRef)

        if (agentsSnapshot.exists() && ordersSnapshot.exists()) {
          const agentsData = agentsSnapshot.val()
          const ordersData = ordersSnapshot.val()
          const customersData = customersSnapshot.exists() ? customersSnapshot.val() : {}
          const productsData = productsSnapshot.exists() ? productsSnapshot.val() : {}

          // Process agent performance data
          const agentSales: Record<string, number> = {}
          Object.values(ordersData).forEach((order: any) => {
            if (order.agent_id && order.total_amount) {
              agentSales[order.agent_id] = (agentSales[order.agent_id] || 0) + order.total_amount
            }
          })

          const agentPerformance = Object.entries(agentsData).map(([id, agent]: [string, any]) => ({
            name: agent.name || "Unknown Agent",
            sales: agentSales[id] || 0,
            target: agent.sales_target || 50000, // Default target if not set
          }))

          // Filter by agent if we have agent data
          const filteredAgentPerformance = agentData?.id
            ? agentPerformance.filter((agent) => agent.name === agentData.name)
            : agentPerformance

          setAgentPerformanceData(filteredAgentPerformance)

          // Process customer rebates data
          const customerRebates = Object.entries(customersData)
            .map(([id, customer]: [string, any]) => {
              const totalPurchases = customer.total_spent || 0
              // Calculate rebate as 10% of total purchases
              const rebateAmount = totalPurchases * 0.1

              return {
                name: customer.name || "Unknown Customer",
                purchases: totalPurchases,
                rebate: rebateAmount,
              }
            })
            .filter((customer) => customer.purchases > 0)
            .sort((a, b) => b.rebate - a.rebate)
            .slice(0, 5)

          setCustomerRebatesData(customerRebates)

          // Process product sales data
          const productSales: Record<string, number> = {}

          Object.values(ordersData).forEach((order: any) => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item: any) => {
                if (item.product_id && item.quantity && item.unit_price) {
                  const itemTotal = item.quantity * item.unit_price
                  productSales[item.product_id] = (productSales[item.product_id] || 0) + itemTotal
                }
              })
            }
          })

          const productSalesArray = Object.entries(productSales)
            .map(([productId, sales]) => {
              const productName = productsData[productId]?.name || "Unknown Product"
              return { name: productName, sales }
            })
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)

          setProductSalesData(productSalesArray)
        }
      } catch (error) {
        console.error("Error fetching report data:", error)
        toast({
          title: "Error",
          description: "Failed to load report data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportData()
  }, [toast, agentData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading report data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle>Reports & Analytics</CardTitle>
            <CardDescription>View and generate reports for your business</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agent-performance">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="agent-performance">Agent Performance</TabsTrigger>
              <TabsTrigger value="customer-rebates">Customer Rebates</TabsTrigger>
              <TabsTrigger value="product-sales">Product Sales</TabsTrigger>
            </TabsList>

            <TabsContent value="agent-performance" className="space-y-4 pt-4">
              {agentPerformanceData.length === 0 ? (
                <div className="rounded-md border p-8 text-center">
                  <p className="text-muted-foreground">No agent performance data available</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <div className="h-[350px] w-full p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={agentPerformanceData}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₱${value}`}
                          />
                          <Bar dataKey="sales" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-medium">Agent</th>
                          <th className="px-4 py-3 text-left font-medium">Sales</th>
                          <th className="px-4 py-3 text-left font-medium">Target</th>
                          <th className="px-4 py-3 text-left font-medium">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agentPerformanceData.map((agent, index) => (
                          <tr
                            key={index}
                            className={cn("border-b", index === agentPerformanceData.length - 1 && "border-0")}
                          >
                            <td className="px-4 py-3">{agent.name}</td>
                            <td className="px-4 py-3">₱{agent.sales.toLocaleString()}</td>
                            <td className="px-4 py-3">₱{agent.target.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  agent.sales >= agent.target
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {Math.round((agent.sales / agent.target) * 100)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="customer-rebates" className="space-y-4 pt-4">
              {customerRebatesData.length === 0 ? (
                <div className="rounded-md border p-8 text-center">
                  <p className="text-muted-foreground">No customer rebate data available</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <div className="h-[350px] w-full p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={customerRebatesData}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₱${value}`}
                          />
                          <Bar dataKey="rebate" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-medium">Customer</th>
                          <th className="px-4 py-3 text-left font-medium">Total Purchases</th>
                          <th className="px-4 py-3 text-left font-medium">Rebate Amount</th>
                          <th className="px-4 py-3 text-left font-medium">Rebate %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerRebatesData.map((customer, index) => (
                          <tr
                            key={index}
                            className={cn("border-b", index === customerRebatesData.length - 1 && "border-0")}
                          >
                            <td className="px-4 py-3">{customer.name}</td>
                            <td className="px-4 py-3">₱{customer.purchases.toLocaleString()}</td>
                            <td className="px-4 py-3">₱{customer.rebate.toLocaleString()}</td>
                            <td className="px-4 py-3">10%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="product-sales" className="space-y-4 pt-4">
              {productSalesData.length === 0 ? (
                <div className="rounded-md border p-8 text-center">
                  <p className="text-muted-foreground">No product sales data available</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <div className="h-[350px] w-full p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productSalesData}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₱${value}`}
                          />
                          <Bar dataKey="sales" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-medium">Product</th>
                          <th className="px-4 py-3 text-left font-medium">Sales Amount</th>
                          <th className="px-4 py-3 text-left font-medium">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productSalesData.map((product, index) => {
                          const totalSales = productSalesData.reduce((sum, p) => sum + p.sales, 0)
                          return (
                            <tr
                              key={index}
                              className={cn("border-b", index === productSalesData.length - 1 && "border-0")}
                            >
                              <td className="px-4 py-3">{product.name}</td>
                              <td className="px-4 py-3">₱{product.sales.toLocaleString()}</td>
                              <td className="px-4 py-3">{Math.round((product.sales / totalSales) * 100)}%</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Configure automatic report generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Report Name</th>
                  <th className="px-4 py-3 text-left font-medium">Frequency</th>
                  <th className="px-4 py-3 text-left font-medium">Recipients</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3">Monthly Sales Summary</td>
                  <td className="px-4 py-3">Monthly</td>
                  <td className="px-4 py-3">admin@bigdist.com</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3">Weekly Agent Performance</td>
                  <td className="px-4 py-3">Weekly</td>
                  <td className="px-4 py-3">managers@bigdist.com</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Daily Order Summary</td>
                  <td className="px-4 py-3">Daily</td>
                  <td className="px-4 py-3">operations@bigdist.com</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

