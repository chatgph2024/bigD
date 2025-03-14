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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ref, get, update } from "firebase/database"
import { db } from "@/lib/firebase"
import { Loader2, ArrowLeft, MapPin } from "lucide-react"

// Declare the google maps type
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface EditAgentFormProps {
  id: string
}

export function EditAgentForm({ id }: EditAgentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    area_covered: "",
    status: "active",
    enable_location: true,
    notes: "",
    sales_target: 50000,
    agent_id: "",
    latitude: 0,
    longitude: 0,
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
    const fetchAgentData = async () => {
      try {
        setIsLoading(true)
        const agentRef = ref(db, `agents/${id}`)
        const snapshot = await get(agentRef)

        if (snapshot.exists()) {
          const agentData = snapshot.val()
          setFormData({
            name: agentData.name || "",
            email: agentData.email || "",
            contact: agentData.contact || "",
            area_covered: agentData.area_covered || "",
            status: agentData.status || "active",
            enable_location: agentData.enable_location !== false, // Default to true if not set
            notes: agentData.notes || "",
            sales_target: agentData.sales_target || 50000,
            agent_id: agentData.agent_id || "",
            latitude: agentData.latitude || 0,
            longitude: agentData.longitude || 0,
          })
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

  // Initialize the map once it's loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      // Default to Manila if no coordinates
      const initialPosition =
        formData.latitude && formData.longitude
          ? { lat: formData.latitude, lng: formData.longitude }
          : { lat: 14.5995, lng: 120.9842 }

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

      // Set up autocomplete for the area covered input
      const areaInput = document.getElementById("area_covered") as HTMLInputElement
      if (areaInput) {
        const autocomplete = new window.google.maps.places.Autocomplete(areaInput)
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace()
          if (place.geometry) {
            const location = place.geometry.location

            // Update the map and marker
            googleMapRef.current.setCenter(location)
            markerRef.current.setPosition(location)

            // Update the form data
            setFormData((prev) => ({
              ...prev,
              area_covered: place.formatted_address || areaInput.value,
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value) || 0,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const findLocationOnMap = () => {
    if (!mapLoaded || !googleMapRef.current || !formData.area_covered) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: formData.area_covered }, (results: any[], status: string) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location
        googleMapRef.current.setCenter(location)
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
    setIsSubmitting(true)

    try {
      // Update agent data
      const agentRef = ref(db, `agents/${id}`)
      await update(agentRef, {
        ...formData,
        last_updated: new Date().toISOString(),
      })

      toast({
        title: "Agent Updated",
        description: "The agent has been updated successfully.",
      })

      // Redirect to the agent details page
      router.push(`/admin/agents/${id}`)
    } catch (error) {
      console.error("Error updating agent:", error)
      toast({
        title: "Error",
        description: "Failed to update agent. Please try again.",
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
        <span>Loading agent data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push(`/admin/agents/${id}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Agent Details
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Edit Agent</CardTitle>
              <CardDescription>Update agent information</CardDescription>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-md font-mono text-sm">
              Agent ID: {formData.agent_id}
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
                    placeholder="Enter agent's full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                  <Label htmlFor="area_covered">Area/Region Covered *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="area_covered"
                      name="area_covered"
                      placeholder="Enter area or region covered"
                      value={formData.area_covered}
                      onChange={handleChange}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={findLocationOnMap}
                      disabled={!formData.area_covered || !mapLoaded}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sales_target">Sales Target (₱) *</Label>
                    <Input
                      id="sales_target"
                      name="sales_target"
                      type="number"
                      placeholder="Enter sales target"
                      value={formData.sales_target}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable_location">Enable Location Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow tracking of agent's location during work hours
                    </p>
                  </div>
                  <Switch
                    id="enable_location"
                    checked={formData.enable_location}
                    onCheckedChange={(checked) => handleSwitchChange("enable_location", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Additional information about the agent"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Agent Location</Label>
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
                    <>Drag the marker or search for a location to set agent coordinates.</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/agents/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Agent...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

