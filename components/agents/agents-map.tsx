"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MapPin, User, Phone, Clock } from "lucide-react"
import { ref, onValue } from "firebase/database"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface Agent {
  id: string
  name: string
  contact: string
  area_covered?: string
  location?: {
    lat: number
    lng: number
  }
  last_updated?: number
}

export function AgentsMap() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true)

        // Fetch agents
        const agentsRef = ref(db, "agents")

        // Set up a real-time listener for agent locations
        const unsubscribe = onValue(
          agentsRef,
          (snapshot) => {
            if (snapshot.exists()) {
              // Format agents data
              const formattedAgents = Object.entries(snapshot.val() || {}).map(([id, data]: [string, any]) => ({
                id,
                name: data.name || "Unknown",
                contact: data.contact || "N/A",
                area_covered: data.area_covered || "N/A",
                location: data.location,
                last_updated: data.last_updated,
              }))

              setAgents(formattedAgents)

              // Select first agent by default if available
              if (formattedAgents.length > 0 && !selectedAgent) {
                setSelectedAgent(formattedAgents[0].id)
              }
            }
            setIsLoading(false)
          },
          (error) => {
            console.error("Error fetching agents:", error)
            toast({
              title: "Error",
              description: "Failed to load agents data",
              variant: "destructive",
            })
            setIsLoading(false)
          },
        )

        // Clean up the listener
        return () => unsubscribe()
      } catch (error) {
        console.error("Error setting up agents listener:", error)
        toast({
          title: "Error",
          description: "Failed to set up agents tracking",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [toast, selectedAgent])

  const getAgentStatus = (agent: Agent) => {
    if (!agent.last_updated) return "Inactive"

    const lastUpdated = new Date(agent.last_updated)
    const now = new Date()
    const diffHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)

    return diffHours < 24 ? "Active" : "Inactive"
  }

  const getTimeAgo = (timestamp?: number) => {
    if (!timestamp) return "Never"

    const now = new Date()
    const lastUpdated = new Date(timestamp)
    const diffMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60))

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes} mins ago`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} hours ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} days ago`
  }

  const selectedAgentData = agents.find((agent) => agent.id === selectedAgent)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Agent Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[500px] w-full rounded-md border bg-muted flex items-center justify-center">
            {agents.length === 0 ? (
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No agent location data available</p>
                <p className="text-xs text-muted-foreground">Agent locations will appear here when available</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Map view will be displayed here</p>
                  <p className="text-xs text-muted-foreground">Showing real-time agent locations</p>
                </div>

                {/* Agent location markers - these would be positioned based on real coordinates */}
                {agents
                  .filter((agent) => agent.location)
                  .map((agent, index) => (
                    <div
                      key={agent.id}
                      className={`absolute h-4 w-4 rounded-full ${
                        getAgentStatus(agent) === "Active" ? "bg-green-500 animate-pulse" : "bg-red-500"
                      }`}
                      style={{
                        top: `${25 + index * 10}%`,
                        left: `${25 + index * 10}%`,
                      }}
                      onClick={() => setSelectedAgent(agent.id)}
                    />
                  ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded w-full" />
              <div className="h-32 bg-muted animate-pulse rounded w-full" />
              <div className="h-32 bg-muted animate-pulse rounded w-full" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No agents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      agents.map((agent) => (
                        <TableRow
                          key={agent.id}
                          className={`cursor-pointer ${selectedAgent === agent.id ? "bg-muted" : ""}`}
                          onClick={() => setSelectedAgent(agent.id)}
                        >
                          <TableCell className="font-medium">{agent.name}</TableCell>
                          <TableCell>
                            <Badge variant={getAgentStatus(agent) === "Active" ? "default" : "secondary"}>
                              {getAgentStatus(agent)}
                            </Badge>
                          </TableCell>
                          <TableCell>{getTimeAgo(agent.last_updated)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {selectedAgentData && (
                <div className="mt-4 rounded-md border p-4">
                  <h3 className="font-semibold">Agent Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedAgentData.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedAgentData.area_covered}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedAgentData.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Last update: {getTimeAgo(selectedAgentData.last_updated)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

