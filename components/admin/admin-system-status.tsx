"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function AdminSystemStatus() {
  const [status, setStatus] = useState<{
    api: { isOnline: boolean; message: string; latency: number }
    database: { isOnline: boolean; message: string; usage: number }
    storage: { isOnline: boolean; message: string; usage: number }
    cache: { isOnline: boolean; message: string; hitRate: number }
  }>({
    api: { isOnline: false, message: "Checking API status...", latency: 0 },
    database: { isOnline: false, message: "Checking database status...", usage: 0 },
    storage: { isOnline: false, message: "Checking storage status...", usage: 0 },
    cache: { isOnline: false, message: "Checking cache status...", hitRate: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true)

        // In a real app, you would make actual API calls to check system status
        // For demo purposes, we'll simulate a successful status check

        // Simulate API check
        const apiResponse = await fetch("/api/health", { next: { revalidate: 60 } })
        const apiText = await apiResponse.text()

        // Simulate a delay for the status check
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setStatus({
          api: {
            isOnline: true,
            message: apiText || "API is operational",
            latency: Math.floor(Math.random() * 100) + 20,
          },
          database: {
            isOnline: true,
            message: "Database is operational",
            usage: Math.floor(Math.random() * 60) + 20,
          },
          storage: {
            isOnline: true,
            message: "Storage system is operational",
            usage: Math.floor(Math.random() * 40) + 10,
          },
          cache: {
            isOnline: true,
            message: "Cache system is operational",
            hitRate: Math.floor(Math.random() * 30) + 70,
          },
        })
      } catch (error) {
        console.error("Error checking system status:", error)
        setStatus({
          api: { isOnline: false, message: "Error connecting to API", latency: 0 },
          database: { isOnline: false, message: "Error connecting to database", usage: 0 },
          storage: { isOnline: false, message: "Error connecting to storage", usage: 0 },
          cache: { isOnline: false, message: "Error connecting to cache", hitRate: 0 },
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${status.api.isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
            <div>
              <p className="font-medium">API Status</p>
              <p className="text-sm text-muted-foreground">{status.api.message}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Latency</span>
              <span>{status.api.latency}ms</span>
            </div>
            <Progress value={Math.min(100, status.api.latency)} max={200} className="h-2 mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${status.database.isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
            <div>
              <p className="font-medium">Database Status</p>
              <p className="text-sm text-muted-foreground">{status.database.message}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Usage</span>
              <span>{status.database.usage}%</span>
            </div>
            <Progress value={status.database.usage} className="h-2 mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${status.storage.isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
            <div>
              <p className="font-medium">Storage Status</p>
              <p className="text-sm text-muted-foreground">{status.storage.message}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Usage</span>
              <span>{status.storage.usage}%</span>
            </div>
            <Progress value={status.storage.usage} className="h-2 mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${status.cache.isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
            <div>
              <p className="font-medium">Cache Status</p>
              <p className="text-sm text-muted-foreground">{status.cache.message}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Hit Rate</span>
              <span>{status.cache.hitRate}%</span>
            </div>
            <Progress value={status.cache.hitRate} className="h-2 mt-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

