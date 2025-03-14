"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { ref, push, set, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

export function AddCustomerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    location: "",
    notes: "",
    agent_id: "",
  })
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const { agentData } = useAuth()

  // Fetch agents for the dropdown
  useState(() => {
    const fetchAgents = async () => {
      try {
        const agentsRef = ref(db, "agents")
        const snapshot = await get(agentsRef)

        if (snapshot.exists()) {
          const agentsData = snapshot.val()
          const formattedAgents = Object.entries(agentsData).map(([id, data]: [string, any]) => ({
            id,
            name: data.name || "Unknown Agent",
          }))
          setAgents(formattedAgents)

          // If current user is an agent, pre-select them
          if (agentData?.id) {
            setFormData((prev) => ({
              ...prev,
              agent_id: agentData.id,
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching agents:", error)
      }
    }

    fetchAgents()
  }, [agentData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate a unique customer code
      const customerCode = `CUST-${Date.now().toString().slice(-6)}`

      // Create a new customer reference
      const customersRef = ref(db, "customers")
      const newCustomerRef = push(customersRef)

      // Set the customer data
      await set(newCustomerRef, {
        ...formData,
        code: customerCode,
        created_at: new Date().toISOString(),
        total_spent: 0,
        total_orders: 0,
      })

      toast({
        title: "Customer Added",
        description: "The customer has been added successfully.",
      })

      // Redirect to the customers list
      router.push("/dashboard/customers")
    } catch (error) {
      console.error("Error adding customer:", error)
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
        <CardDescription>Add a new customer to your database</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                name="contact"
                placeholder="Enter contact number"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location/Address *</Label>
            <Input
              id="location"
              name="location"
              placeholder="Enter customer location or address"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent_id">Assigned Agent *</Label>
            <Select value={formData.agent_id} onValueChange={(value) => handleSelectChange("agent_id", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes about the customer"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/customers")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Customer...
              </>
            ) : (
              "Add Customer"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

