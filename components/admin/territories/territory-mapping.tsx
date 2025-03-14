"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Loader2,
  Search,
  MapPin,
  Users,
  UserCog,
  Maximize2,
  Download,
  Settings,
  Route,
  Share,
  ChevronDown,
  RefreshCw,
} from "lucide-react"

// Declare the google maps types
declare global {
  interface Window {
    google: any
    initMap: () => void
    MarkerClusterer: any
  }
}

export function TerritoryMapping() {
  const [isLoading, setIsLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState("all")
  const [filters, setFilters] = useState({
    showCustomers: true,
    showAgents: true,
    onlyWithLocation: true,
    showInactiveCustomers: false,
    showInactiveAgents: false,
  })
  const [mapOptions, setMapOptions] = useState({
    fullscreen: false,
    showClusters: true,
    mapType: "roadmap",
    zoom: 6,
    showTrafficLayer: false,
    showTransitLayer: false,
    showBicyclingLayer: false,
    clusterGridSize: 50,
  })
  const [refreshing, setRefreshing] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)
  const trafficLayerRef = useRef<any>(null)
  const transitLayerRef = useRef<any>(null)
  const bicyclingLayerRef = useRef<any>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get customer id from URL if available
  const highlightCustomerId = searchParams.get("customer")

  // Load the Google Maps script
  useEffect(() => {
    if (!mapLoaded) {
      window.initMap = () => {
        setMapLoaded(true)
      }

      // First load MarkerClusterer
      const clusterScript = document.createElement("script")
      clusterScript.src = "https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js"
      document.head.appendChild(clusterScript)

      // Then load Google Maps after MarkerClusterer is loaded
      clusterScript.onload = () => {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBUFtAGwnxY8BtAYlVC5Hc_5C-K7LCFdJo&libraries=places,drawing,geometry&callback=initMap`
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }

      return () => {
        window.initMap = () => {}
        const scripts = document.head.querySelectorAll(
          'script[src*="maps.googleapis.com"], script[src*="markerclusterer"]',
        )
        scripts.forEach((script) => document.head.removeChild(script))
      }
    }
  }, [mapLoaded])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch customers
        const customersRef = ref(db, "customers")
        const customersSnapshot = await get(customersRef)

        // Fetch agents
        const agentsRef = ref(db, "agents")
        const agentsSnapshot = await get(agentsRef)

        // Process customers data
        if (customersSnapshot.exists()) {
          const customersData = customersSnapshot.val()
          const agentsData = agentsSnapshot.exists() ? agentsSnapshot.val() : {}

          // Map agent IDs to agent data
          const agentMap: Record<string, any> = {}
          Object.entries(agentsData).forEach(([id, data]: [string, any]) => {
            agentMap[id] = data
          })

          // Format customers with location data
          const formattedCustomers = Object.entries(customersData)
            .map(([id, data]: [string, any]) => ({
              id,
              type: "customer",
              customer_id: data.customer_id || data.code || "CUST-?????",
              name: data.name || "Unknown Customer",
              location: data.location || "",
              latitude: data.latitude,
              longitude: data.longitude,
              agent_id: data.agent_id || "",
              agent_name: data.agent_id ? agentMap[data.agent_id]?.name || "Unknown Agent" : "Not Assigned",
              isHighlighted: id === highlightCustomerId,
              status: data.status || "active",
            }))
            .filter(
              (customer) =>
                (!filters.onlyWithLocation || (customer.latitude && customer.longitude)) &&
                (filters.showInactiveCustomers || customer.status === "active"),
            )

          setCustomers(formattedCustomers)
        }

        // Process agents data
        if (agentsSnapshot.exists()) {
          const agentsData = agentsSnapshot.val()

          // Format agents with location data
          const formattedAgents = Object.entries(agentsData)
            .map(([id, data]: [string, any]) => ({
              id,
              type: "agent",
              agent_id: data.agent_id || "BIGD-?????",
              name: data.name || "Unknown Agent",
              location: data.area_covered || "",
              latitude: data.latitude,
              longitude: data.longitude,
              customer_count: data.customers_count || 0,
              status: data.status || "active",
            }))
            .filter(
              (agent) =>
                (!filters.onlyWithLocation || (agent.latitude && agent.longitude)) &&
                (filters.showInactiveAgents || agent.status === "active"),
            )

          setAgents(formattedAgents)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load location data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast, highlightCustomerId, filters.onlyWithLocation, filters.showInactiveCustomers, filters.showInactiveAgents])

  // Initialize the map
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      // Clear existing markers
      if (markersRef.current) {
        markersRef.current.forEach((marker) => marker.setMap(null))
        markersRef.current = []
      }

      // Default center on Philippines
      const defaultCenter = { lat: 12.8797, lng: 121.774 }
      const mapOptionsObj = {
        center: defaultCenter,
        zoom: mapOptions.zoom,
        mapTypeId: (window.google.maps.MapTypeId as any)[mapOptions.mapType.toUpperCase()],
        mapTypeControl: true,
        fullscreenControl: false,
        streetViewControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      }

      // Create map
      googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptionsObj)
      infoWindowRef.current = new window.google.maps.InfoWindow()

      // Initialize layers
      trafficLayerRef.current = new window.google.maps.TrafficLayer()
      transitLayerRef.current = new window.google.maps.TransitLayer()
      bicyclingLayerRef.current = new window.google.maps.BicyclingLayer()

      // Set layers based on options
      if (mapOptions.showTrafficLayer) {
        trafficLayerRef.current.setMap(googleMapRef.current)
      } else {
        trafficLayerRef.current.setMap(null)
      }

      if (mapOptions.showTransitLayer) {
        transitLayerRef.current.setMap(googleMapRef.current)
      } else {
        transitLayerRef.current.setMap(null)
      }

      if (mapOptions.showBicyclingLayer) {
        bicyclingLayerRef.current.setMap(googleMapRef.current)
      } else {
        bicyclingLayerRef.current.setMap(null)
      }

      // Create marker clusters
      const markerClusterer = mapOptions.showClusters
        ? new window.MarkerClusterer(googleMapRef.current, [], {
            imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            gridSize: mapOptions.clusterGridSize,
            minimumClusterSize: 3,
          })
        : null

      const bounds = new window.google.maps.LatLngBounds()
      let hasValidLocations = false
      const customerMarkers = []
      const agentMarkers = []

      // Add customer markers
      if (filters.showCustomers) {
        const filteredCustomers = customers.filter(
          (customer) =>
            (selectedAgentId === "all" || customer.agent_id === selectedAgentId) &&
            (searchTerm === "" ||
              customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase())),
        )

        filteredCustomers.forEach((customer) => {
          if (customer.latitude && customer.longitude) {
            const position = {
              lat: customer.latitude,
              lng: customer.longitude,
            }

            const marker = new window.google.maps.Marker({
              position,
              title: customer.name,
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(32, 32),
              },
              animation: customer.isHighlighted ? window.google.maps.Animation.BOUNCE : null,
            })

            const infoContent = `
              <div style="padding: 5px; max-width: 200px;">
                <h3 style="margin: 0 0 5px; font-weight: bold;">${customer.name}</h3>
                <p style="margin: 0 0 3px;">${customer.location}</p>
                <p style="margin: 0 0 3px; color: #666;">ID: ${customer.customer_id}</p>
                <p style="margin: 0; color: #666;">Agent: ${customer.agent_name}</p>
                <p style="margin: 0; color: ${customer.status === "active" ? "#22c55e" : "#ef4444"};">
                  Status: ${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </p>
              </div>
            `

            marker.addListener("click", () => {
              infoWindowRef.current.setContent(infoContent)
              infoWindowRef.current.open(googleMapRef.current, marker)
            })

            customerMarkers.push(marker)
            bounds.extend(position)
            hasValidLocations = true

            // If this is the highlighted customer, open info window automatically
            if (customer.isHighlighted) {
              infoWindowRef.current.setContent(infoContent)
              infoWindowRef.current.open(googleMapRef.current, marker)
              googleMapRef.current.setCenter(position)
              googleMapRef.current.setZoom(15)
            }
          }
        })
      }

      // Add agent markers
      if (filters.showAgents) {
        const filteredAgents = agents.filter(
          (agent) =>
            (selectedAgentId === "all" || agent.id === selectedAgentId) &&
            (searchTerm === "" ||
              agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              agent.agent_id.toLowerCase().includes(searchTerm.toLowerCase())),
        )

        filteredAgents.forEach((agent) => {
          if (agent.latitude && agent.longitude) {
            const position = {
              lat: agent.latitude,
              lng: agent.longitude,
            }

            const marker = new window.google.maps.Marker({
              position,
              title: agent.name,
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(32, 32),
              },
            })

            const infoContent = `
              <div style="padding: 5px; max-width: 200px;">
                <h3 style="margin: 0 0 5px; font-weight: bold;">${agent.name}</h3>
                <p style="margin: 0 0 3px;">${agent.location}</p>
                <p style="margin: 0 0 3px; color: #666;">ID: ${agent.agent_id}</p>
                <p style="margin: 0 0 3px; color: #666;">Customers: ${agent.customer_count}</p>
                <p style="margin: 0; color: ${agent.status === "active" ? "#22c55e" : "#ef4444"};">
                  Status: ${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </p>
              </div>
            `

            marker.addListener("click", () => {
              infoWindowRef.current.setContent(infoContent)
              infoWindowRef.current.open(googleMapRef.current, marker)
            })

            agentMarkers.push(marker)
            bounds.extend(position)
            hasValidLocations = true
          }
        })
      }

      // Add markers to the map or clusterer
      if (mapOptions.showClusters && markerClusterer) {
        if (customerMarkers.length > 0) markerClusterer.addMarkers(customerMarkers)
        if (agentMarkers.length > 0) markerClusterer.addMarkers(agentMarkers)

        // Store all markers for reference
        markersRef.current = [...customerMarkers, ...agentMarkers]
      } else {
        // Add markers directly to the map
        customerMarkers.forEach((marker) => marker.setMap(googleMapRef.current))
        agentMarkers.forEach((marker) => marker.setMap(googleMapRef.current))

        // Store all markers for reference
        markersRef.current = [...customerMarkers, ...agentMarkers]
      }

      // Adjust map bounds to show all markers
      if (hasValidLocations && !highlightCustomerId) {
        googleMapRef.current.fitBounds(bounds)
      }

      // Add fullscreen control
      const fullscreenControl = document.createElement("div")
      fullscreenControl.className = "custom-map-control"
      fullscreenControl.innerHTML = `
        <button class="bg-white p-2 rounded-md shadow-md" title="Toggle fullscreen">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
      `
      fullscreenControl.addEventListener("click", () => {
        setMapOptions((prev) => ({ ...prev, fullscreen: !prev.fullscreen }))
      })

      googleMapRef.current.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(fullscreenControl)

      // Add drawing tools
      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            window.google.maps.drawing.OverlayType.MARKER,
            window.google.maps.drawing.OverlayType.CIRCLE,
            window.google.maps.drawing.OverlayType.POLYGON,
            window.google.maps.drawing.OverlayType.POLYLINE,
            window.google.maps.drawing.OverlayType.RECTANGLE,
          ],
        },
      })
      drawingManager.setMap(googleMapRef.current)
    }
  }, [mapLoaded, customers, agents, searchTerm, selectedAgentId, filters, highlightCustomerId, mapOptions])

  const handleFilterChange = (key: string, value: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleRefreshData = async () => {
    setRefreshing(true)
    try {
      // Fetch customers
      const customersRef = ref(db, "customers")
      const customersSnapshot = await get(customersRef)

      // Fetch agents
      const agentsRef = ref(db, "agents")
      const agentsSnapshot = await get(agentsRef)

      // Process data (reusing the same logic from the useEffect)
      if (customersSnapshot.exists()) {
        const customersData = customersSnapshot.val()
        const agentsData = agentsSnapshot.exists() ? agentsSnapshot.val() : {}

        // Map agent IDs to agent data
        const agentMap: Record<string, any> = {}
        Object.entries(agentsData).forEach(([id, data]: [string, any]) => {
          agentMap[id] = data
        })

        // Format customers with location data
        const formattedCustomers = Object.entries(customersData)
          .map(([id, data]: [string, any]) => ({
            id,
            type: "customer",
            customer_id: data.customer_id || data.code || "CUST-?????",
            name: data.name || "Unknown Customer",
            location: data.location || "",
            latitude: data.latitude,
            longitude: data.longitude,
            agent_id: data.agent_id || "",
            agent_name: data.agent_id ? agentMap[data.agent_id]?.name || "Unknown Agent" : "Not Assigned",
            isHighlighted: id === highlightCustomerId,
            status: data.status || "active",
          }))
          .filter(
            (customer) =>
              (!filters.onlyWithLocation || (customer.latitude && customer.longitude)) &&
              (filters.showInactiveCustomers || customer.status === "active"),
          )

        setCustomers(formattedCustomers)
      }

      // Process agents data
      if (agentsSnapshot.exists()) {
        const agentsData = agentsSnapshot.val()

        // Format agents with location data
        const formattedAgents = Object.entries(agentsData)
          .map(([id, data]: [string, any]) => ({
            id,
            type: "agent",
            agent_id: data.agent_id || "BIGD-?????",
            name: data.name || "Unknown Agent",
            location: data.area_covered || "",
            latitude: data.latitude,
            longitude: data.longitude,
            customer_count: data.customers_count || 0,
            status: data.status || "active",
          }))
          .filter(
            (agent) =>
              (!filters.onlyWithLocation || (agent.latitude && agent.longitude)) &&
              (filters.showInactiveAgents || agent.status === "active"),
          )

        setAgents(formattedAgents)
      }

      toast({
        title: "Data Refreshed",
        description: "Map data has been updated successfully.",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: "Failed to refresh map data",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading map data...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Territory Mapping</h2>
        <Button variant="outline" size="sm" onClick={handleRefreshData} disabled={refreshing}>
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Customer & Agent Locations</CardTitle>
          <CardDescription>View and manage customer and agent territories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="layers">Map Layers</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4 pt-2">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showCustomers"
                    checked={filters.showCustomers}
                    onCheckedChange={(checked) => handleFilterChange("showCustomers", checked)}
                  />
                  <Label htmlFor="showCustomers" className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Show Customers</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showAgents"
                    checked={filters.showAgents}
                    onCheckedChange={(checked) => handleFilterChange("showAgents", checked)}
                  />
                  <Label htmlFor="showAgents" className="flex items-center gap-1">
                    <UserCog className="h-4 w-4 text-red-500" />
                    <span>Show Agents</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="onlyWithLocation"
                    checked={filters.onlyWithLocation}
                    onCheckedChange={(checked) => handleFilterChange("onlyWithLocation", checked)}
                  />
                  <Label htmlFor="onlyWithLocation" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Only with coordinates</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showInactiveCustomers"
                    checked={filters.showInactiveCustomers}
                    onCheckedChange={(checked) => handleFilterChange("showInactiveCustomers", checked)}
                  />
                  <Label htmlFor="showInactiveCustomers">Show Inactive Customers</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showInactiveAgents"
                    checked={filters.showInactiveAgents}
                    onCheckedChange={(checked) => handleFilterChange("showInactiveAgents", checked)}
                  />
                  <Label htmlFor="showInactiveAgents">Show Inactive Agents</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layers" className="space-y-4 pt-2">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showTrafficLayer"
                    checked={mapOptions.showTrafficLayer}
                    onCheckedChange={(checked) => setMapOptions((prev) => ({ ...prev, showTrafficLayer: checked }))}
                  />
                  <Label htmlFor="showTrafficLayer">Show Traffic</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showTransitLayer"
                    checked={mapOptions.showTransitLayer}
                    onCheckedChange={(checked) => setMapOptions((prev) => ({ ...prev, showTransitLayer: checked }))}
                  />
                  <Label htmlFor="showTransitLayer">Show Transit</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showBicyclingLayer"
                    checked={mapOptions.showBicyclingLayer}
                    onCheckedChange={(checked) => setMapOptions((prev) => ({ ...prev, showBicyclingLayer: checked }))}
                  />
                  <Label htmlFor="showBicyclingLayer">Show Bicycling</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showClusters"
                    checked={mapOptions.showClusters}
                    onCheckedChange={(checked) => setMapOptions((prev) => ({ ...prev, showClusters: checked }))}
                  />
                  <Label htmlFor="showClusters">Group nearby markers</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="clusterGridSize">Cluster Size</Label>
                  <span className="text-sm text-muted-foreground">{mapOptions.clusterGridSize}px</span>
                </div>
                <Slider
                  id="clusterGridSize"
                  min={20}
                  max={100}
                  step={5}
                  value={[mapOptions.clusterGridSize]}
                  onValueChange={(value) => setMapOptions((prev) => ({ ...prev, clusterGridSize: value[0] }))}
                />
                <p className="text-xs text-muted-foreground">
                  Smaller values create more clusters, larger values create fewer clusters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Map Type</Label>
                <Select
                  value={mapOptions.mapType}
                  onValueChange={(value) => setMapOptions((prev) => ({ ...prev, mapType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Map type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roadmap">Road Map</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-4 pt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="outline" onClick={() => setMapOptions((prev) => ({ ...prev, fullscreen: true }))}>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </Button>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>

                <Button variant="outline">
                  <Route className="h-4 w-4 mr-2" />
                  Route Planner
                </Button>

                <Button variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share Map
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Use the drawing tools in the map to create custom shapes and measurements.</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-2">
            <div className="flex gap-4 mb-2">
              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Customers: {filters.showCustomers ? customers.length : 0}
              </Badge>
              <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Agents: {filters.showAgents ? agents.length : 0}
              </Badge>
            </div>

            <div
              ref={mapRef}
              className={`w-full rounded-md border transition-all duration-300 ${
                mapOptions.fullscreen
                  ? "fixed top-0 left-0 right-0 bottom-0 z-50 h-screen rounded-none border-none"
                  : "h-[600px]"
              }`}
            >
              {!mapLoaded && (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <span>Loading map...</span>
                </div>
              )}

              {mapOptions.fullscreen && (
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setMapOptions((prev) => ({ ...prev, fullscreen: false }))}
                  >
                    Exit Fullscreen
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 border rounded-md bg-muted/30">
            <h4 className="text-sm font-medium mb-2">Map Legend</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm">Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">Agents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-xs">5+</div>
                <span className="text-sm">Marker cluster (multiple locations)</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Options
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Map Settings</h4>
                <div className="space-y-2">
                  <Label>Zoom Level</Label>
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={[mapOptions.zoom]}
                    onValueChange={(value) => setMapOptions((prev) => ({ ...prev, zoom: value[0] }))}
                  />
                  <div className="flex justify-between">
                    <span className="text-xs">1 (World)</span>
                    <span className="text-xs">{mapOptions.zoom}</span>
                    <span className="text-xs">20 (Buildings)</span>
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => googleMapRef.current?.setZoom(mapOptions.zoom)}>
                  Apply Zoom
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardFooter>
      </Card>
    </div>
  )
}

