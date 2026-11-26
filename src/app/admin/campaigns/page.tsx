"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ShoppingCart,
  Megaphone,
  Loader2,
  Mail,
  Copy,
  ImageIcon,
  Sparkles,
  Target,
  MessageSquare,
  Send,
  Wand2,
  Phone,
  LayoutTemplate,
  RefreshCw,
  Pencil,
  Check,
  X,
  Clock,
  Trash2,
  Palette,
  AlertTriangle,
  Users,
  Zap,
  PartyPopper,
  Flame,
  Gift,
  Star,
  ExternalLink,
  Ticket,
  Package,
  Link2,
  CalendarClock,
  FlaskConical,
  CopyPlus,
  BarChart3,
  Search,
} from "lucide-react"
import toast from "react-hot-toast"
import { copyToClipboardSafe } from "@/lib/utils"
import { useAppSelector } from "@/redux/hooks"
import {
  useGenerateCampaignDataMutation,
  useBroadcastCampaignMutation,
  useSendTestCampaignMutation,
  useGetCampaignSegmentCountsQuery,
  useGetCampaignHistoryQuery,
  useDeleteCampaignMutation,
  useGetCouponsQuery,
  useGetAdminProductsQuery,
  useGetCategoriesQuery,
} from "@/redux/api/adminApi"

// ─── Types ───────────────────────────────────────────────────────────
type CampaignData = {
  campaignId?: string
  pushTitle?: string
  pushBody?: string
  pushDeepLink?: string
  whatsappText?: string
  whatsappButtons?: string[]
  emailSubject?: string
  emailHtml?: string
  imageUrl?: string | null
  storeName?: string
  storeLogo?: string | null
  ctaUrl?: string
  couponCode?: string
}

type CampaignRecord = {
  _id: string
  topic: string
  audienceType: string
  tone: string
  channels: string[]
  couponId?: { _id: string; code: string; discountType: string; discountAmount: number } | string | null
  couponCode?: string
  productId?: { _id: string; name: string; slug: string } | string | null
  categoryId?: { _id: string; name: string; slug: string } | string | null
  ctaUrl?: string
  payload: CampaignData
  status: "draft" | "scheduled" | "sending" | "sent" | "failed"
  scheduledAt?: string | null
  sentAt?: string | null
  stats?: {
    totalRecipients?: number
    sentCount?: number
    deliveredCount?: number
    failedCount?: number
    opens?: number
    clicks?: number
  }
  createdAt: string
}

// ─── Constants ───────────────────────────────────────────────────────
const PRESET_AUDIENCES = ["Abandoned Cart", "Recently Viewed", "Top Buyers", "All Customers"]

const TONE_OPTIONS = [
  { value: "professional", label: "Professional", icon: Star, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "casual", label: "Casual", icon: MessageSquare, color: "text-teal-600 bg-teal-50 border-teal-200" },
  { value: "urgent", label: "Urgent 🔥", icon: Flame, color: "text-red-600 bg-red-50 border-red-200" },
  { value: "festive", label: "Festive 🎉", icon: PartyPopper, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "luxury", label: "Luxury", icon: Gift, color: "text-violet-600 bg-violet-50 border-violet-200" },
]

const QUICK_TEMPLATES = [
  { label: "Flash Sale", topic: "Limited Time Flash Sale - Up to 70% Off on top brands. Hurry, offer ends tonight!", type: "All Customers", tone: "urgent", ctaUrl: "/product" },
  { label: "Diwali Offer", topic: "Diwali Mega Sale 🪔 - Celebrate with massive festive savings across all categories!", type: "All Customers", tone: "festive", ctaUrl: "/product" },
  { label: "Cart Recovery", topic: "Your cart misses you! Complete your purchase now and get fast free shipping.", type: "Abandoned Cart", tone: "casual", ctaUrl: "/cart" },
  { label: "New Arrival", topic: "Just Dropped: Our latest premium collection is now live. Be the first to shop.", type: "Recently Viewed", tone: "luxury", ctaUrl: "/product" },
  { label: "VIP Reward", topic: "VIP Exclusive: Thank you for shopping with us! Unlock extra member rewards today.", type: "Top Buyers", tone: "luxury", ctaUrl: "/product" },
  { label: "Weekend Deal", topic: "Weekend Clearance - Flat 50% off on top picks. Refresh your favorites for less!", type: "All Customers", tone: "casual", ctaUrl: "/product" },
]

const PUSH_TITLE_LIMIT = 40
const PUSH_BODY_LIMIT = 90

const STATUS_BADGE_MAP: Record<string, string> = {
  sent: "bg-emerald-100 text-emerald-700 border-emerald-200",
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  sending: "bg-amber-100 text-amber-700 border-amber-200",
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  failed: "bg-red-100 text-red-700 border-red-200",
}

