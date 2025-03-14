"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Calendar, ArrowLeft, Edit, Trash2, AlertTriangle, Package } from "lucide-react"
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
import { CustomerOrders } from "@/components/admin/customers/customer-orders"

interface CustomerDetailsProps {
  id: string
}

export function CustomerDetails({ id }: CustomerDetailsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [customerData, setCustomerData] = useState<any>(null)
  const [agentName, setAgentName] = useState<string>("Not Assigned")
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Load the Google Maps script
  useEffect(() => {
    if (!mapLoaded) {
      window.initMap = () => {
        setMapLoaded(true)
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBUFtAGwnxY8BtAYlVC5Hc_5C-K7LCFdJo&libraries=places&callback=initMap`
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      return () => {
        window.initMap = () => {}
        document.head.removeChild(script)
      }
    }
  }, [mapLoaded])

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true)
        // Fetch customer data
        const customerRef = ref(db, `customers/${id}`)
        const snapshot = await get(customerRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          setCustomerData({ id, ...data })

          // If customer has an assigned agent, fetch agent name
          if (data.agent_id) {
            const agentRef = ref(db, `agents/${data.agent_id}`)
            const agentSnapshot = await get(agentRef)

            if (agentSnapshot.exists()) {
              const agentData = agentSnapshot.val()
              setAgentName(agentData.name || "Unknown Agent")
            }
          }
        } else {
          toast({
            title: "Error",
            description: "Customer not found",
            variant: "destructive",
          })
          router.push("/admin/customers")
        }
      } catch (error) {
        console.error("Error fetching customer data:", error)
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomerData()
  }, [id, router, toast])

  // Initialize the map once it's loaded and we have customer data
  useEffect(() => {
    if (mapLoaded && mapRef.current && customerData && customerData.latitude && customerData.longitude) {
      const customerLocation = {
        lat: customerData.latitude,
        lng: customerData.longitude,
      }

      const mapOptions = {
        center: customerLocation,
        zoom: 15,
      }

      googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions)

      // Add a marker for the customer location
      markerRef.current = new window.google.maps.Marker({
        map: googleMapRef.current,
        position: customerLocation,
        title: customerData.name,
      })

      // Create an info window with customer details
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 5px;">
            <h3 style="margin: 0 0 5px; font-weight: bold;">${customerData.name}</h3>
            <p style="margin: 0 0 3px;">${customerData.location}</p>
            <p style="margin: 0; color: #666;">Customer ID: ${customerData.customer_id}</p>
          </div>
        `,
      })

      // Open info window when marker is clicked
      markerRef.current.addListener("click", () => {
        infoWindow.open(googleMapRef.current, markerRef.current)
      })
    }
  }, [mapLoaded, customerData])

  const handleDeleteCustomer = async () => {
    try {
      const customerRef = ref(db, `customers/${id}`)
      await remove(customerRef)

      toast({
        title: "Customer Deleted",
        description: "The customer has been deleted successfully",
      })

      router.push("/admin/customers")
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "blocked":
        return <Badge className="bg-red-100 text-red-800">Blocked</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading customer details...</span>
      </div>
    )
  }

  if (!customerData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold mb-2">Customer Not Found</h3>
        <p className="text-muted-foreground mb-4">The requested customer could not be found.</p>
        <Button onClick={() => router.push("/admin/customers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push("/admin/customers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/customers/edit/${id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Customer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the customer and their data from our
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCustomer}
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
              <CardTitle>{customerData.name}</CardTitle>
              <CardDescription>Customer Profile</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-mono text-sm mr-2">
                {customerData.customer_id}
              </div>
              {getStatusBadge(customerData.status || "active")}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{customerData.email || "No email provided"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{customerData.contact || "No contact provided"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p>{customerData.location || "No address provided"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>
                      {customerData.created_at ? new Date(customerData.created_at).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Assigned Agent</p>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <p>{agentName}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-semibold">₱{(customerData.total_spent || 0).toLocaleString()}</p>
                </div>
              </div>

              {customerData.notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{customerData.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Customer Location</p>
              <div ref={mapRef} className="h-[300px] rounded-md border">
                {!mapLoaded && (
                  <div className="h-full flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mr-2"></div>
                    <span>Loading map...</span>
                  </div>
                )}
                {mapLoaded && (!customerData.latitude || !customerData.longitude) && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <MapPin className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No location coordinates available for this customer.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push(`/admin/customers/edit/${id}`)}
                    >
                      Update Location
                    </Button>
                  </div>
                )}
              </div>
              {customerData.latitude && customerData.longitude && (
                <p className="text-xs text-muted-foreground">
                  Coordinates: {customerData.latitude.toFixed(6)}, {customerData.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Dashboard</CardTitle>
          <CardDescription>Order history and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="orders">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="pt-6">
              <CustomerOrders customerId={id} />
            </TabsContent>
            <TabsContent value="activity" className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>Activity log feature coming soon.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

