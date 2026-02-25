"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Store, Plug, Bell, Shield, CreditCard, Mail, BarChart3, Save, Loader2, Truck, Coins, User, Camera, Sparkles, Bot, Zap } from "lucide-react"
import { useGetAppSettingsQuery, useUpdateAppSettingsMutation, useGetAllUsersQuery, useUpdateUserRoleMutation } from "@/redux/api/adminApi"
import { useUpdateProfileMutation } from "@/redux/api/userApi"
import { useAppSelector } from "@/redux/hooks"
import toast from "react-hot-toast"
import SettingsHeader from "./settings-header"

const integrations = [
  { name: "Stripe", type: "Payment", status: "Connected", icon: CreditCard },
  { name: "PayPal", type: "Payment", status: "Disconnected", icon: CreditCard },
  { name: "Google Analytics", type: "Analytics", status: "Connected", icon: BarChart3 },
  { name: "Email Service", type: "Email", status: "Connected", icon: Mail },
  { name: "Shopify", type: "E-commerce", status: "Disconnected", icon: Store },
]

export default function SettingsTabs() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "store"
  const { user } = useAppSelector((state) => state.user)

  const { data: settings, isLoading: isSettingsLoading } = useGetAppSettingsQuery()
  const [updateSettings, { isLoading: isUpdating }] = useUpdateAppSettingsMutation()
  const { data: users, isLoading: isUsersLoading } = useGetAllUsersQuery()
  const [updateUserRole] = useUpdateUserRoleMutation()
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation()

  const [formData, setFormData] = useState({
    codMinimumAmount: 0,
    codEnabled: true,
    deliveryCharges: 40,
    freeDeliveryThreshold: 500,
    termsAndConditions: "",
    storeName: "My E-commerce Store",
    storeUrl: "https://mystore.com",
    currency: "usd",
    timezone: "utc",
    coinEarnRate: 0.1,
    coinValue: 1,
    helpLineNumber: "",
    supportEmail: "",
    orderEmailEnabled: false,
    maxCoinUsagePercentage: 20,
    stripeEnabled: false,
    googleAnalyticsEnabled: false,
    emailEnabled: false,
    emailService: "smtp",
    aiChatEnabled: true,
    aiSuggestionsEnabled: true,
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    sendgridApiKey: ""
  })

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  })

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        ...settings,
        // Ensure defaults if missing from API
        codMinimumAmount: settings.codMinimumAmount || 0,
        codEnabled: settings.codEnabled ?? true,
        deliveryCharges: settings.deliveryCharges || 40,
        freeDeliveryThreshold: settings.freeDeliveryThreshold || 500,
        termsAndConditions: settings.termsAndConditions || "",
        coinEarnRate: settings.coinEarnRate || 0.1,
        coinValue: settings.coinValue || 1,
        helpLineNumber: settings.helpLineNumber || "",
        supportEmail: settings.supportEmail || "",
        orderEmailEnabled: settings.orderEmailEnabled ?? false,
        maxCoinUsagePercentage: settings.maxCoinUsagePercentage || 20,
        stripeEnabled: settings.stripeEnabled ?? false,
        googleAnalyticsEnabled: settings.googleAnalyticsEnabled ?? false,
        emailEnabled: settings.emailEnabled ?? false,
        emailService: settings.emailService || "smtp",
        aiChatEnabled: settings.aiChatEnabled ?? true,
        aiSuggestionsEnabled: settings.aiSuggestionsEnabled ?? true,
        smtpHost: settings.smtpHost || "",
        smtpPort: settings.smtpPort || 587,
        smtpUser: settings.smtpUser || "",
        smtpPassword: settings.smtpPassword || "",
        sendgridApiKey: settings.sendgridApiKey || ""
      }))
    }
  }, [settings])

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar?.url || "",
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) : value,
    }))
  }

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleSave = async () => {
    try {
      const res = await updateSettings(formData).unwrap()
      toast.success(res?.message || "Settings updated successfully")
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update settings")
    }
  }

  const handleProfileSave = async () => {
    try {
      const res = await updateProfile({
        name: profileData.name,
        phone: profileData.phone
      }).unwrap()
      toast.success(res?.message || "Profile updated successfully")
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile")
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await updateUserRole({ id: userId, role: newRole }).unwrap()
      toast.success(res?.message || "User role updated")
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update role")
    }
  }

  if (isSettingsLoading) {
    return (
      <div className="space-y-6">
        <SettingsHeader isUpdating={false} />
        <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsHeader onSave={handleSave} isUpdating={isUpdating} />

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 sm:gap-2 bg-transparent mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="ai" className="gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Bot className="w-3 h-3" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Profile
              </CardTitle>
              <p className="text-sm text-muted-foreground">Manage your personal information and account settings</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback className="text-2xl">{profileData.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="outline" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background shadow-sm">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold">{profileData.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{user?.role} Account</p>
                  <p className="text-xs text-muted-foreground">Registered on {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profileData.name} onChange={handleProfileInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={profileData.phone} onChange={handleProfileInputChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={profileData.email} onChange={handleProfileInputChange} disabled />
                  <p className="text-xs text-muted-foreground">Email change is disabled for security reasons.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={isUpdatingProfile} className="gap-2">
                  {isUpdatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Manage team members and their permissions</p>
                </div>
                <Button size="sm">Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tags</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((user: any) => (
                      <tr key={user._id} className="border-b border-border">
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar?.url} />
                              <AvatarFallback className="text-xs">{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <Select
                            defaultValue={user.role}
                            onValueChange={(val) => handleRoleChange(user._id, val)}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="seller">Seller</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {user.tags?.map((tag: string) => (
                              <Badge key={tag} variant="outline" className={`text-[10px] px-1 py-0 h-5 
                                ${tag === 'New' ? 'text-blue-600 border-blue-200 bg-blue-50' : ''}
                                ${tag === 'Frequent' ? 'text-purple-600 border-purple-200 bg-purple-50' : ''}
                                ${tag === 'High Value' ? 'text-amber-600 border-amber-200 bg-amber-50' : ''}
                                ${tag === 'Inactive' ? 'text-gray-600 border-gray-200 bg-gray-50' : ''}
                              `}>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" value={formData.storeName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-url">Store URL</Label>
                  <Input id="store-url" value={formData.storeUrl} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(val) => setFormData(p => ({ ...p, currency: val }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD - US Dollar</SelectItem>
                        <SelectItem value="inr">INR - Rupee</SelectItem>
                        <SelectItem value="eur">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(val) => setFormData(p => ({ ...p, timezone: val }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="ist">IST - India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">Detail displayed to customers for support</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="helpLineNumber">Helpline Number</Label>
                  <Input
                    id="helpLineNumber"
                    value={formData.helpLineNumber}
                    onChange={handleInputChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={formData.supportEmail}
                    onChange={handleInputChange}
                    placeholder="support@store.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailService">Email Service Provider</Label>
                  <Select
                    value={formData.emailService}
                    onValueChange={(val) => setFormData(p => ({ ...p, emailService: val as "smtp" | "sendgrid" }))}
                  >
                    <SelectTrigger id="emailService">
                      <SelectValue placeholder="Select email service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Select the email service provider to use for transactional emails.</p>
                </div>

                {formData.emailService === "smtp" && (
                  <div className="space-y-4 pt-2 border-t border-muted">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          value={formData.smtpHost}
                          onChange={handleInputChange}
                          placeholder="e.g. smtp.example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={formData.smtpPort}
                          onChange={handleInputChange}
                          placeholder="e.g. 587"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUser">SMTP User</Label>
                        <Input
                          id="smtpUser"
                          value={formData.smtpUser}
                          onChange={handleInputChange}
                          placeholder="your-email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">SMTP Password</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={formData.smtpPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.emailService === "sendgrid" && (
                  <div className="space-y-4 pt-2 border-t border-muted">
                    <div className="space-y-2">
                      <Label htmlFor="sendgridApiKey">SendGrid API Key</Label>
                      <Input
                        id="sendgridApiKey"
                        type="password"
                        value={formData.sendgridApiKey}
                        onChange={handleInputChange}
                        placeholder="SG.xxxxxxxx................"
                      />
                      <p className="text-xs text-muted-foreground">Enter your SendGrid API key with mail sending permissions.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment & COD Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="codEnabled">Enable COD</Label>
                    <p className="text-xs text-muted-foreground">Allow Cash on Delivery as a payment option</p>
                  </div>
                  <Switch
                    id="codEnabled"
                    checked={formData.codEnabled}
                    onCheckedChange={(checked) => handleSwitchChange("codEnabled", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codMinimumAmount">Minimum Amount for COD (₹)</Label>
                  <Input
                    id="codMinimumAmount"
                    type="number"
                    value={formData.codMinimumAmount}
                    onChange={handleInputChange}
                    placeholder="e.g. 500"
                  />
                  <p className="text-xs text-muted-foreground">COD will be disabled if order total is less than this</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termsAndConditions">COD Terms & Conditions</Label>
                  <Textarea
                    id="termsAndConditions"
                    value={formData.termsAndConditions}
                    onChange={handleInputChange}
                    placeholder="Enter T&C for COD..."
                    className="min-h-[100px]"
                  />
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="stripeEnabled">Enable Stripe Payment</Label>
                    <p className="text-xs text-muted-foreground">Accept credit card payments via Stripe</p>
                  </div>
                  <Switch
                    id="stripeEnabled"
                    checked={formData.stripeEnabled}
                    onCheckedChange={(checked) => handleSwitchChange("stripeEnabled", checked)}
                  />
                </div>


              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping & Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryCharges">Default Delivery Charges (₹)</Label>
                  <Input
                    id="deliveryCharges"
                    type="number"
                    value={formData.deliveryCharges}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (₹)</Label>
                  <Input
                    id="freeDeliveryThreshold"
                    type="number"
                    value={formData.freeDeliveryThreshold}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Free shipping for orders above this amount</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  Reward System (Coins)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coinEarnRate">Coin Earn Rate (0.1 = 10%)</Label>
                  <Input
                    id="coinEarnRate"
                    type="number"
                    step="0.01"
                    value={formData.coinEarnRate}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Percentage of order total awarded as coins</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coinValue">Coin Value (₹)</Label>
                  <Input
                    id="coinValue"
                    type="number"
                    step="0.01"
                    value={formData.coinValue}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Monetary value of 1 coin in your currency</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCoinUsagePercentage">Max Coin Usage (% of User Balance)</Label>
                  <Input
                    id="maxCoinUsagePercentage"
                    type="number"
                    value={formData.maxCoinUsagePercentage}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Maximum percentage of a user's total coin balance that can be used in a single order (e.g., 20)</p>
                </div>
              </CardContent>
            </Card>





          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plug className="w-5 h-5" />
                Integrations
              </CardTitle>
              <p className="text-sm text-muted-foreground">Connect your store with third-party services</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => {
                  const Icon = integration.icon
                  const isGA = integration.name === "Google Analytics";
                  const isStripe = integration.name === "Stripe";
                  const isEmail = integration.name === "Email Service";
                  const isConnected =
                    (isGA && formData.googleAnalyticsEnabled) ||
                    (isStripe && formData.stripeEnabled) ||
                    (isEmail && formData.emailEnabled) ||
                    (!isGA && !isStripe && !isEmail && integration.status === "Connected");

                  return (
                    <div
                      key={integration.name}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Icon className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-muted-foreground">{integration.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              isConnected
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {isConnected ? "Connected" : "Disconnected"}
                          </Badge>
                          {!isGA && !isStripe && !isEmail && (
                            <Button variant="outline" size="sm">
                              {integration.status === "Connected" ? "Configure" : "Connect"}
                            </Button>
                          )}
                          {isStripe && (
                            <Switch
                              id="stripe-enabled"
                              checked={formData.stripeEnabled}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                stripeEnabled: checked
                              }))}
                            />
                          )}
                          {isEmail && (
                            <Switch
                              id="email-enabled"
                              checked={formData.emailEnabled}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                emailEnabled: checked
                              }))}
                            />
                          )}
                        </div>
                      </div>

                      {isGA && (
                        <div className="p-4 bg-muted/30 border-t border-border space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="ga-enabled">Enable Google Analytics</Label>
                            <Switch
                              id="ga-enabled"
                              checked={formData.googleAnalyticsEnabled || false}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                googleAnalyticsEnabled: checked
                              }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">Configure when and how you receive notifications</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="order-email-enabled">Send Order Confirmation Email</Label>
                      <p className="text-sm text-muted-foreground">Automatically send email to customer when order is placed</p>
                    </div>
                    <Switch
                      id="orderEmailEnabled"
                      checked={formData.orderEmailEnabled}
                      onCheckedChange={(checked) => handleSwitchChange("orderEmailEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="new-orders">New Orders</Label>
                      <p className="text-sm text-muted-foreground">Get notified when new orders are placed</p>
                    </div>
                    <Switch id="new-orders" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bot className="w-24 h-24 text-indigo-500" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-lg">AI Chat Assistant</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Enable or disable the interactive AI assistant for customers and admins.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">User AI Chat Control</Label>
                    <p className="text-xs text-muted-foreground">Toggle the visibility of the floating chatbot for all users</p>
                  </div>
                  <Switch
                    checked={formData.aiChatEnabled}
                    onCheckedChange={(checked) => handleSwitchChange("aiChatEnabled", checked)}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>

                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Chat Capabilities
                  </h4>
                  <ul className="text-xs space-y-2 text-indigo-700 dark:text-indigo-400">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-indigo-400" />
                      Assists customers with product queries
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-indigo-400" />
                      Provides admin with real-time store analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-indigo-400" />
                      Handles basic customer support requests
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-24 h-24 text-amber-500" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-lg">AI Smart Suggestions</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Power your product pages with Gemini-driven cross-selling recommendations.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Product Page Suggestions</Label>
                    <p className="text-xs text-muted-foreground">Show similar and frequently bought together items</p>
                  </div>
                  <Switch
                    checked={formData.aiSuggestionsEnabled}
                    onCheckedChange={(checked) => handleSwitchChange("aiSuggestionsEnabled", checked)}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>

                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Personalization Perks
                  </h4>
                  <ul className="text-xs space-y-2 text-amber-700 dark:text-amber-400">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-400" />
                      Automatic similar product matching
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-400" />
                      Context-aware buying reasons for users
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-400" />
                      Increases average order value (AOV)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch id="two-factor" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
