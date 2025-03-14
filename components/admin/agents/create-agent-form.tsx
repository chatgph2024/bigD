"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ref, push, set, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"
import { getNextAgentId } from "@/lib/id-generator"

export function CreateAgentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [nextAgentId, setNextAgentId] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    area_covered: "",
    status: "active",
    enable_location: true,
    notes: "",
    sales_target: 50000,
    agent_id: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchNextAgentId = async () => {
      try {
        setIsLoading(true)
        // Fetch existing agents to determine the next ID
        const agentsRef = ref(db, "agents")
        const agentsSnapshot = await get(agentsRef)
        const agentsData = agentsSnapshot.exists() ? agentsSnapshot.val() : {}

        // Generate the next agent ID
        const newAgentId = await getNextAgentId(agentsData)
        setNextAgentId(newAgentId)

        // Set the agent_id in the form data
        setFormData((prev) => ({ ...prev, agent_id: newAgentId }))
      } catch (error) {
        console.error("Error fetching next agent ID:", error)
        toast({
          title: "Error",
          description: "Failed to generate agent ID. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNextAgentId()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value) || 0,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create a new agent reference
      const agentsRef = ref(db, "agents")
      const newAgentRef = push(agentsRef)

      // Set the agent data
      await set(newAgentRef, {
        ...formData,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        total_sales: 0,
        customers_count: 0,
      })

      toast({
        title: "Agent Created",
        description: `The agent ${formData.name} has been added successfully with ID: ${formData.agent_id}.`,
      })

      // Redirect to the agents list
      router.push("/admin/agents")
    } catch (error) {
      console.error("Error adding agent:", error)
      toast({
        title: "Error",
        description: "Failed to add agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Generating agent ID...</span>
      </div>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>New Agent</CardTitle>
            <CardDescription>Add a new sales agent to your team</CardDescription>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-mono text-sm">
            Agent ID: {nextAgentId}
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter agent's full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="area_covered">Area/Region Covered *</Label>
            <Input
              id="area_covered"
              name="area_covered"
              placeholder="Enter area or region covered"
              value={formData.area_covered}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sales_target">Sales Target (₱) *</Label>
              <Input
                id="sales_target"
                name="sales_target"
                type="number"
                placeholder="Enter sales target"
                value={formData.sales_target}
                onChange={handleNumberChange}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable_location">Enable Location Tracking</Label>
              <p className="text-sm text-muted-foreground">Allow tracking of agent's location during work hours</p>
            </div>
            <Switch
              id="enable_location"
              checked={formData.enable_location}
              onCheckedChange={(checked) => handleSwitchChange("enable_location", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional information about the agent"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/agents")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Agent...
              </>
            ) : (
              "Create Agent"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

