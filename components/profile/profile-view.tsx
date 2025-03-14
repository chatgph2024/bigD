"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { MapPin, Phone, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase"

export function ProfileView() {
  const [locationTracking, setLocationTracking] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    avatar: "",
  })
  const { user, agentData } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true)

        if (agentData?.id) {
          // Fetch agent data
          const agentRef = ref(db, `agents/${agentData.id}`)
          const agentSnapshot = await get(agentRef)

          if (agentSnapshot.exists()) {
            const data = agentSnapshot.val()
            setProfileData({
              name: data.name || "",
              email: user?.email || "",
              phone: data.contact || "",
              region: data.area_covered || "",
              avatar: data.avatar || "",
            })
          }
        } else {
          // Use user data if available
          setProfileData({
            name: user?.displayName || "",
            email: user?.email || "",
            phone: "",
            region: "",
            avatar: user?.photoURL || "",
          })
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [user, agentData, toast])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleSaveChanges = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    })
  }

  const handleSavePreferences = () => {
    toast({
      title: "Preferences Updated",
      description: "Your preferences have been saved.",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <Card className="flex-1">
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="h-24 w-24 rounded-full bg-muted animate-pulse"></div>
                <div className="space-y-2 w-full">
                  <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-40 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Agent Profile</CardTitle>
            <CardDescription>View and manage your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatar || "/placeholder.svg?height=96&width=96"} alt={profileData.name} />
                <AvatarFallback className="text-2xl">{getInitials(profileData.name || "Agent User")}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold">{profileData.name || "Agent User"}</h3>
                <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{profileData.email || "No email available"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{profileData.phone || "No phone available"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profileData.region || "No region assigned"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Location Tracking</h4>
                  <p className="text-sm text-muted-foreground">Allow the app to track your location while working</p>
                </div>
                <Switch checked={locationTracking} onCheckedChange={setLocationTracking} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Your sales performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Monthly Sales</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">--</span>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Customers</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">--</span>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Orders</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">--</span>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Completion Rate</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">--</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Performance data will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={profileData.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={profileData.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue={profileData.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input id="region" defaultValue={profileData.region} />
                </div>
              </div>
              <Button className="mt-4" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </TabsContent>
            <TabsContent value="preferences" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for new orders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get alerts for order status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="mt-4" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

