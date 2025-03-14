"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ref, update, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { Loader2, MapPin, ArrowLeft } from "lucide-react"

// Declare the google maps type
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface EditCustomerFormProps {
  id: string
}

export function EditCustomerForm({ id }: EditCustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    location: "",
    latitude: 0,
    longitude: 0,
    notes: "",
    status: "active",
    agent_id: "",
    customer_id: "",
  })

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
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch customer data
        const customerRef = ref(db, `customers/${id}`)
        const customerSnapshot = await get(customerRef)

        if (!customerSnapshot.exists()) {
          toast({
            title: "Error",
            description: "Customer not found",
            variant: "destructive",
          })
          router.push("/admin/customers")
          return
        }

        const customerData = customerSnapshot.val()

        // Fetch agents for the dropdown
        const agentsRef = ref(db, "agents")
        const agentsSnapshot = await get(agentsRef)

        if (agentsSnapshot.exists()) {
          const agentsData = agentsSnapshot.val()
          const formattedAgents = Object.entries(agentsData).map(([id, data]: [string, any]) => ({
            id,
            name: data.name || "Unknown Agent",
          }))
          setAgents(formattedAgents)
        }

        // Set form data from customer data
        setFormData({
          name: customerData.name || "",
          email: customerData.email || "",
          contact: customerData.contact || "",
          location: customerData.location || "",
          latitude: customerData.latitude || 0,
          longitude: customerData.longitude || 0,
          notes: customerData.notes || "",
          status: customerData.status || "active",
          agent_id: customerData.agent_id || "",
          customer_id: customerData.customer_id || "",
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, router, toast])

  // Initialize the map once it's loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      // Default to Antipolo City if no coordinates
      const initialPosition =
        formData.latitude && formData.longitude
          ? { lat: formData.latitude, lng: formData.longitude }
          : { lat: 14.5865, lng: 121.1254 } // Antipolo City coordinates

      const mapOptions = {
        center: initialPosition,
        zoom: 15,
      }

      googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions)

      // Set up a marker that can be dragged
      markerRef.current = new window.google.maps.Marker({
        map: googleMapRef.current,
        position: initialPosition,
        draggable: true,
      })

      // Update the form data when the marker is dragged
      markerRef.current.addListener("dragend", () => {
        const position = markerRef.current.getPosition()
        setFormData((prev) => ({
          ...prev,
          latitude: position.lat(),
          longitude: position.lng(),
        }))
      })

      // Set up autocomplete for the location input
      const locationInput = document.getElementById("location") as HTMLInputElement
      if (locationInput) {
        const autocomplete = new window.google.maps.places.Autocomplete(locationInput, {
          fields: ["formatted_address", "geometry", "name"],
          componentRestrictions: { country: "ph" }, // Restrict to Philippines
        })

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace()
          if (place.geometry) {
            const location = place.geometry.location

            // Update the map and marker
            googleMapRef.current.setCenter(location)
            googleMapRef.current.setZoom(16) // Zoom in closer to show exact location
            markerRef.current.setPosition(location)

            // Update the form data
            setFormData((prev) => ({
              ...prev,
              location: place.formatted_address || locationInput.value,
              latitude: location.lat(),
              longitude: location.lng(),
            }))
          }
        })
      }
    }
  }, [mapLoaded, formData.latitude, formData.longitude])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const findLocationOnMap = () => {
    if (!mapLoaded || !googleMapRef.current || !formData.location) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: formData.location }, (results: any[], status: string) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location
        googleMapRef.current.setCenter(location)
        googleMapRef.current.setZoom(16) // Zoom in closer to show exact location
        markerRef.current.setPosition(location)

        setFormData((prev) => ({
          ...prev,
          latitude: location.lat(),
          longitude: location.lng(),
        }))
      } else {
        toast({
          title: "Location Error",
          description: "Couldn't find that location. Please try a different search.",
          variant: "destructive",
        })
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.latitude || !formData.longitude) {
      toast({
        title: "Warning",
        description: "Please select a location on the map.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Update the customer data
      const customerRef = ref(db, `customers/${id}`)

      await update(customerRef, {
        ...formData,
        last_updated: new Date().toISOString(),
      })

      toast({
        title: "Customer Updated",
        description: `The customer ${formData.name} has been updated successfully.`,
      })

      // Redirect to the customer detail page
      router.push(`/admin/customers/${id}`)
    } catch (error) {
      console.error("Error updating customer:", error)
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
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
        <span>Loading customer data...</span>
      </div>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <Button variant="outline" size="sm" className="mb-2" onClick={() => router.push(`/admin/customers/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Customer
            </Button>
            <CardTitle>Edit Customer</CardTitle>
            <CardDescription>Update customer information</CardDescription>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-mono text-sm">
            Customer ID: {formData.customer_id}
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter customer's full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
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

              <div className="space-y-2">
                <Label htmlFor="location">Location/Address *</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter location or address"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={findLocationOnMap}
                    disabled={!formData.location || !mapLoaded}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_id">Assigned Agent *</Label>
                <Select
                  value={formData.agent_id}
                  onValueChange={(value) => handleSelectChange("agent_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.length === 0 ? (
                      <SelectItem value="no-agents" disabled>
                        No agents available
                      </SelectItem>
                    ) : (
                      agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional information about the customer"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Customer Location</Label>
              <div ref={mapRef} className="h-[400px] rounded-md border" style={{ minHeight: "400px" }}>
                {!mapLoaded && (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span>Loading map...</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.latitude && formData.longitude ? (
                  <>
                    Location coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </>
                ) : (
                  <>Drag the marker or search for a location to set customer coordinates.</>
                )}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/customers/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Customer...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

