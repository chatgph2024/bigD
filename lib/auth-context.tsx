"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { ref, get } from "firebase/database"
import { auth, db } from "@/lib/firebase"

interface AgentData {
  id?: string
  name: string
  contact: string
  area_covered?: string
  location?: {
    lat: number
    lng: number
  }
  last_updated?: number
  user_id?: string
}

interface AuthContextType {
  user: User | null
  agentData: AgentData | null
  loading: boolean
  authInitialized: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  agentData: null,
  loading: true,
  authInitialized: false,
  login: async () => {
    throw new Error("Not implemented")
  },
  logout: async () => {
    throw new Error("Not implemented")
  },
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [agentData, setAgentData] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)

  useEffect(() => {
    console.log("Setting up auth state listener")
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user")
      setUser(user)

      if (user) {
        try {
          // First try to find agent by user_id
          const agentsRef = ref(db, "agents")
          const agentsSnapshot = await get(agentsRef)

          if (agentsSnapshot.exists()) {
            const agentsData = agentsSnapshot.val()

            // Find agent with matching user_id
            let foundAgent = null
            for (const [agentId, agent] of Object.entries(agentsData)) {
              if ((agent as any).user_id === user.uid) {
                foundAgent = { id: agentId, ...(agent as any) }
                break
              }
            }

            if (foundAgent) {
              console.log("Found agent data:", foundAgent)
              setAgentData(foundAgent)
            } else {
              console.log("No agent found with user_id:", user.uid)
              // If no agent found by user_id, just use the first agent for demo purposes
              const firstAgentId = Object.keys(agentsData)[0]
              if (firstAgentId) {
                const firstAgent = { id: firstAgentId, ...(agentsData[firstAgentId] as any) }
                console.log("Using first agent instead:", firstAgent)
                setAgentData(firstAgent)
              }
            }
          } else {
            console.log("No agents data found")
          }
        } catch (error) {
          console.error("Error fetching agent data:", error)
        }
      } else {
        setAgentData(null)
      }

      setLoading(false)
      setAuthInitialized(true)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await signOut(auth)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, agentData, loading, authInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

