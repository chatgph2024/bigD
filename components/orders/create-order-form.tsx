"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { ref, push, set, get, update } from "firebase/database"
import { db } from "@/lib/firebase"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface Customer {
  id: string
  name: string
  code: string
}

interface Product {
  id: string
  name: string
  price: number
  sku: string
}

interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}

export function CreateOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    order_date: new Date().toISOString().split("T")[0],
    notes: "",
    payment_method: "cash",
    status: "pending",
  })

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { product_id: "", product_name: "", quantity: 1, unit_price: 0 },
  ])

  const router = useRouter()
  const { toast } = useToast()
  const { agentData } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch customers
        const customersRef = ref(db, "customers")
        const customersSnapshot = await get(customersRef)

        if (customersSnapshot.exists()) {
          const customersData = customersSnapshot.val()
          const formattedCustomers = Object.entries(customersData).map(([id, data]: [string, any]) => ({
            id,
            name: data.name || "Unknown Customer",
            code: data.code || "",
          }))

          // Filter by agent if we have agent data
          const filteredCustomers = agentData?.id
            ? formattedCustomers.filter((customer: any) => customer.agent_id === agentData.id)
            : formattedCustomers

          setCustomers(filteredCustomers)
        }

        // Fetch products
        const productsRef = ref(db, "products")
        const productsSnapshot = await get(productsRef)

        if (productsSnapshot.exists()) {
          const productsData = productsSnapshot.val()
          const formattedProducts = Object.entries(productsData).map(([id, data]: [string, any]) => ({
            id,
            name: data.name || "Unknown Product",
            price: data.price || 0,
            sku: data.sku || "",
          }))
          setProducts(formattedProducts)
        } else {
          // If no products exist, create some sample products
          const sampleProducts = [
            { name: "Product A", price: 100, sku: "PROD-A" },
            { name: "Product B", price: 200, sku: "PROD-B" },
            { name: "Product C", price: 300, sku: "PROD-C" },
          ]

          const newProductsRef = ref(db, "products")
          sampleProducts.forEach(async (product) => {
            const newProductRef = push(newProductsRef)
            await set(newProductRef, product)
          })

          // Set the products state with the sample products
          setProducts(
            sampleProducts.map((product, index) => ({
              id: `sample-${index}`,
              ...product,
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load customers and products.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [agentData, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "customer_id") {
      const selectedCustomer = customers.find((customer) => customer.id === value)
      setFormData((prev) => ({
        ...prev,
        customer_id: value,
        customer_name: selectedCustomer?.name || "",
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = products.find((product) => product.id === productId)

    const updatedItems = [...orderItems]
    updatedItems[index] = {
      ...updatedItems[index],
      product_id: productId,
      product_name: selectedProduct?.name || "",
      unit_price: selectedProduct?.price || 0,
    }

    setOrderItems(updatedItems)
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...orderItems]
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: quantity,
    }

    setOrderItems(updatedItems)
  }

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: "", product_name: "", quantity: 1, unit_price: 0 }])
  }

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      const updatedItems = [...orderItems]
      updatedItems.splice(index, 1)
      setOrderItems(updatedItems)
    }
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + item.quantity * item.unit_price
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (orderItems.some((item) => !item.product_id)) {
      toast({
        title: "Validation Error",
        description: "Please select a product for all order items.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Generate a unique order ID
      const orderId = `ORD-${Date.now().toString().slice(-6)}`

      // Calculate total amount
      const totalAmount = calculateTotal()

      // Create a new order reference
      const ordersRef = ref(db, "orders")
      const newOrderRef = push(ordersRef)

      // Set the order data
      await set(newOrderRef, {
        ...formData,
        order_id: orderId,
        items: orderItems,
        total_amount: totalAmount,
        agent_id: agentData?.id || "",
        created_at: new Date().toISOString(),
      })

      // Update customer's total_spent and total_orders
      if (formData.customer_id) {
        const customerRef = ref(db, `customers/${formData.customer_id}`)
        const customerSnapshot = await get(customerRef)

        if (customerSnapshot.exists()) {
          const customerData = customerSnapshot.val()
          await update(customerRef, {
            total_spent: (customerData.total_spent || 0) + totalAmount,
            total_orders: (customerData.total_orders || 0) + 1,
          })
        }
      }

      toast({
        title: "Order Created",
        description: "The order has been created successfully.",
      })

      // Redirect to the orders list
      router.push("/dashboard/orders")
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading form data...</span>
      </div>
    )
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Order Information</CardTitle>
        <CardDescription>Create a new order for a customer</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customer_id">Customer *</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => handleSelectChange("customer_id", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.length === 0 ? (
                  <SelectItem value="no-customers" disabled>
                    No customers available
                  </SelectItem>
                ) : (
                  customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.code})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order_date">Order Date *</Label>
              <Input
                id="order_date"
                name="order_date"
                type="date"
                value={formData.order_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleSelectChange("payment_method", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Order Status *</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select order status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Order Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            {orderItems.map((item, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-12 items-end border-b pb-4">
                <div className="md:col-span-5 space-y-2">
                  <Label htmlFor={`product-${index}`}>Product</Label>
                  <Select value={item.product_id} onValueChange={(value) => handleProductChange(index, value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <SelectItem value="no-products" disabled>
                          No products available
                        </SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (₱{product.price})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, Number.parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`price-${index}`}>Unit Price</Label>
                  <Input id={`price-${index}`} value={`₱${item.unit_price}`} disabled />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`subtotal-${index}`}>Subtotal</Label>
                  <Input id={`subtotal-${index}`} value={`₱${item.quantity * item.unit_price}`} disabled />
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOrderItem(index)}
                    disabled={orderItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <div className="w-1/3 space-y-2">
                <Label>Total Amount</Label>
                <Input value={`₱${calculateTotal().toLocaleString()}`} className="font-bold" disabled />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes about the order"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/orders")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Order...
              </>
            ) : (
              "Create Order"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

