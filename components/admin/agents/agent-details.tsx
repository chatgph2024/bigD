"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Calendar, Clock, ArrowLeft, Edit, Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ref, get, remove } from "firebase/database"
import { db } from "@/lib/firebase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AgentPerformance } from "@/components/admin/agents/agent-performance"
import { AgentCustomers } from "@/components/admin/agents/agent-customers"
import { AgentOrders } from "@/components/admin/agents/agent-orders"

interface AgentDetailsProps {
  id: string
}

export function AgentDetails({ id }: AgentDetailsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [agentData, setAgentData] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setIsLoading(true)
        const agentRef = ref(db, `agents/${id}`)
        const snapshot = await get(agentRef)

        if (snapshot.exists()) {
          setAgentData({ id, ...snapshot.val() })
        } else {
          toast({
            title: "Error",
            description: "Agent not found",
            variant: "destructive",
          })
          router.push("/admin/agents")
        }
      } catch (error) {
        console.error("Error fetching agent data:", error)
        toast({
          title: "Error",
          description: "Failed to load agent data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgentData()
  }, [id, router, toast])

  const handleDeleteAgent = async () => {
    try {
      const agentRef = ref(db, `agents/${id}`)
      await remove(agentRef)

      toast({
        title: "Agent Deleted",
        description: "The agent has been deleted successfully",
      })

      router.push("/admin/agents")
    } catch (error) {
      console.error("Error deleting agent:", error)
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading agent details...</span>
      </div>
    )
  }

  if (!agentData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold mb-2">Agent Not Found</h3>
        <p className="text-muted-foreground mb-4">The requested agent could not be found.</p>
        <Button onClick={() => router.push("/admin/agents")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agents
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push("/admin/agents")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agents
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/agents/edit/${id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Agent
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Agent
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the agent and remove their data from our
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAgent}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{agentData.name}</CardTitle>
              <CardDescription>Agent Profile</CardDescription>
            </div>
            <div>{getStatusBadge(agentData.status)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={agentData.avatar || "/placeholder.svg?height=128&width=128"} alt={agentData.name} />
                <AvatarFallback className="text-3xl">{getInitials(agentData.name)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{agentData.email || "No email provided"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{agentData.contact || "No contact provided"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Area Covered</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p>{agentData.area_covered || "No area assigned"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Joined</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{agentData.created_at ? new Date(agentData.created_at).toLocaleDateString() : "Unknown"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Active</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p>{agentData.last_updated ? new Date(agentData.last_updated).toLocaleDateString() : "Never"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Location Tracking</p>
                  <p>{agentData.enable_location ? "Enabled" : "Disabled"}</p>
                </div>
              </div>

              {agentData.notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{agentData.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Dashboard</CardTitle>
          <CardDescription>Performance metrics and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="performance" className="pt-6">
              <AgentPerformance agentId={id} />
            </TabsContent>
            <TabsContent value="customers" className="pt-6">
              <AgentCustomers agentId={id} />
            </TabsContent>
            <TabsContent value="orders" className="pt-6">
              <AgentOrders agentId={id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

