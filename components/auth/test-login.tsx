"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export function TestLogin() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const { user, agentData, loading, authInitialized } = useAuth()

  const checkFirebaseConfig = () => {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓" : "✗",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓" : "✗",
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? "✓" : "✗",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓" : "✗",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✓" : "✗",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✓" : "✗",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✓" : "✗",
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? "✓" : "✗",
    }

    setDebugInfo({
      config,
      user: user
        ? {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
          }
        : null,
      agentData,
      loading,
      authInitialized,
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
        <CardDescription>Check Firebase configuration and authentication status</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={checkFirebaseConfig} className="mb-4">
          Check Configuration
        </Button>

        {Object.keys(debugInfo).length > 0 && (
          <div className="mt-4 rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">This component is for debugging purposes only.</p>
      </CardFooter>
    </Card>
  )
}

