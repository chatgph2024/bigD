"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  type: "order" | "customer" | "agent" | "system"
  action: string
  user: string
  userRole: string
  timestamp: string
  details: string
}

export function AdminRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this data from your database
    const fetchActivities = async () => {
      try {
        setIsLoading(true)

        // Mock data for demonstration
        const mockActivities: Activity[] = [
          {
            id: "1",
            type: "order",
            action: "created",
            user: "John Doe",
            userRole: "Agent",
            timestamp: "10 minutes ago",
            details: "Created new order #ORD-12345 for Acme Corp",
          },
          {
            id: "2",
            type: "customer",
            action: "updated",
            user: "Jane Smith",
            userRole: "Admin",
            timestamp: "45 minutes ago",
            details: "Updated customer information for Globex Inc.",
          },
          {
            id: "3",
            type: "agent",
            action: "assigned",
            user: "Admin System",
            userRole: "System",
            timestamp: "2 hours ago",
            details: "Assigned 3 new customers to agent Robert Johnson",
          },
          {
            id: "4",
            type: "system",
            action: "backup",
            user: "System",
            userRole: "System",
            timestamp: "6 hours ago",
            details: "Automated system backup completed successfully",
          },
          {
            id: "5",
            type: "order",
            action: "fulfilled",
            user: "Emily Davis",
            userRole: "Agent",
            timestamp: "Yesterday",
            details: "Marked order #ORD-12340 as fulfilled",
          },
        ]

        setActivities(mockActivities)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return "OR"
      case "customer":
        return "CU"
      case "agent":
        return "AG"
      case "system":
        return "SY"
      default:
        return "AC"
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-100 text-blue-800"
      case "customer":
        return "bg-green-100 text-green-800"
      case "agent":
        return "bg-purple-100 text-purple-800"
      case "system":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
      {activities.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No recent activity</div>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder.svg?height=36&width=36" alt={activity.user} />
              <AvatarFallback>{getActivityIcon(activity.type)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{activity.user}</p>
              <p className="text-sm text-muted-foreground">{activity.details}</p>
            </div>
            <div className="ml-auto flex flex-col items-end">
              <Badge variant="outline" className={getActivityColor(activity.type)}>
                {activity.type}
              </Badge>
              <span className="text-xs text-muted-foreground mt-1">{activity.timestamp}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

