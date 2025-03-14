"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

export function AdminSettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [darkMode, setDarkMode] = useState(false)

  const [systemSettings, setSystemSettings] = useState({
    companyName: "Your Company",
    supportEmail: "support@example.com",
    contactPhone: "+1 (555) 123-4567",
    maxAgents: "50",
    maxCustomersPerAgent: "100",
    enableRegistration: true,
    requireApproval: true,
    enableLocationTracking: true,
    mapApiKey: "AIzaSyBUFtAGwnxY8BtAYlVC5Hc_5C-K7LCFdJo",
    defaultMapCenter: "12.8797, 121.774",
    defaultMapZoom: "6",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enablePushNotifications: true,
    enableSmsNotifications: false,
    adminEmailRecipients: "admin@example.com",
    dailyReportTime: "06:00",
    notifyOnNewCustomer: true,
    notifyOnNewOrder: true,
    notifyOnAgentRegistration: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordMinLength: "8",
    requirePasswordReset: "90",
    twoFactorAuth: false,
    ipRestriction: "",
  })

  const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSystemSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSystemSwitchChange = (name: string, checked: boolean) => {
    setSystemSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSystemSelectChange = (name: string, value: string) => {
    setSystemSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNotificationSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationSwitchChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSecuritySettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSecuritySwitchChange = (name: string, checked: boolean) => {
    setSecuritySettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="system">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4 pt-4">
          <form onSubmit={handleSaveSettings}>
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure your system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={systemSettings.companyName}
                      onChange={handleSystemChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      name="supportEmail"
                      type="email"
                      value={systemSettings.supportEmail}
                      onChange={handleSystemChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={systemSettings.contactPhone}
                      onChange={handleSystemChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAgents">Maximum Agents</Label>
                    <Input
                      id="maxAgents"
                      name="maxAgents"
                      type="number"
                      value={systemSettings.maxAgents}
                      onChange={handleSystemChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxCustomersPerAgent">Max Customers Per Agent</Label>
                    <Input
                      id="maxCustomersPerAgent"
                      name="maxCustomersPerAgent"
                      type="number"
                      value={systemSettings.maxCustomersPerAgent}
                      onChange={handleSystemChange}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Agent Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new agents to register</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableRegistration}
                    onCheckedChange={(checked) => handleSystemSwitchChange("enableRegistration", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Admin Approval</Label>
                    <p className="text-sm text-muted-foreground">New agents require approval before activation</p>
                  </div>
                  <Switch
                    checked={systemSettings.requireApproval}
                    onCheckedChange={(checked) => handleSystemSwitchChange("requireApproval", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Location Tracking</Label>
                    <p className="text-sm text-muted-foreground">Track agent locations during work hours</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableLocationTracking}
                    onCheckedChange={(checked) => handleSystemSwitchChange("enableLocationTracking", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Map Settings</CardTitle>
                <CardDescription>Configure map display and functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mapApiKey">Google Maps API Key</Label>
                  <Input
                    id="mapApiKey"
                    name="mapApiKey"
                    value={systemSettings.mapApiKey}
                    onChange={handleSystemChange}
                  />
                  <p className="text-xs text-muted-foreground">Used for all map functionality. Keep this secure.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultMapCenter">Default Map Center (lat, lng)</Label>
                    <Input
                      id="defaultMapCenter"
                      name="defaultMapCenter"
                      value={systemSettings.defaultMapCenter}
                      onChange={handleSystemChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultMapZoom">Default Map Zoom Level</Label>
                    <Input
                      id="defaultMapZoom"
                      name="defaultMapZoom"
                      type="number"
                      min="1"
                      max="20"
                      value={systemSettings.defaultMapZoom}
                      onChange={handleSystemChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Map Type</Label>
                  <Select defaultValue="roadmap" onValueChange={(value) => handleSystemSelectChange("mapType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select map type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roadmap">Road Map</SelectItem>
                      <SelectItem value="satellite">Satellite</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="terrain">Terrain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save System Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 pt-4">
          <form onSubmit={handleSaveSettings}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how notifications are sent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => handleNotificationSwitchChange("enableEmailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send push notifications to mobile devices</p>
                  </div>
                  <Switch
                    checked={notificationSettings.enablePushNotifications}
                    onCheckedChange={(checked) => handleNotificationSwitchChange("enablePushNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send text message notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.enableSmsNotifications}
                    onCheckedChange={(checked) => handleNotificationSwitchChange("enableSmsNotifications", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmailRecipients">Admin Email Recipients</Label>
                  <Input
                    id="adminEmailRecipients"
                    name="adminEmailRecipients"
                    value={notificationSettings.adminEmailRecipients}
                    onChange={handleNotificationChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of email addresses to receive admin notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyReportTime">Daily Report Time</Label>
                  <Input
                    id="dailyReportTime"
                    name="dailyReportTime"
                    type="time"
                    value={notificationSettings.dailyReportTime}
                    onChange={handleNotificationChange}
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <h3 className="text-sm font-medium">Notification Triggers</h3>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyOnNewCustomer">New Customer Registration</Label>
                    <Switch
                      id="notifyOnNewCustomer"
                      checked={notificationSettings.notifyOnNewCustomer}
                      onCheckedChange={(checked) => handleNotificationSwitchChange("notifyOnNewCustomer", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyOnNewOrder">New Order Placed</Label>
                    <Switch
                      id="notifyOnNewOrder"
                      checked={notificationSettings.notifyOnNewOrder}
                      onCheckedChange={(checked) => handleNotificationSwitchChange("notifyOnNewOrder", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyOnAgentRegistration">New Agent Registration</Label>
                    <Switch
                      id="notifyOnAgentRegistration"
                      checked={notificationSettings.notifyOnAgentRegistration}
                      onCheckedChange={(checked) =>
                        handleNotificationSwitchChange("notifyOnAgentRegistration", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 pt-4">
          <form onSubmit={handleSaveSettings}>
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure system security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      name="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={handleSecurityChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      name="maxLoginAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={handleSecurityChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      name="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={handleSecurityChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirePasswordReset">Password Reset Period (days)</Label>
                    <Input
                      id="requirePasswordReset"
                      name="requirePasswordReset"
                      type="number"
                      value={securitySettings.requirePasswordReset}
                      onChange={handleSecurityChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of days before password reset is required (0 to disable)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSecuritySwitchChange("twoFactorAuth", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipRestriction">IP Restrictions</Label>
                  <Textarea
                    id="ipRestriction"
                    name="ipRestriction"
                    placeholder="Enter allowed IP addresses, one per line"
                    value={securitySettings.ipRestriction}
                    onChange={handleSecurityChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Restrict admin access to specific IP addresses. Leave blank to allow all IPs.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Security Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}

