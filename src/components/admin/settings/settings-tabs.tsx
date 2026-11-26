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
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Store, Plug, Bell, Shield, CreditCard, Mail, BarChart3, Save, Loader2, Truck, Coins, User, Camera, Sparkles, Bot, Zap, FileText, Building2, CheckCircle2, AlertCircle } from "lucide-react"
import { useGetAppSettingsQuery, useUpdateAppSettingsMutation, useGetAllUsersQuery } from "@/redux/api/adminApi"
import { useUpdateProfileMutation } from "@/redux/api/userApi"
import { useAppSelector } from "@/redux/hooks"
import toast from "react-hot-toast"
import SettingsHeader from "./settings-header"
import PrivacyRequestsPanel from "./privacy-requests-panel"
import { INDIAN_STATES_GST, validateGSTIN, extractStateFromGSTIN, extractPanFromGSTIN } from "@/lib/gst-utils"

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
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation()

  const [formData, setFormData] = useState({
    codMinimumAmount: 0,
    codEnabled: true,
    partialCodEnabled: false,
    partialCodType: "fixed" as "fixed" | "percentage",
    partialCodAmount: 500,
    partialCodMinOrderAmount: 0,
    deliveryCharges: 40,
    freeDeliveryThreshold: 500,
    termsAndConditions: "",
    storeName: "My E-commerce Store",
    storeUrl: "https://mystore.com",
    currency: "inr",
    timezone: "ist",
    coinEarnRate: 10,
    coinValue: 1,
    helpLineNumber: "",
    supportEmail: "",
    orderEmailEnabled: false,
    maxCoinUsagePercentage: 20,
    stripeEnabled: false,
    googleAnalyticsEnabled: false,
    emailEnabled: false,
    emailService: "brevo",
    aiChatEnabled: true,
    aiSuggestionsEnabled: true,
    brevoApiKey: "",
    cancellationPolicy: "",
    refundPolicy: "",
    aiCallCodVerificationEnabled: false,
    aiCallReviewCollectionEnabled: false,
    aiCallAbandonedCartEnabled: false,
    aiCallSupportEnabled: false,
    aiReviewCondition: "Provide a Video Review",
    aiReviewRewardType: "Percentage",
    aiReviewRewardValue: 50,
    whatsappSupportEnabled: false,
    whatsappToken: "",
    whatsappPhoneNumberId: "",
    whatsappVerifyToken: "",
    whatsappAppSecret: "",
    taxEnabled: true,
    taxRate: 0,
    gstRate: 18,
    shippingGstRate: 18,
    taxPricingMode: "inclusive" as "inclusive" | "exclusive",
    gatewayFeeRate: 2,
    isGstRegistered: true,
    companyLegalName: "Aura Store Retail Pvt. Ltd.",
    companyAddress: "Plot No. 42, Commercial Complex, Okhla Industrial Area, Phase-III",
    companyCity: "New Delhi",
    companyState: "Delhi",
    companyStateCode: "07",
    companyPincode: "110020",
    companyCountry: "India",
    gstin: "07AABCS1429B1ZW",
    cin: "U72900DL2024PTC123456",
    panNumber: "AABCS1429B",
    defaultHsnCode: "9506",
    authorizedSignatoryName: "Finance & Accounts Dept.",
    authorizedSignatoryTitle: "Authorized Signatory",
    invoicePrefix: "INV-",
    isDigitalSignatureEnabled: true,
    authorizedSignatureImage: "",
    shippingProvider: "manual" as "manual" | "shiprocket" | "delhivery",
    shiprocketEnabled: false,
    shiprocketEmail: "",
    shiprocketPassword: "",
    shiprocketChannelId: "",
    delhiveryEnabled: false,
    delhiveryApiToken: "",
    delhiveryWarehouseName: "",
    defaultBoxLength: 20,
    defaultBoxBreadth: 15,
    defaultBoxHeight: 10,
    defaultBoxWeight: 0.5,
    showCookieBanner: false,
    grievanceOfficerName: "Data Protection & Grievance Officer",
    grievanceOfficerEmail: "privacy@aurastore.in",
    grievanceOfficerPhone: "",
    dpdpPolicyVersion: "v1.0",
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
        storeName: settings.storeName || prev.storeName || "My E-commerce Store",
        storeUrl: settings.storeUrl || prev.storeUrl || "https://mystore.com",
        currency: settings.currency || prev.currency || "inr",
        timezone: settings.timezone || prev.timezone || "ist",
        codMinimumAmount: settings.codMinimumAmount || 0,
        codEnabled: settings.codEnabled ?? true,
        partialCodEnabled: settings.partialCodEnabled ?? false,
        partialCodType: settings.partialCodType || "fixed",
        partialCodAmount: settings.partialCodAmount ?? 500,
        partialCodMinOrderAmount: settings.partialCodMinOrderAmount ?? 0,
        deliveryCharges: settings.deliveryCharges || 40,
        freeDeliveryThreshold: settings.freeDeliveryThreshold || 500,
        termsAndConditions: settings.termsAndConditions || "",
        coinEarnRate: (() => {
          const raw = Number(settings.coinEarnRate ?? 10);
          return raw <= 1 && raw > 0 && raw !== 1 ? Math.round(raw * 100) : raw;
        })(),
        coinValue: settings.coinValue || 1,
        helpLineNumber: settings.helpLineNumber || "",
        supportEmail: settings.supportEmail || "",
        orderEmailEnabled: settings.orderEmailEnabled ?? false,
        maxCoinUsagePercentage: settings.maxCoinUsagePercentage || 20,
        stripeEnabled: settings.stripeEnabled ?? false,
        googleAnalyticsEnabled: settings.googleAnalyticsEnabled ?? false,
        emailEnabled: settings.emailEnabled ?? false,
        emailService: settings.emailService || "brevo",
        aiChatEnabled: settings.aiChatEnabled ?? true,
        aiSuggestionsEnabled: settings.aiSuggestionsEnabled ?? true,
        brevoApiKey: settings.brevoApiKey || "",
        cancellationPolicy: settings.cancellationPolicy || "",
        refundPolicy: settings.refundPolicy || "",
        aiCallCodVerificationEnabled: settings.aiCallCodVerificationEnabled ?? false,
        aiCallReviewCollectionEnabled: settings.aiCallReviewCollectionEnabled ?? false,
        aiCallAbandonedCartEnabled: settings.aiCallAbandonedCartEnabled ?? false,
        aiCallSupportEnabled: settings.aiCallSupportEnabled ?? false,
        aiReviewCondition: settings.aiReviewCondition || "Provide a Video Review",
        aiReviewRewardType: settings.aiReviewRewardType || "Percentage",
        aiReviewRewardValue: settings.aiReviewRewardValue || 50,
        whatsappSupportEnabled: settings.whatsappSupportEnabled ?? false,
        whatsappToken: settings.whatsappToken || "",
        whatsappPhoneNumberId: settings.whatsappPhoneNumberId || "",
        whatsappVerifyToken: settings.whatsappVerifyToken || "",
        whatsappAppSecret: settings.whatsappAppSecret || "",
        taxEnabled: settings.taxEnabled ?? true,
        taxRate: settings.taxRate || 0,
        gstRate: settings.gstRate ?? 18,
        shippingGstRate: settings.shippingGstRate ?? 18,
        taxPricingMode: settings.taxPricingMode || "inclusive",
        gatewayFeeRate: settings.gatewayFeeRate ?? 2,
        isGstRegistered: settings.isGstRegistered ?? true,
        companyLegalName: settings.companyLegalName || "Aura Store Retail Pvt. Ltd.",
        companyAddress: settings.companyAddress || "Plot No. 42, Commercial Complex, Okhla Industrial Area, Phase-III",
        companyCity: settings.companyCity || "New Delhi",
        companyState: settings.companyState || "Delhi",
        companyStateCode: settings.companyStateCode || "07",
        companyPincode: settings.companyPincode || "110020",
        companyCountry: settings.companyCountry || "India",
        gstin: settings.gstin || "07AABCS1429B1ZW",
        cin: settings.cin || "",
        panNumber: settings.panNumber || "AABCS1429B",
        defaultHsnCode: settings.defaultHsnCode || "9506",
        authorizedSignatoryName: settings.authorizedSignatoryName || "Finance & Accounts Dept.",
        authorizedSignatoryTitle: settings.authorizedSignatoryTitle || "Authorized Signatory",
        invoicePrefix: settings.invoicePrefix || "INV-",
        isDigitalSignatureEnabled: settings.isDigitalSignatureEnabled ?? true,
        authorizedSignatureImage: settings.authorizedSignatureImage || "",
        shippingProvider: settings.shippingProvider || "manual",
        shiprocketEnabled: settings.shiprocketEnabled ?? false,
        shiprocketEmail: settings.shiprocketEmail || "",
        shiprocketPassword: settings.shiprocketPassword || "",
        shiprocketChannelId: settings.shiprocketChannelId || "",
        delhiveryEnabled: settings.delhiveryEnabled ?? false,
        delhiveryApiToken: settings.delhiveryApiToken || "",
        delhiveryWarehouseName: settings.delhiveryWarehouseName || "",
        defaultBoxLength: settings.defaultBoxLength || 20,
        defaultBoxBreadth: settings.defaultBoxBreadth || 15,
        defaultBoxHeight: settings.defaultBoxHeight || 10,
        defaultBoxWeight: settings.defaultBoxWeight || 0.5,
        showCookieBanner: settings.showCookieBanner ?? false,
        grievanceOfficerName: settings.grievanceOfficerName || "Data Protection & Grievance Officer",
        grievanceOfficerEmail: settings.grievanceOfficerEmail || "privacy@aurastore.in",
        grievanceOfficerPhone: settings.grievanceOfficerPhone || "",
        dpdpPolicyVersion: settings.dpdpPolicyVersion || "v1.0",
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

  // Dynamic currency symbol across form labels
  const currencySymbol = formData.currency === "usd" ? "$" : formData.currency === "eur" ? "€" : "₹"

  // GSTIN & PAN Auto-uppercase, Auto-detection & Cross-verification
  const handleGstinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15)

    let detectedState = formData.companyState
    let detectedStateCode = formData.companyStateCode
    if (rawVal.length >= 2) {
      const stateMatch = extractStateFromGSTIN(rawVal)
      if (stateMatch) {
        detectedState = stateMatch.name
        detectedStateCode = stateMatch.code
      }
    }

    let detectedPan = formData.panNumber
    if (rawVal.length >= 12) {
      detectedPan = extractPanFromGSTIN(rawVal)
    }

    setFormData((prev) => ({
      ...prev,
      gstin: rawVal,
      companyState: detectedState,
      companyStateCode: detectedStateCode,
      panNumber: detectedPan,
    }))
  }

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 10)
    setFormData((prev) => ({
      ...prev,
      panNumber: rawVal,
    }))
  }

  const gstinValidation = validateGSTIN(formData.gstin)
  const stateMismatchError =
    formData.isGstRegistered &&
    formData.gstin.length >= 2 &&
    formData.companyStateCode &&
    formData.gstin.slice(0, 2) !== formData.companyStateCode
      ? `GSTIN State Code (${formData.gstin.slice(0, 2)}) does not match selected State Code (${formData.companyStateCode})`
      : null
  const panMismatchError =
    formData.isGstRegistered &&
    formData.gstin.length >= 12 &&
    formData.panNumber &&
    formData.gstin.slice(2, 12) !== formData.panNumber
      ? `PAN (${formData.panNumber}) does not match characters 3–12 of GSTIN (${formData.gstin.slice(2, 12)})`
      : null

  const handleResetToDefaults = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Are you sure you want to reset all store, tax, and legal entity settings to production defaults?")
    ) {
      setFormData((prev) => ({
        ...prev,
        codMinimumAmount: 0,
        codEnabled: true,
        partialCodEnabled: false,
        partialCodType: "fixed",
        partialCodAmount: 500,
        partialCodMinOrderAmount: 0,
        deliveryCharges: 40,
        freeDeliveryThreshold: 500,
        termsAndConditions: "Amount charged is non-refundable for COD orders.",
        storeName: "My E-commerce Store",
        storeUrl: "https://mystore.com",
        currency: "inr",
        timezone: "ist",
        coinEarnRate: 10,
        coinValue: 1,
        helpLineNumber: "",
        supportEmail: "",
        orderEmailEnabled: false,
        maxCoinUsagePercentage: 20,
        stripeEnabled: false,
        taxEnabled: true,
        taxRate: 0,
        gstRate: 18,
        shippingGstRate: 18,
        taxPricingMode: "inclusive",
        gatewayFeeRate: 2,
        isGstRegistered: true,
        companyLegalName: "Aura Store Retail Pvt. Ltd.",
        companyAddress: "Plot No. 42, Commercial Complex, Okhla Industrial Area, Phase-III",
        companyCity: "New Delhi",
        companyState: "Delhi",
        companyStateCode: "07",
        companyPincode: "110020",
        companyCountry: "India",
        gstin: "07AABCS1429B1ZW",
        cin: "U72900DL2024PTC123456",
        panNumber: "AABCS1429B",
        defaultHsnCode: "9506",
        authorizedSignatoryName: "Finance & Accounts Dept.",
        authorizedSignatoryTitle: "Authorized Signatory",
        invoicePrefix: "INV-",
        isDigitalSignatureEnabled: true,
        authorizedSignatureImage: "",
        showCookieBanner: false,
        grievanceOfficerName: "Data Protection & Grievance Officer",
        grievanceOfficerEmail: "privacy@aurastore.in",
        grievanceOfficerPhone: "",
        dpdpPolicyVersion: "v1.0",
      }))
      toast.success("Settings reset to defaults. Click 'Save Changes' to persist.")
    }
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
      <SettingsHeader onSave={handleSave} onReset={handleResetToDefaults} isUpdating={isUpdating} />

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
          <TabsTrigger value="privacy" className="gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            Privacy &amp; Requests
          </TabsTrigger>
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
                          <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className="capitalize text-xs font-medium"
                          >
                            {user.role || "user"}
                          </Badge>
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
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    placeholder="e.g. Aura Store"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeUrl">Store URL</Label>
                  <Input
                    id="storeUrl"
                    value={formData.storeUrl}
                    onChange={handleInputChange}
                    placeholder="e.g. https://mystore.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(val) => setFormData(p => ({ ...p, currency: val }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inr">INR - Indian Rupee (₹)</SelectItem>
                        <SelectItem value="usd">USD - US Dollar ($)</SelectItem>
                        <SelectItem value="eur">EUR - Euro (€)</SelectItem>
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
                        <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
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

                {formData.codEnabled && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="codMinimumAmount">Minimum Order Amount for COD ({currencySymbol})</Label>
                      <Input
                        id="codMinimumAmount"
                        type="number"
                        value={formData.codMinimumAmount}
                        onChange={handleInputChange}
                        placeholder="e.g. 0 (0 for no limit)"
                      />
                      <p className="text-xs text-muted-foreground">COD will be disabled if order total is less than this</p>
                    </div>

                    <Separator className="my-3" />

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="partialCodEnabled" className="font-semibold text-base">Advance Deposit COD (Partial COD)</Label>
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-0 text-xs">Anti-Fake COD</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Jab ye ON hoga toh customer ko full COD ki jagah Advance COD milega (Advance online pay karega, baki delivery par). Fake COD orders rokne ke liye.
                          </p>
                        </div>
                        <Switch
                          id="partialCodEnabled"
                          checked={formData.partialCodEnabled}
                          onCheckedChange={(checked) => handleSwitchChange("partialCodEnabled", checked)}
                        />
                      </div>

                      {formData.partialCodEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="partialCodType">Advance Type</Label>
                            <Select
                              value={formData.partialCodType}
                              onValueChange={(val: "fixed" | "percentage") => setFormData((p) => ({ ...p, partialCodType: val }))}
                            >
                              <SelectTrigger id="partialCodType">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed Amount ({currencySymbol})</SelectItem>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Fixed amount ya order total ka percentage</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="partialCodAmount">
                              {formData.partialCodType === "percentage" ? "Advance Percentage (%)" : `Advance Amount (${currencySymbol})`}
                            </Label>
                            <Input
                              id="partialCodAmount"
                              type="number"
                              value={formData.partialCodAmount}
                              onChange={handleInputChange}
                              placeholder={formData.partialCodType === "percentage" ? "e.g. 20" : "e.g. 500"}
                            />
                            <p className="text-xs text-muted-foreground">Customer ye advance online pay karega order book karne ke liye</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 pt-2 border-t border-primary/10">
                        <Label htmlFor="termsAndConditions" className="font-medium">
                          COD &amp; Advance Terms &amp; Conditions (Refund / Policy Notice)
                        </Label>
                        <Textarea
                          id="termsAndConditions"
                          value={formData.termsAndConditions}
                          onChange={handleInputChange}
                          placeholder="e.g. Advance payment online pay hone ke baad doorstep par order lene se mana karne par advance refund nahi hoga..."
                          className="min-h-[90px] bg-white dark:bg-slate-900"
                        />
                        <p className="text-xs text-muted-foreground">
                          Ye notice checkout page par COD option ke sath customer ko dikhai dega.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                  Shipping &amp; Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryCharges">Default Delivery Charges ({currencySymbol})</Label>
                  <Input
                    id="deliveryCharges"
                    type="number"
                    value={formData.deliveryCharges}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold ({currencySymbol})</Label>
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
                  <Label htmlFor="coinEarnRate">Coin Earn Rate (%)</Label>
                  <Input
                    id="coinEarnRate"
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={formData.coinEarnRate}
                    onChange={handleInputChange}
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground">Percentage of order total awarded as coins (1 = 1%, e.g., 10 for 10%)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coinValue">Coin Value ({currencySymbol})</Label>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Tax &amp; Gateway Preferences
                </CardTitle>
                <p className="text-sm text-muted-foreground">GST slabs, checkout tax calculation mode, and gateway profit deductions.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="taxEnabled">Include GST &amp; Gateway Fees in Profit Analytics</Label>
                    <p className="text-xs text-muted-foreground">Deduct GST and payment gateway charges when calculating Net Profit in analytics.</p>
                  </div>
                  <Switch
                    id="taxEnabled"
                    checked={formData.taxEnabled}
                    onCheckedChange={(checked) => handleSwitchChange("taxEnabled", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxPricingMode">Tax Pricing Mode</Label>
                  <Select
                    value={formData.taxPricingMode}
                    onValueChange={(val: "inclusive" | "exclusive") => setFormData((p) => ({ ...p, taxPricingMode: val }))}
                  >
                    <SelectTrigger id="taxPricingMode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inclusive">GST Inclusive (Product prices are MRP - Standard in India)</SelectItem>
                      <SelectItem value="exclusive">GST Exclusive (Add GST on top at checkout)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    In India B2C e-commerce, consumer prices are legally required to be inclusive of all taxes (MRP).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gstRate">Default GST Rate (%)</Label>
                    <Input
                      id="gstRate"
                      type="number"
                      value={formData.gstRate}
                      onChange={handleInputChange}
                      placeholder="18"
                    />
                    <p className="text-xs text-muted-foreground">Fallback GST slab used when an individual product does not have its own GST rate.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingGstRate">Shipping GST Rate (%)</Label>
                    <Input
                      id="shippingGstRate"
                      type="number"
                      value={formData.shippingGstRate}
                      onChange={handleInputChange}
                      placeholder="18"
                    />
                    <p className="text-xs text-muted-foreground">GST slab applicable on shipping and delivery fees (standard: 18%).</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gatewayFeeRate">Payment Gateway Fee (%)</Label>
                  <Input
                    id="gatewayFeeRate"
                    type="number"
                    step="0.1"
                    value={formData.gatewayFeeRate}
                    onChange={handleInputChange}
                    placeholder="2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Applies only to prepaid online orders (excluded for COD) in Net Profit analytics.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      Legal Entity &amp; GST Tax Invoice Details
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Official business registration, GSTIN, and registered address printed on customer Tax Invoices &amp; Delivery Challans.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {formData.isGstRegistered ? "Tax Invoice (GST Registered)" : "Bill of Supply (Unregistered)"}
                    </span>
                    <Badge variant={formData.isGstRegistered ? "default" : "secondary"}>
                      {formData.isGstRegistered ? "GST Active" : "Unregistered"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="isGstRegistered" className="font-semibold text-base">GST Registered Business</Label>
                      <Badge variant="outline" className="text-xs">Rule 46 / Rule 49</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When ON, invoices are titled <strong>&quot;Tax Invoice&quot;</strong> with CGST/SGST/IGST breakdown. When OFF, invoices are titled <strong>&quot;Bill of Supply&quot;</strong> without GST split.
                    </p>
                  </div>
                  <Switch
                    id="isGstRegistered"
                    checked={formData.isGstRegistered}
                    onCheckedChange={(checked) => handleSwitchChange("isGstRegistered", checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyLegalName">Company Legal Entity Name</Label>
                    <Input
                      id="companyLegalName"
                      value={formData.companyLegalName}
                      onChange={handleInputChange}
                      placeholder="e.g. Aura Store Retail Pvt. Ltd."
                    />
                    <p className="text-xs text-muted-foreground">Official registered name of the business entity</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultHsnCode">Default HSN / SAC Code</Label>
                    <Input
                      id="defaultHsnCode"
                      value={formData.defaultHsnCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 9506"
                    />
                    <p className="text-xs text-muted-foreground">Harmonized System of Nomenclature code for product tax classification</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Full Registered Office Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    placeholder="Plot / Office No, Building, Street, Industrial Area"
                    className="min-h-[70px]"
                  />
                  <p className="text-xs text-muted-foreground">Complete street address for official billing &amp; dispatch location</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyCity">City</Label>
                    <Input
                      id="companyCity"
                      value={formData.companyCity}
                      onChange={handleInputChange}
                      placeholder="New Delhi"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyState">State / UT (GST)</Label>
                    <Select
                      value={formData.companyStateCode || ""}
                      onValueChange={(code) => {
                        const matched = INDIAN_STATES_GST.find((s) => s.code === code)
                        setFormData((prev) => ({
                          ...prev,
                          companyStateCode: code,
                          companyState: matched ? matched.name : prev.companyState,
                        }))
                      }}
                    >
                      <SelectTrigger id="companyState">
                        <SelectValue placeholder="Select State / UT" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {INDIAN_STATES_GST.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name} ({state.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyStateCode">State Code (GST)</Label>
                    <Input
                      id="companyStateCode"
                      value={formData.companyStateCode}
                      readOnly
                      className="bg-muted font-mono font-bold text-center cursor-not-allowed"
                      placeholder="07"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyPincode">PIN Code</Label>
                    <Input
                      id="companyPincode"
                      value={formData.companyPincode}
                      onChange={handleInputChange}
                      placeholder="110020"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gstin">GSTIN (15 Digits)</Label>
                      {formData.isGstRegistered && formData.gstin.length === 15 && (
                        gstinValidation.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Valid Checksum
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                            <AlertCircle className="w-3 h-3" /> Invalid Checksum
                          </span>
                        )
                      )}
                    </div>
                    <Input
                      id="gstin"
                      value={formData.gstin}
                      onChange={handleGstinChange}
                      placeholder="07AABCS1429B1ZW"
                      className={`font-mono uppercase ${
                        formData.isGstRegistered && formData.gstin && !gstinValidation.isValid
                          ? "border-rose-400 focus-visible:ring-rose-400"
                          : ""
                      }`}
                      disabled={!formData.isGstRegistered}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.isGstRegistered
                        ? "State Code (2) + PAN (10) + Entity (1) + Z + Checksum (1)"
                        : "Optional when unregistered under GST (Bill of Supply issued)"}
                    </p>
                    {formData.isGstRegistered && gstinValidation.error && formData.gstin.length > 0 && (
                      <p className="text-xs text-rose-500 font-medium">{gstinValidation.error}</p>
                    )}
                    {stateMismatchError && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{stateMismatchError}</p>
                    )}
                    {panMismatchError && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{panMismatchError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cin">CIN (Optional — Pvt. Ltd. / LLP only)</Label>
                    <Input
                      id="cin"
                      value={formData.cin}
                      onChange={handleInputChange}
                      placeholder="U72900DL2024PTC123456"
                      className="font-mono uppercase"
                    />
                    <p className="text-xs text-muted-foreground">Leave blank for Sole Proprietorships and Partnerships</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number (10 Digits)</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={handlePanChange}
                      placeholder="AABCS1429B"
                      className="font-mono uppercase"
                    />
                    <p className="text-xs text-muted-foreground">Permanent Account Number (auto-synced from GSTIN)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                    <Input
                      id="invoicePrefix"
                      value={formData.invoicePrefix}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 10)
                        setFormData((p) => ({ ...p, invoicePrefix: val }))
                      }}
                      placeholder="INV-"
                      maxLength={10}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">Max 10 chars so full invoice number (Prefix + serial) stays within Rule 46&apos;s 16-character limit (e.g. INV/26- or INV-)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authorizedSignatoryName">Authorized Signatory Dept / Name</Label>
                    <Input
                      id="authorizedSignatoryName"
                      value={formData.authorizedSignatoryName}
                      onChange={handleInputChange}
                      placeholder="Finance &amp; Accounts Dept."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authorizedSignatoryTitle">Signatory Designation Title</Label>
                    <Input
                      id="authorizedSignatoryTitle"
                      value={formData.authorizedSignatoryTitle}
                      onChange={handleInputChange}
                      placeholder="Authorized Signatory"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="isDigitalSignatureEnabled"
                      checked={formData.isDigitalSignatureEnabled}
                      onCheckedChange={(checked) =>
                        setFormData((p) => ({ ...p, isDigitalSignatureEnabled: Boolean(checked) }))
                      }
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isDigitalSignatureEnabled" className="cursor-pointer font-medium">
                        Computer-generated invoice (no physical signature required)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Prints official digital seal and clause &quot;* This is a computer-generated invoice and requires no physical signature.&quot; as per Indian IT Act &amp; GST guidelines.
                      </p>
                    </div>
                  </div>

                  {!formData.isDigitalSignatureEnabled && (
                    <div className="space-y-2 pl-7 pt-2">
                      <Label htmlFor="authorizedSignatureImage">Authorized Signature Image URL</Label>
                      <Input
                        id="authorizedSignatureImage"
                        value={formData.authorizedSignatureImage}
                        onChange={handleInputChange}
                        placeholder="https://example.com/signatures/sign.png"
                      />
                      <p className="text-xs text-muted-foreground">
                        Transparent PNG of the physical signature to be printed on invoice PDFs.
                      </p>
                      {formData.authorizedSignatureImage && (
                        <div className="mt-2 p-2 border rounded-md inline-block bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formData.authorizedSignatureImage}
                            alt="Signature Preview"
                            className="h-12 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Integration
                </CardTitle>
                <p className="text-sm text-muted-foreground">Connect with a shipping provider for automated order fulfillment, tracking & label generation</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Provider Selector */}
                <div className="space-y-2">
                  <Label>Active Shipping Provider</Label>
                  <Select value={formData.shippingProvider} onValueChange={(val: "manual" | "shiprocket" | "delhivery") => setFormData(p => ({ ...p, shippingProvider: val }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual (No Integration)</SelectItem>
                      <SelectItem value="shiprocket">Shiprocket</SelectItem>
                      <SelectItem value="delhivery">Delhivery</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Select which provider handles your shipments. Only one can be active at a time.</p>
                </div>

                <Separator />

                {/* Default Box Dimensions */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm">Default Package Dimensions</h4>
                    <p className="text-xs text-muted-foreground">Used as fallback if individual product weight/size is missing.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultBoxLength">Length (cm)</Label>
                      <Input id="defaultBoxLength" type="number" value={formData.defaultBoxLength} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultBoxBreadth">Breadth (cm)</Label>
                      <Input id="defaultBoxBreadth" type="number" value={formData.defaultBoxBreadth} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultBoxHeight">Height (cm)</Label>
                      <Input id="defaultBoxHeight" type="number" value={formData.defaultBoxHeight} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultBoxWeight">Weight (kg)</Label>
                      <Input id="defaultBoxWeight" type="number" step="0.1" value={formData.defaultBoxWeight} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Shiprocket Section */}
                <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Shiprocket</h4>
                        <p className="text-xs text-muted-foreground">India's #1 eCommerce shipping solution</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.shiprocketEnabled && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px]">Configured</Badge>}
                      <Switch
                        checked={formData.shiprocketEnabled}
                        onCheckedChange={(checked) => handleSwitchChange("shiprocketEnabled", checked)}
                      />
                    </div>
                  </div>
                  {formData.shiprocketEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="shiprocketEmail">Shiprocket Email</Label>
                        <Input
                          id="shiprocketEmail"
                          type="email"
                          value={formData.shiprocketEmail}
                          onChange={handleInputChange}
                          placeholder="your@shiprocket-email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shiprocketPassword">Shiprocket Password</Label>
                        <Input
                          id="shiprocketPassword"
                          type="password"
                          value={formData.shiprocketPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="shiprocketChannelId">Channel ID (Optional)</Label>
                        <Input
                          id="shiprocketChannelId"
                          value={formData.shiprocketChannelId}
                          onChange={handleInputChange}
                          placeholder="e.g. 12345"
                        />
                        <p className="text-xs text-muted-foreground">Found in Shiprocket Panel → Settings → Channels. Leave empty to use default channel.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delhivery Section */}
                <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Delhivery</h4>
                        <p className="text-xs text-muted-foreground">Enterprise-grade logistics & supply chain</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.delhiveryEnabled && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px]">Configured</Badge>}
                      <Switch
                        checked={formData.delhiveryEnabled}
                        onCheckedChange={(checked) => handleSwitchChange("delhiveryEnabled", checked)}
                      />
                    </div>
                  </div>
                  {formData.delhiveryEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="delhiveryApiToken">API Token</Label>
                        <Input
                          id="delhiveryApiToken"
                          type="password"
                          value={formData.delhiveryApiToken}
                          onChange={handleInputChange}
                          placeholder="Your Delhivery API Token"
                        />
                        <p className="text-xs text-muted-foreground">Generate from Delhivery Developer Portal</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delhiveryWarehouseName">Warehouse / Pickup Name</Label>
                        <Input
                          id="delhiveryWarehouseName"
                          value={formData.delhiveryWarehouseName}
                          onChange={handleInputChange}
                          placeholder="e.g. Main Warehouse"
                        />
                        <p className="text-xs text-muted-foreground">Name registered as pickup location in Delhivery</p>
                      </div>
                    </div>
                  )}
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
          
          <div className="grid grid-cols-1 mt-6 gap-6">
            <Card className="border-indigo-200 shadow-sm">
              <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                  <Bot className="w-5 h-5" />
                  Voice AI Assistant (Aura) & Custom Policies
                </CardTitle>
                <p className="text-sm text-indigo-700">Configure outbound call triggers and store policies that the AI agent follows.</p>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-base border-b pb-2">Outbound Calling Triggers</h3>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                      <div className="space-y-0.5 max-w-[70%]">
                        <Label>COD Phone Verification</Label>
                        <p className="text-xs text-muted-foreground">Call customers to verify Cash on Delivery orders</p>
                      </div>
                      <Switch checked={formData.aiCallCodVerificationEnabled} onCheckedChange={(c) => handleSwitchChange("aiCallCodVerificationEnabled", c)} />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                      <div className="space-y-0.5 max-w-[70%]">
                        <Label>Abandoned Cart Recovery</Label>
                        <p className="text-xs text-muted-foreground">Call customers who left items in their cart</p>
                      </div>
                      <Switch checked={formData.aiCallAbandonedCartEnabled} onCheckedChange={(c) => handleSwitchChange("aiCallAbandonedCartEnabled", c)} />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                      <div className="space-y-0.5 max-w-[70%]">
                        <Label>Customer Support Agent AI</Label>
                        <p className="text-xs text-muted-foreground">Allow AI to handle order queries using tools</p>
                      </div>
                      <Switch checked={formData.aiCallSupportEnabled} onCheckedChange={(c) => handleSwitchChange("aiCallSupportEnabled", c)} />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                      <div className="space-y-0.5 max-w-[70%]">
                        <Label>Feedback & Review Collection</Label>
                        <p className="text-xs text-muted-foreground">Call customers after delivery to collect reviews</p>
                      </div>
                      <Switch checked={formData.aiCallReviewCollectionEnabled} onCheckedChange={(c) => handleSwitchChange("aiCallReviewCollectionEnabled", c)} />
                    </div>

                    {formData.aiCallReviewCollectionEnabled && (
                      <div className="p-4 border rounded-lg bg-indigo-50/30 space-y-4 mt-2">
                         <div className="space-y-2">
                           <Label>AI Review Condition (Task)</Label>
                           <Input id="aiReviewCondition" value={formData.aiReviewCondition} onChange={handleInputChange} placeholder="e.g. Provide a Video Review" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label>Reward Type</Label>
                             <Select value={formData.aiReviewRewardType} onValueChange={(val) => setFormData(p => ({...p, aiReviewRewardType: val as any}))}>
                               <SelectTrigger><SelectValue/></SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="Percentage">Percentage %</SelectItem>
                                 <SelectItem value="Fixed">Fixed Amount</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                           <div className="space-y-2">
                             <Label>Reward Value</Label>
                             <Input id="aiReviewRewardValue" type="number" value={formData.aiReviewRewardValue} onChange={handleInputChange} />
                           </div>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-base border-b pb-2">AI Knowledge Base (Policies)</h3>
                    <p className="text-xs text-muted-foreground">The AI Agent reads these live policies during customer interactions.</p>
                    
                    <div className="space-y-2">
                      <Label>Cancellation Policy</Label>
                      <Textarea id="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleInputChange} placeholder="Detail when orders can be cancelled..." className="min-h-[100px]" />
                    </div>

                    <div className="space-y-2">
                      <Label>Refund Policy</Label>
                      <Textarea id="refundPolicy" value={formData.refundPolicy} onChange={handleInputChange} placeholder="Detail the timeframe and process for refunds..." className="min-h-[100px]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 mt-6 gap-6">
            <Card className="border-green-200 shadow-sm">
              <CardHeader className="bg-green-50/50 border-b border-green-100">
                <CardTitle className="text-lg flex items-center gap-2 text-green-900">
                  <Bot className="w-5 h-5" />
                  WhatsApp Meta Official Support
                </CardTitle>
                <p className="text-sm text-green-700">Configure Meta Cloud API to let the AI respond to Customer WhatsApp messages.</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                 <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                   <div className="space-y-0.5 max-w-[70%]">
                     <Label>Enable WhatsApp Support AI</Label>
                     <p className="text-xs text-muted-foreground">Turn on/off automatic WhatsApp replies to customers.</p>
                   </div>
                   <Switch checked={formData.whatsappSupportEnabled} onCheckedChange={(c) => handleSwitchChange("whatsappSupportEnabled", c)} />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>WhatsApp Permanent Auth Token</Label>
                      <Input type="password" id="whatsappToken" value={formData.whatsappToken} onChange={handleInputChange} placeholder="EAAI..." />
                    </div>
                    
                    <div className="space-y-2">
                       <Label>Phone Number ID</Label>
                       <Input id="whatsappPhoneNumberId" value={formData.whatsappPhoneNumberId} onChange={handleInputChange} placeholder="e.g. 123456789012" />
                    </div>
                    
                    <div className="space-y-2">
                       <Label>Webhook Verify Token</Label>
                       <Input id="whatsappVerifyToken" value={formData.whatsappVerifyToken} onChange={handleInputChange} placeholder="Create a custom string" />
                    </div>

                    <div className="space-y-2">
                       <Label>App Secret (For Meta Signature)</Label>
                       <Input type="password" id="whatsappAppSecret" value={formData.whatsappAppSecret} onChange={handleInputChange} placeholder="Required for verifying inbound messages securely" />
                    </div>
                 </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacyRequestsPanel
            formData={{
              showCookieBanner: formData.showCookieBanner,
              grievanceOfficerName: formData.grievanceOfficerName,
              grievanceOfficerEmail: formData.grievanceOfficerEmail,
              grievanceOfficerPhone: formData.grievanceOfficerPhone,
              dpdpPolicyVersion: formData.dpdpPolicyVersion,
            }}
            onInputChange={handleInputChange}
            onSwitchChange={handleSwitchChange}
            onSaveSettings={handleSave}
            isSavingSettings={isUpdating}
          />
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
