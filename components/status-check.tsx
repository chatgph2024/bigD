"use client"

import { useState, useEffect } from "react"

export function StatusCheck() {
  const [status, setStatus] = useState<{
    isOnline: boolean
    message: string
  }>({
    isOnline: false,
    message: "Checking system status...",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/health", { next: { revalidate: 60 } })
        const text = await response.text()

        setStatus({
          isOnline: response.ok,
          message: text,
        })
      } catch (error) {
        setStatus({
          isOnline: false,
          message: "Error connecting to API",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-3 w-3 rounded-full bg-gray-300 animate-pulse"></div>
        <div>
          <p className="font-medium">Checking system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`h-3 w-3 rounded-full ${status.isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
      <div>
        <p className="font-medium">API Status: {status.isOnline ? "Online" : "Offline"}</p>
        <p className="text-sm text-muted-foreground">Response: {status.message}</p>
      </div>
    </div>
  )
}