// ═════════════════════════════════════════════════════════════════════
export default function CampaignStudioPage() {
  const { user } = useAppSelector((state) => state.user)

  // APIs
  const [generateCampaign] = useGenerateCampaignDataMutation()
  const [broadcastCampaign] = useBroadcastCampaignMutation()
  const [sendTestCampaign] = useSendTestCampaignMutation()
  const [deleteCampaignMutation] = useDeleteCampaignMutation()

  const { data: segmentCounts, isLoading: countsLoading, refetch: refetchCounts } =
    useGetCampaignSegmentCountsQuery()
  const { data: campaignHistory = [], isLoading: historyLoading, refetch: refetchHistory } =
    useGetCampaignHistoryQuery()
  const { data: coupons = [] } = useGetCouponsQuery()
  const { data: productsData } = useGetAdminProductsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()

  const activeCoupons = useMemo(() => {
    const now = Date.now()
    return (coupons || []).filter(
      (c: any) => c.isActive && (!c.expiryDate || new Date(c.expiryDate).getTime() > now)
    )
  }, [coupons])

  const products = productsData?.products || []

  // ── Hydration-safe client time ─────────────────────────────────────
  const [previewTime, setPreviewTime] = useState("12:00 PM")
  const [minDateTimeLocal, setMinDateTimeLocal] = useState("")

  useEffect(() => {
    const now = new Date()
    setPreviewTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }))
    // Offset local timezone for <input type="datetime-local"> min attribute
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setMinDateTimeLocal(localIso)
  }, [])

  // ── Form state ─────────────────────────────────────────────────────
  const [activeCampaignId, setActiveCampaignId] = useState<string | undefined>(undefined)
  const [topic, setTopic] = useState("")
  const [type, setType] = useState("Abandoned Cart")
  const [tone, setTone] = useState("professional")
  const [channels, setChannels] = useState<string[]>(["push", "whatsapp", "email"])

  // Promo & Link Attachments
  const [selectedCouponId, setSelectedCouponId] = useState("")
  const [attachTargetType, setAttachTargetType] = useState<"none" | "product" | "category">("none")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [targetSearch, setTargetSearch] = useState("")
  const [ctaUrl, setCtaUrl] = useState("/")

  // ── Generation state ───────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<CampaignData | null>(null)

  // ── Inline-edit state ──────────────────────────────────────────────
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editBuffer, setEditBuffer] = useState("")

  // ── Test Send state ────────────────────────────────────────────────
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testPhone, setTestPhone] = useState("")
  const [isTestingSend, setIsTestingSend] = useState(false)

  useEffect(() => {
    if (user?.email && !testEmail) {
      setTestEmail(user.email)
    }
    if (user?.phone && !testPhone) {
      setTestPhone(String(user.phone))
    }
  }, [user?.email, user?.phone, testEmail, testPhone])

  // ── Schedule & Broadcast state ─────────────────────────────────────
  const [scheduleMode, setScheduleMode] = useState<"now" | "schedule">("now")
  const [scheduledAt, setScheduledAt] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null)

  // ── History Drawer State ───────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false)

  // Filtered products & categories for searchable dropdown
  const filteredProducts = useMemo(() => {
    const q = targetSearch.trim().toLowerCase()
    if (!q) return products.slice(0, 50)
    return products
      .filter((p: any) => p.name?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q))
      .slice(0, 50)
  }, [products, targetSearch])

  const filteredCategories = useMemo(() => {
    const q = targetSearch.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c: any) => c.name?.toLowerCase().includes(q))
  }, [categories, targetSearch])

  const selectedSegmentCount = segmentCounts ? segmentCounts[type] ?? 0 : undefined
  const isZeroSegment = selectedSegmentCount === 0

  const selectedCouponObj = useMemo(
    () => activeCoupons.find((c: any) => c._id === selectedCouponId),
    [activeCoupons, selectedCouponId]
  )

  // ── Handlers ───────────────────────────────────────────────────────
  const toggleChannel = (ch: string) =>
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]))

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId)
    if (productId) {
      setCtaUrl(`/product/${productId}`)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    if (categoryId) {
      setCtaUrl(`/product?category=${categoryId}`)
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please describe your campaign objective")
      return
    }
    if (channels.length === 0) {
      toast.error("Select at least one delivery channel")
      return
    }

    setIsGenerating(true)
    setGeneratedData(null)
    setBroadcastResult(null)

    try {
      const res = await generateCampaign({
        topic,
        type,
        tone,
        channels,
        couponId: selectedCouponId || undefined,
        productId: attachTargetType === "product" && selectedProductId ? selectedProductId : undefined,
        categoryId: attachTargetType === "category" && selectedCategoryId ? selectedCategoryId : undefined,
        ctaUrl: ctaUrl.trim() || "/",
      }).unwrap()

      setGeneratedData(res)
      if (res.campaignId) {
        setActiveCampaignId(res.campaignId)
      }
      refetchHistory()
      toast.success("Campaign assets generated & draft saved!")
    } catch (err: any) {
      toast.error(err?.data?.message || "Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (text: string, label: string) => {
    if (!text) return
    await copyToClipboardSafe(text)
    toast.success(`${label} copied`)
  }

  const startEdit = (field: string, value: string) => {
    setEditingField(field)
    setEditBuffer(value)
  }

  const confirmEdit = useCallback(() => {
    if (!editingField || !generatedData) return
    setGeneratedData((prev) => (prev ? { ...prev, [editingField]: editBuffer } : prev))
    setEditingField(null)
    toast.success("Updated!")
  }, [editingField, editBuffer, generatedData])

  const cancelEdit = () => setEditingField(null)

  // ── Test Send ──────────────────────────────────────────────────────
  const handleSendTest = async () => {
    if (!generatedData) return
    if (!testEmail.trim() && !testPhone.trim()) {
      toast.error("Enter an email address or phone number for test delivery")
      return
    }

    setIsTestingSend(true)
    try {
      const res = await sendTestCampaign({
        testEmail: testEmail.trim() || undefined,
        testPhone: testPhone.trim() || undefined,
        channels,
        payload: generatedData,
      }).unwrap()

      toast.success(res.message || "Test preview sent!")
      setShowTestDialog(false)
    } catch (err: any) {
      toast.error(err?.data?.message || "Test send failed")
    } finally {
      setIsTestingSend(false)
    }
  }

  // ── Broadcast / Schedule ───────────────────────────────────────────
  const handleBroadcast = async () => {
    if (!generatedData) return
    if (scheduleMode === "now" && isZeroSegment) {
      toast.error(`Cannot broadcast now: "${type}" has 0 customers.`)
      return
    }
    if (scheduleMode === "schedule") {
      if (!scheduledAt) {
        toast.error("Please select a date & time to schedule")
        return
      }
      if (new Date(scheduledAt) <= new Date()) {
        toast.error("Scheduled date & time must be in the future")
        return
      }
    }

    setIsBroadcasting(true)
    setBroadcastResult(null)
    try {
      const res = await broadcastCampaign({
        campaignId: activeCampaignId,
        topic,
        tone,
        audienceType: type,
        channels,
        payload: generatedData,
        couponId: selectedCouponId || undefined,
        couponCode: selectedCouponObj?.code || generatedData.couponCode || "",
        productId: attachTargetType === "product" && selectedProductId ? selectedProductId : undefined,
        categoryId: attachTargetType === "category" && selectedCategoryId ? selectedCategoryId : undefined,
        ctaUrl: ctaUrl.trim() || "/",
        scheduleMode,
        scheduledAt: scheduleMode === "schedule" ? new Date(scheduledAt).toISOString() : undefined,
      }).unwrap()

      setBroadcastResult(res.message || "Campaign processed successfully!")
      toast.success(res.message || "Campaign submitted!")
      refetchHistory()
      refetchCounts()
      setShowConfirmDialog(false)
    } catch (err: any) {
      const msg = err?.data?.message || "Broadcast failed"
      setBroadcastResult("Error: " + msg)
      toast.error(msg)
    } finally {
      setIsBroadcasting(false)
    }
  }

  // ── History Actions ────────────────────────────────────────────────
  const loadCampaignIntoStudio = (item: CampaignRecord, duplicate = false) => {
    setTopic(item.topic)
    setType(item.audienceType || "All Customers")
    setTone(item.tone || "professional")
    setChannels(item.channels?.length ? item.channels : ["push", "whatsapp", "email"])
    setCtaUrl(item.ctaUrl || "/")

    const couponIdStr =
      typeof item.couponId === "object" && item.couponId !== null
        ? item.couponId._id
        : (item.couponId as string) || ""
    setSelectedCouponId(couponIdStr)

    const prodIdStr =
      typeof item.productId === "object" && item.productId !== null
        ? item.productId._id
        : (item.productId as string) || ""
    const catIdStr =
      typeof item.categoryId === "object" && item.categoryId !== null
        ? item.categoryId._id
        : (item.categoryId as string) || ""

    if (prodIdStr) {
      setAttachTargetType("product")
      setSelectedProductId(prodIdStr)
      setSelectedCategoryId("")
    } else if (catIdStr) {
      setAttachTargetType("category")
      setSelectedCategoryId(catIdStr)
      setSelectedProductId("")
    } else {
      setAttachTargetType("none")
      setSelectedProductId("")
      setSelectedCategoryId("")
    }

    setGeneratedData(item.payload || null)
    // Duplicating clears activeCampaignId so a brand-new record is created on broadcast/schedule
    setActiveCampaignId(duplicate ? undefined : item._id)
    setScheduleMode("now")
    setScheduledAt("")
    setShowHistory(false)
    setBroadcastResult(null)
    toast.success(duplicate ? "Campaign duplicated into studio!" : "Campaign loaded from history")
  }

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await deleteCampaignMutation(id).unwrap()
      if (activeCampaignId === id) setActiveCampaignId(undefined)
      toast.success("Campaign removed from history")
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete campaign")
    }
  }

  const applyTemplate = (t: (typeof QUICK_TEMPLATES)[0]) => {
    setTopic(t.topic)
    setType(t.type)
    setTone(t.tone)
    if (t.ctaUrl) setCtaUrl(t.ctaUrl)
  }

  // ──────────────── RENDER ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* ═══ HERO ═══ */}
      <div className="relative bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-8 md:p-12 overflow-hidden shadow-2xl rounded-b-[2.5rem] md:mx-4 mx-0 mt-0 md:mt-4 z-10">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 w-fit">
              <Sparkles className="h-4 w-4 text-purple-200" />
              <span className="text-xs font-semibold tracking-wider text-white uppercase">
                AI Powered Marketing
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
              Campaign Studio Pro
            </h1>
            <p className="text-slate-200 max-w-xl text-sm md:text-base font-medium">
              Craft promotions with AI-generated copy &amp; visuals, attach coupons or products, test safely, and schedule or broadcast across channels.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="bg-white/15 border-white/25 text-white hover:bg-white/25 hover:text-white backdrop-blur-md rounded-full px-5"
            >
              <Clock className="h-4 w-4 mr-2" /> History &amp; Analytics ({campaignHistory.length})
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ History & Analytics Panel ═══ */}
      {showHistory && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 relative z-20">
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white">
            <CardHeader className="py-4 px-6 bg-slate-50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" /> Campaign History &amp; Analytics
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 max-h-[420px] overflow-y-auto">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading campaign history...
                </div>
              ) : campaignHistory.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No campaigns saved yet. Generate your first campaign below!
                </p>
              ) : (
                <div className="space-y-3">
                  {campaignHistory.map((item: CampaignRecord) => {
                    const stats = item.stats || {}
                    const totalRecipients = stats.totalRecipients || 0
                    const sentCount = stats.sentCount || 0
                    const deliveredCount = stats.deliveredCount || 0
                    const opens = stats.opens || 0
                    const clicks = stats.clicks || 0
                    const openRate =
                      deliveredCount > 0 ? Math.round((opens / deliveredCount) * 100) : 0
                    const couponLabel =
                      typeof item.couponId === "object" && item.couponId?.code
                        ? item.couponId.code
                        : item.couponCode

                    return (
                      <div
                        key={item._id}
                        className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors border border-slate-200/80"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {item.payload?.imageUrl ? (
                            <img
                              src={item.payload.imageUrl}
                              alt="Campaign Thumb"
                              className="h-12 w-12 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                              <Megaphone className="h-5 w-5 text-indigo-600" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p
                                onClick={() => loadCampaignIntoStudio(item, false)}
                                className="text-sm font-bold text-slate-800 truncate max-w-md cursor-pointer hover:text-indigo-600"
                              >
                                {item.topic}
                              </p>
                              <Badge
                                variant="outline"
                                className={`text-[10px] capitalize font-semibold ${
                                  STATUS_BADGE_MAP[item.status] || STATUS_BADGE_MAP.draft
                                }`}
                              >
                                {item.status}
                              </Badge>
                              {couponLabel && (
                                <Badge variant="secondary" className="text-[10px] font-mono">
                                  🎟 {couponLabel}
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span>Segment: <strong>{item.audienceType}</strong></span>
                              <span>•</span>
                              <span>Channels: {(item.channels || []).join(", ")}</span>
                              {item.status === "scheduled" && item.scheduledAt && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600 font-medium">
                                    Scheduled: {new Date(item.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                  </span>
                                </>
                              )}
                              {item.sentAt && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Sent: {new Date(item.sentAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Analytics Pills */}
                        <div className="grid grid-cols-4 gap-2 text-center bg-white px-3 py-2 rounded-xl border border-slate-200 shrink-0">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Target</p>
                            <p className="text-xs font-bold text-slate-800">{totalRecipients}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Sent/Del</p>
                            <p className="text-xs font-bold text-emerald-600">
                              {sentCount}/{deliveredCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Opens</p>
                            <p className="text-xs font-bold text-indigo-600">
                              {opens} ({openRate}%)
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Clicks</p>
                            <p className="text-xs font-bold text-purple-600">{clicks}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => loadCampaignIntoStudio(item, false)}
                          >
                            Open
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            onClick={() => loadCampaignIntoStudio(item, true)}
                            title="Duplicate settings into a new draft"
                          >
                            <CopyPlus className="h-3.5 w-3.5 mr-1" /> Duplicate
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => handleDeleteHistoryItem(item._id)}
                            title="Delete campaign"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ MAIN STACK ═══ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-2rem] md:mt-[-3rem] relative z-20">
        {showHistory && <div className="h-8" />}
        <div className="flex flex-col gap-8">
          {/* ═══ TOP: CONFIG PANEL ═══ */}
          <div className="w-full">
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <CardContent className="p-6 md:p-8 space-y-7">
                {/* Quick Templates */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" /> Quick Templates
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TEMPLATES.map((t) => (
                      <button
                        type="button"
                        key={t.label}
                        onClick={() => applyTemplate(t)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-50 to-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-sm transition-all"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-indigo-500" /> Objective / Theme
                  </label>
                  <textarea
                    placeholder="E.g., Winter Clearance Sale - 50% Off Jackets, Free Shipping over ₹999..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-700 font-medium placeholder:text-slate-400"
                  />
                </div>

                {/* Target Segment with Live Counts */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Target className="h-4 w-4 text-pink-500" /> Target Segment
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AUDIENCES.map((aud) => {
                      const count = segmentCounts ? segmentCounts[aud] : undefined
                      const isEmpty = count === 0
                      return (
                        <button
                          type="button"
                          key={aud}
                          onClick={() => setType(aud)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                            type === aud
                              ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span>{aud}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              type === aud
                                ? isEmpty
                                  ? "bg-amber-400/20 text-amber-300"
                                  : "bg-white/20 text-white"
                                : isEmpty
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {countsLoading ? "..." : count ?? 0}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {isZeroSegment && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>
                        <strong>{type}</strong> currently has <strong>0 customers</strong>. You can still generate previews &amp; run test sends, or choose another segment before broadcasting immediately.
                      </span>
                    </div>
                  )}
                </div>

                {/* Promo Coupon, Product/Category Attachment & CTA URL */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Attach Offer, Product &amp; Destination Link (Optional)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Attach Coupon */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Ticket className="h-3.5 w-3.5 text-amber-500" /> Attach Active Promo Code
                      </label>
                      <select
                        value={selectedCouponId}
                        onChange={(e) => setSelectedCouponId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">No Coupon Attached</option>
                        {activeCoupons.map((c: any) => (
                          <option key={c._id} value={c._id}>
                            {c.code} —{" "}
                            {c.discountType === "percentage"
                              ? `${c.discountAmount}% OFF`
                              : `₹${c.discountAmount} OFF`}
                            {c.minPurchaseAmount > 0 ? ` (Min ₹${c.minPurchaseAmount})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CTA / Redirect URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Link2 className="h-3.5 w-3.5 text-blue-500" /> CTA / Redirect URL
                      </label>
                      <input
                        type="text"
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        placeholder="/sale or https://yourdomain.com/sale"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Attach Product or Category */}
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-purple-500" /> Link Product or Category
                      </label>
                      <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5">
                        {(["none", "product", "category"] as const).map((mode) => (
                          <button
                            type="button"
                            key={mode}
                            onClick={() => {
                              setAttachTargetType(mode)
                              setTargetSearch("")
                              if (mode === "none") {
                                setSelectedProductId("")
                                setSelectedCategoryId("")
                              }
                            }}
                            className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                              attachTargetType === mode
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {mode === "none" ? "None" : mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {attachTargetType !== "none" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative">
                          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={targetSearch}
                            onChange={(e) => setTargetSearch(e.target.value)}
                            placeholder={`Filter ${attachTargetType}s by name...`}
                            className="w-full h-10 pl-8 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {attachTargetType === "product" ? (
                          <select
                            value={selectedProductId}
                            onChange={(e) => handleProductSelect(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select a Product...</option>
                            {filteredProducts.map((p: any) => (
                              <option key={p._id} value={p._id}>
                                {p.name} (₹{p.sellingPrice})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={selectedCategoryId}
                            onChange={(e) => handleCategorySelect(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select a Category...</option>
                            {filteredCategories.map((c: any) => (
                              <option key={c._id} value={c._id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tone */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="h-4 w-4 text-violet-500" /> Campaign Tone
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {TONE_OPTIONS.map((t) => {
                      const Icon = t.icon
                      return (
                        <button
                          type="button"
                          key={t.value}
                          onClick={() => setTone(t.value)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${
                            tone === t.value
                              ? `${t.color} shadow-sm ring-1 ring-current/20 scale-[1.03]`
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Channels */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <LayoutTemplate className="h-4 w-4 text-cyan-500" /> Delivery Channels
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        {
                          key: "email",
                          label: "Email HTML",
                          icon: Mail,
                          active: channels.includes("email"),
                          toggle: () => toggleChannel("email"),
                          activeColor: "bg-amber-50/70 border-amber-300 ring-1 ring-amber-500/20",
                          iconColor: "text-amber-600",
                          textColor: "text-amber-900",
                        },
                        {
                          key: "whatsapp",
                          label: "WhatsApp",
                          icon: Phone,
                          active: channels.includes("whatsapp"),
                          toggle: () => toggleChannel("whatsapp"),
                          activeColor: "bg-green-50/70 border-green-300 ring-1 ring-green-500/20",
                          iconColor: "text-green-600",
                          textColor: "text-green-900",
                        },
                        {
                          key: "push",
                          label: "App Push",
                          icon: MessageSquare,
                          active: channels.includes("push"),
                          toggle: () => toggleChannel("push"),
                          activeColor: "bg-purple-50/70 border-purple-300 ring-1 ring-purple-500/20",
                          iconColor: "text-purple-600",
                          textColor: "text-purple-900",
                        },
                      ] as const
                    ).map((ch) => {
                      const Icon = ch.icon
                      return (
                        <button
                          type="button"
                          key={ch.key}
                          onClick={ch.toggle}
                          className={`text-left cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all group ${
                            ch.active
                              ? ch.activeColor + " shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <Icon className={`h-5 w-5 ${ch.active ? ch.iconColor : "text-slate-400"}`} />
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                                ch.active
                                  ? `border-current ${ch.iconColor} bg-current`
                                  : "border-slate-300"
                              }`}
                            >
                              {ch.active && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                            </div>
                          </div>
                          <span
                            className={`font-semibold text-sm ${
                              ch.active ? ch.textColor : "text-slate-600"
                            }`}
                          >
                            {ch.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  type="button"
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin text-indigo-400" /> Generating Copy &amp; Visuals...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5 mr-3 text-indigo-400" /> Generate AI Assets
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ═══ BOTTOM: PREVIEW WORKSPACE ═══ */}
          <div className="w-full">
            {/* Empty state */}
            {!generatedData && !isGenerating && (
              <div className="h-full min-h-[420px] flex flex-col items-center justify-center rounded-2xl bg-white/70 border-2 border-dashed border-slate-200 text-center space-y-6 p-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50" />
                  <div className="relative h-24 w-24 bg-white shadow-xl shadow-slate-200/50 rounded-2xl flex items-center justify-center rotate-3 transition-transform hover:rotate-6">
                    <Sparkles className="h-12 w-12 text-indigo-400" />
                  </div>
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Campaign Workspace</h3>
                  <p className="text-slate-500 font-medium">
                    Pick a template or describe your objective, optionally attach a promo code or product, and let AI craft your campaign assets.
                  </p>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isGenerating && (
              <div className="h-full min-h-[420px] flex flex-col items-center justify-center rounded-2xl bg-white/90 border border-indigo-100 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-cyan-400 animate-pulse" />
                <div className="relative z-10 flex flex-col items-center space-y-6">
                  <div className="relative p-6 bg-indigo-50 rounded-full shadow-inner ring-4 ring-white">
                    <Wand2 className="h-12 w-12 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                      Engineering Intelligence
                    </h3>
                    <p className="text-slate-500 font-medium">
                      Crafting copy, generating banner image &amp; composing layouts…
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Generated Output ═══ */}
            {generatedData && !isGenerating && (
              <div className="space-y-6">
                {/* Broadcast result banner */}
                {broadcastResult && (
                  <div
                    className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-sm ${
                      broadcastResult.startsWith("Error")
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {broadcastResult.startsWith("Error") ? (
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                    ) : (
                      <Check className="h-5 w-5 shrink-0" />
                    )}
                    {broadcastResult}
                  </div>
                )}

                {/* ── AI Banner Image ── */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100 relative group">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-lg">
                      <ImageIcon className="h-3.5 w-3.5" /> AI Generated Banner
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    {generatedData.imageUrl && (
                      <a
                        href={generatedData.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-white/85 backdrop-blur-sm shadow-md hover:bg-white rounded-full h-8 px-3 text-xs font-semibold text-slate-700 transition-all hover:scale-105"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-indigo-600" /> Full Image
                      </a>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="bg-white/85 backdrop-blur-sm shadow-md hover:bg-white rounded-full h-8 text-xs font-semibold"
                      onClick={handleGenerate}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Regenerate
                    </Button>
                  </div>
                  {generatedData.imageUrl ? (
                    <div className="bg-slate-900/5 flex items-center justify-center min-h-[260px] relative overflow-hidden">
                      <img
                        src={generatedData.imageUrl}
                        alt="AI Campaign Banner"
                        className="w-full h-auto min-h-[240px] max-h-[480px] object-cover block transition-transform duration-700 group-hover:scale-[1.02]"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[220px] bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center space-y-3">
                      <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-700">Banner Generation Skipped</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Image API returned no result. Click &apos;Regenerate&apos; or check your Cloudinary settings.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Push + WhatsApp grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PUSH PREVIEW */}
                  {channels.includes("push") && (
                    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                      <CardHeader className="py-3 px-5 border-b border-slate-50 flex flex-row items-center justify-between bg-purple-50/30">
                        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-purple-600" /> App Push
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-slate-400 hover:text-purple-600"
                            onClick={() => startEdit("pushTitle", generatedData.pushTitle || "")}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-slate-400 hover:text-purple-600"
                            onClick={() =>
                              handleCopy(`${generatedData.pushTitle}\n${generatedData.pushBody}`, "Push")
                            }
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="mx-auto w-[240px] rounded-[28px] border-[3px] border-slate-800 bg-slate-900 p-1 shadow-2xl">
                          <div className="rounded-[24px] bg-white overflow-hidden">
                            <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-2 border-b">
                              <div className="h-5 w-5 rounded-md bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                                {generatedData.storeLogo ? (
                                  <img
                                    src={generatedData.storeLogo}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <ShoppingCart className="h-3 w-3 text-purple-600" />
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-slate-700 truncate">
                                {generatedData.storeName || "Store App"}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-auto shrink-0">now</span>
                            </div>
                            <div className="p-3 space-y-1.5">
                              {editingField === "pushTitle" ? (
                                <div className="space-y-1.5">
                                  <input
                                    className="w-full text-xs font-bold border rounded px-1.5 py-1 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                    value={editBuffer}
                                    onChange={(e) => setEditBuffer(e.target.value)}
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      className="h-5 text-[10px] px-2 bg-purple-500 hover:bg-purple-600 text-white"
                                      onClick={() => {
                                        confirmEdit()
                                        startEdit("pushBody", generatedData.pushBody || "")
                                      }}
                                    >
                                      <Check className="h-2.5 w-2.5 mr-1" /> Save
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-5 text-[10px] px-2" onClick={cancelEdit}>
                                      <X className="h-2.5 w-2.5" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <h4 className="font-bold text-[11px] text-slate-900 leading-tight">
                                  {generatedData.pushTitle}
                                </h4>
                              )}
                              {editingField === "pushBody" ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    className="w-full text-[10px] border rounded px-1.5 py-1 resize-none focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                    rows={2}
                                    value={editBuffer}
                                    onChange={(e) => setEditBuffer(e.target.value)}
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      className="h-5 text-[10px] px-2 bg-purple-500 hover:bg-purple-600 text-white"
                                      onClick={confirmEdit}
                                    >
                                      <Check className="h-2.5 w-2.5 mr-1" /> Save
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-5 text-[10px] px-2" onClick={cancelEdit}>
                                      <X className="h-2.5 w-2.5" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-600 text-[10px] leading-snug">
                                  {generatedData.pushBody}
                                </p>
                              )}
                              {generatedData.imageUrl && (
                                <div className="mt-1.5 rounded-lg overflow-hidden border border-slate-100">
                                  <img
                                    src={generatedData.imageUrl}
                                    alt="Rich Push"
                                    className="w-full h-[80px] object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-medium px-2">
                          <span
                            className={`${
                              (generatedData.pushTitle?.length || 0) > PUSH_TITLE_LIMIT ? "text-red-500" : ""
                            }`}
                          >
                            Title: {generatedData.pushTitle?.length || 0}/{PUSH_TITLE_LIMIT}
                          </span>
                          <span
                            className={`${
                              (generatedData.pushBody?.length || 0) > PUSH_BODY_LIMIT ? "text-red-500" : ""
                            }`}
                          >
                            Body: {generatedData.pushBody?.length || 0}/{PUSH_BODY_LIMIT}
                          </span>
                        </div>
                        {generatedData.pushDeepLink && (
                          <div className="mt-2 flex items-center gap-1.5 px-2">
                            <ExternalLink className="h-3 w-3 text-purple-400 shrink-0" />
                            <span className="text-[10px] text-purple-500 font-medium truncate">
                              {generatedData.pushDeepLink}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* WHATSAPP PREVIEW */}
                  {channels.includes("whatsapp") && (
                    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      <CardHeader className="py-3 px-5 border-b border-slate-50 flex flex-row items-center justify-between bg-emerald-50/30">
                        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-emerald-600" /> WhatsApp
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-slate-400 hover:text-emerald-600"
                            onClick={() => startEdit("whatsappText", generatedData.whatsappText || "")}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-slate-400 hover:text-emerald-600"
                            onClick={() => handleCopy(generatedData.whatsappText || "", "WhatsApp")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="bg-[#efeae2] rounded-xl p-4 min-h-[160px]">
                          <div className="bg-[#dcf8c6] rounded-xl rounded-tl-sm shadow-sm border border-[#c5e8b0] relative max-w-[95%] ml-auto overflow-hidden">
                            {generatedData.imageUrl && (
                              <div className="w-full">
                                <img
                                  src={generatedData.imageUrl}
                                  alt="WhatsApp Media"
                                  className="w-full h-[140px] object-cover"
                                />
                              </div>
                            )}
                            <div className="p-3">
                              {editingField === "whatsappText" ? (
                                <div className="space-y-2">
                                  <textarea
                                    className="w-full text-sm border rounded-lg p-2 resize-none focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
                                    rows={4}
                                    value={editBuffer}
                                    onChange={(e) => setEditBuffer(e.target.value)}
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                                      onClick={confirmEdit}
                                    >
                                      <Check className="h-3 w-3 mr-1" /> Save
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelEdit}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[#111b21] text-sm whitespace-pre-wrap font-medium leading-relaxed">
                                  {generatedData.whatsappText}
                                </p>
                              )}
                              <div className="text-[10px] text-[#667781] text-right mt-2 font-medium">
                                {previewTime} ✓✓
                              </div>
                            </div>
                            {generatedData.whatsappButtons && generatedData.whatsappButtons.length > 0 && (
                              <div className="border-t border-[#c5e8b0]">
                                {generatedData.whatsappButtons.map((btn, i) => (
                                  <div
                                    key={i}
                                    className={`text-center py-2 text-[13px] font-semibold text-[#00a884] ${
                                      i > 0 ? "border-t border-[#c5e8b0]" : ""
                                    }`}
                                  >
                                    <ExternalLink className="h-3 w-3 inline mr-1.5 -mt-0.5" />
                                    {btn}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* ── Email Preview ── */}
                {channels.includes("email") && (
                  <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="py-4 px-6 border-b border-slate-100 flex justify-between items-start md:items-center flex-col md:flex-row gap-4 bg-slate-50">
                      <div className="space-y-1 min-w-0 flex-1">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Mail className="h-4 w-4 text-amber-500" /> Email Blast
                        </CardTitle>
                        {editingField === "emailSubject" ? (
                          <div className="flex gap-2 items-center">
                            <input
                              className="flex-1 text-base font-bold border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              value={editBuffer}
                              onChange={(e) => setEditBuffer(e.target.value)}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              className="h-8 bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={confirmEdit}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8" onClick={cancelEdit}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/subj">
                            <p className="text-lg font-bold text-slate-800 leading-tight truncate">
                              {generatedData.emailSubject}
                            </p>
                            <button
                              type="button"
                              className="opacity-0 group-hover/subj:opacity-100 transition-opacity"
                              onClick={() => startEdit("emailSubject", generatedData.emailSubject || "")}
                            >
                              <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-amber-600" />
                            </button>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleCopy(generatedData.emailHtml || "", "Email HTML")}
                        className="bg-slate-900 text-white rounded-full hover:bg-slate-800 shadow-md h-9 text-xs px-5"
                      >
                        <Copy className="h-3.5 w-3.5 mr-2" /> GET HTML SOURCE
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="bg-[#f3f4f6] p-4 md:p-8">
                        <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 bg-white h-[500px]">
                          <iframe
                            srcDoc={
                              generatedData.emailHtml ||
                              "<div style='padding:40px; text-align:center; font-family:sans-serif;'>No HTML Generated</div>"
                            }
                            title="Email Preview"
                            className="w-full h-full border-none bg-white"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ── TEST SEND, SCHEDULING & BROADCAST BAR ── */}
                <Card className="border-0 shadow-xl rounded-2xl bg-white p-6 md:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Delivery &amp; Launch Controls</h3>
                      <p className="text-xs text-slate-500">
                        Verify with a safe Test Send first, then send immediately or schedule for later.
                      </p>
                    </div>

                    {/* Send Now vs Schedule Toggle */}
                    <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start md:self-auto">
                      <button
                        type="button"
                        onClick={() => setScheduleMode("now")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          scheduleMode === "now"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Send className="h-3.5 w-3.5 text-emerald-600" />
                        Send Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleMode("schedule")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          scheduleMode === "schedule"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <CalendarClock className="h-3.5 w-3.5 text-blue-600" />
                        Schedule for Later
                      </button>
                    </div>
                  </div>

                  {scheduleMode === "schedule" && (
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-2 text-blue-800 text-sm font-semibold">
                        <CalendarClock className="h-5 w-5 shrink-0" />
                        <span>Select Launch Date &amp; Time:</span>
                      </div>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        min={minDateTimeLocal}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-blue-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {scheduleMode === "now" && isZeroSegment && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs font-semibold text-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        Broadcast Now is disabled because &ldquo;{type}&rdquo; has 0 qualifying customers. Switch target segment or use Send Test.
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTestDialog(true)}
                      className="h-14 px-8 rounded-full font-bold text-sm border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 w-full sm:w-auto"
                    >
                      <FlaskConical className="h-4 w-4 mr-2" />
                      Send Test
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setShowConfirmDialog(true)}
                      disabled={isBroadcasting || (scheduleMode === "now" && isZeroSegment)}
                      className={`group border-0 h-14 px-10 rounded-full font-black text-base transition-all w-full sm:w-auto text-white shadow-lg ${
                        scheduleMode === "schedule"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                          : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
                      }`}
                    >
                      {scheduleMode === "schedule" ? (
                        <>
                          <CalendarClock className="h-5 w-5 mr-2.5" />
                          SCHEDULE CAMPAIGN
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          1-CLICK BROADCAST ALL ({selectedSegmentCount ?? 0})
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ TEST SEND DIALOG ═══ */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FlaskConical className="h-5 w-5 text-indigo-600" /> Send Test Preview
            </DialogTitle>
            <DialogDescription className="text-slate-500 pt-1">
              Safely verify your Email HTML layout and WhatsApp message format before launching to customers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Admin / Test Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Test WhatsApp Number <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="10-digit mobile or +91..."
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowTestDialog(false)} className="rounded-full">
              Cancel
            </Button>
            <Button
              onClick={handleSendTest}
              disabled={isTestingSend}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6"
            >
              {isTestingSend ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending Test...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Send Test Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ BROADCAST / SCHEDULE CONFIRMATION DIALOG ═══ */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {scheduleMode === "schedule" ? (
                <>
                  <CalendarClock className="h-6 w-6 text-blue-600" /> Confirm Scheduled Launch
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-amber-500" /> Confirm Broadcast
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-500 pt-2">
              {scheduleMode === "schedule"
                ? "This campaign will be queued and automatically sent at your selected time."
                : "You are about to send this campaign to your audience. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
              <Users className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800">Target Audience</p>
                <p className="text-xs text-slate-500">
                  {type} ({selectedSegmentCount ?? 0} customers)
                </p>
              </div>
            </div>

            {scheduleMode === "schedule" && scheduledAt && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                <CalendarClock className="h-4 w-4 shrink-0" />
                <span>
                  Scheduled For:{" "}
                  {new Date(scheduledAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {channels.map((ch) => (
                <span
                  key={ch}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {ch === "push" ? "📱 App Push" : ch === "whatsapp" ? "💬 WhatsApp" : "📧 Email"}
                </span>
              ))}
              {selectedCouponObj && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  🎟 {selectedCouponObj.code}
                </span>
              )}
            </div>

            {generatedData?.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={generatedData.imageUrl}
                  alt="Campaign Banner"
                  className="w-full h-[120px] object-cover"
                />
              </div>
            )}

            <p className="text-xs text-slate-500 font-medium bg-amber-50 p-3 rounded-lg border border-amber-100">
              {scheduleMode === "schedule"
                ? "⏰ Your campaign will be dispatched automatically by the server scheduler at the scheduled timestamp."
                : "⚠️ Messages will be delivered immediately to all qualifying users in the selected segment."}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="rounded-full">
              Cancel
            </Button>
            <Button
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className={`text-white rounded-full px-6 shadow-lg ${
                scheduleMode === "schedule"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500"
              }`}
            >
              {isBroadcasting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                  {scheduleMode === "schedule" ? "Scheduling..." : "Sending..."}
                </>
              ) : scheduleMode === "schedule" ? (
                <>
                  <CalendarClock className="h-4 w-4 mr-2" /> Confirm Schedule
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Send Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
