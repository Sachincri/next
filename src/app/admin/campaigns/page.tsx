"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
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
  ChevronRight,
  Palette,
  AlertTriangle,
  Users,
  Zap,
  PartyPopper,
  Flame,
  Gift,
  Star,
  ExternalLink
} from "lucide-react"
import toast from "react-hot-toast"
import { useGenerateCampaignDataMutation, useBroadcastCampaignMutation } from "@/redux/api/adminApi"

// ─── Types ───────────────────────────────────────────────────────────
type CampaignData = {
  pushTitle?: string
  pushBody?: string
  pushDeepLink?: string
  whatsappText?: string
  whatsappButtons?: string[]
  emailSubject?: string
  emailHtml?: string
  imageUrl?: string | null
  storeName?: string
  storeLogo?: string
}

type SavedCampaign = {
  id: string
  topic: string
  type: string
  tone: string
  channels: string[]
  data: CampaignData
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
  { label: "Flash Sale", topic: "Limited Time Flash Sale - Up to 70% Off on top brands. Hurry, offer ends tonight!", type: "All Customers", tone: "urgent" },
  { label: "Diwali Offer", topic: "Diwali Mega Sale 🪔 - Buy 2 Get 1 Free on entire collection. Celebrate with massive savings!", type: "All Customers", tone: "festive" },
  { label: "Cart Recovery", topic: "Your cart misses you! Complete your purchase now and get free shipping on your order.", type: "Abandoned Cart", tone: "casual" },
  { label: "New Arrival", topic: "Just Dropped: Our latest premium collection is now live. Be the first to shop the trend.", type: "Recently Viewed", tone: "luxury" },
  { label: "BOGO Deal", topic: "Buy One Get One Free - This weekend only. Stock up on your favorites before they're gone!", type: "Top Buyers", tone: "urgent" },
  { label: "Summer Sale", topic: "Summer Clearance - Flat 50% off on summer essentials. Refresh your wardrobe for less!", type: "All Customers", tone: "casual" },
]

const PUSH_TITLE_LIMIT = 40
const PUSH_BODY_LIMIT = 90

// ─── Helper ──────────────────────────────────────────────────────────
const getHistory = (): SavedCampaign[] => {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("campaign_history") || "[]")
  } catch { return [] }
}
const saveHistory = (list: SavedCampaign[]) => {
  localStorage.setItem("campaign_history", JSON.stringify(list.slice(0, 20)))
}

// ═════════════════════════════════════════════════════════════════════
export default function CampaignStudioPage() {
  const [generateCampaign] = useGenerateCampaignDataMutation()
  const [broadcastCampaign] = useBroadcastCampaignMutation()

  // ── Form state ─────────────────────────────────────────────────────
  const [topic, setTopic] = useState("")
  const [type, setType] = useState("Abandoned Cart")
  const [tone, setTone] = useState("professional")
  const [channels, setChannels] = useState<string[]>(["push", "whatsapp", "email"])

  // ── Generation state ───────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<CampaignData | null>(null)

  // ── Inline-edit state ──────────────────────────────────────────────
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editBuffer, setEditBuffer] = useState("")

  // ── Dialog / broadcast state ───────────────────────────────────────
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null)

  // ── History ────────────────────────────────────────────────────────
  const [history, setHistory] = useState<SavedCampaign[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => { setHistory(getHistory()) }, [])

  // ── Channel toggle ─────────────────────────────────────────────────
  const toggleChannel = (ch: string) =>
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])

  // ── Generate ───────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error("Please describe your campaign objective"); return }
    if (channels.length === 0) { toast.error("Select at least one delivery channel"); return }

    setIsGenerating(true)
    setGeneratedData(null)
    setBroadcastResult(null)

    try {
      const toneInstruction = tone !== "professional" ? ` Use a ${tone} tone.` : ""
      const res = await generateCampaign({
        topic: topic + toneInstruction,
        type,
        channels
      }).unwrap()

      setGeneratedData(res)

      // Save to history
      const entry: SavedCampaign = {
        id: Date.now().toString(),
        topic, type, tone, channels,
        data: res,
        createdAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      }
      const updated = [entry, ...getHistory()].slice(0, 20)
      saveHistory(updated)
      setHistory(updated)

      toast.success("Campaign assets generated!")
    } catch (err: any) {
      toast.error(err.data?.message || "Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Copy ────────────────────────────────────────────────────────────
  const handleCopy = (text: string, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  // ── Inline edit helpers ────────────────────────────────────────────
  const startEdit = (field: string, value: string) => {
    setEditingField(field)
    setEditBuffer(value)
  }
  const confirmEdit = useCallback(() => {
    if (!editingField || !generatedData) return
    setGeneratedData(prev => prev ? { ...prev, [editingField]: editBuffer } : prev)
    setEditingField(null)
    toast.success("Updated!")
  }, [editingField, editBuffer, generatedData])
  const cancelEdit = () => setEditingField(null)

  // ── Broadcast with confirmation ────────────────────────────────────
  const handleBroadcast = async () => {
    if (!generatedData) return
    setIsBroadcasting(true)
    setBroadcastResult(null)
    try {
      const res = await broadcastCampaign({
        audienceType: type, channels, payload: generatedData
      }).unwrap()
      setBroadcastResult(res.message || "Sent successfully!")
      toast.success(res.message || "Campaign broadcasted!")
    } catch (err: any) {
      setBroadcastResult("Error: " + (err.data?.message || "Broadcast failed"))
      toast.error(err.data?.message || "Broadcast failed")
    } finally {
      setIsBroadcasting(false)
      setShowConfirmDialog(false)
    }
  }

  // ── Load from history ──────────────────────────────────────────────
  const loadFromHistory = (item: SavedCampaign) => {
    setTopic(item.topic)
    setType(item.type)
    setTone(item.tone)
    setChannels(item.channels)
    setGeneratedData(item.data)
    setShowHistory(false)
    setBroadcastResult(null)
    toast.success("Campaign loaded from history")
  }

  const deleteFromHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id)
    saveHistory(updated)
    setHistory(updated)
  }

  // ── Apply quick template ───────────────────────────────────────────
  const applyTemplate = (t: typeof QUICK_TEMPLATES[0]) => {
    setTopic(t.topic)
    setType(t.type)
    setTone(t.tone)
  }

  // ──────────────── RENDER ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">

      {/* ═══ HERO ═══ */}
      <div className="relative bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-8 md:p-12 overflow-hidden shadow-2xl rounded-b-[2.5rem] md:mx-4 mx-0 mt-0 md:mt-4 z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit">
              <Sparkles className="h-4 w-4 text-purple-300" />
              <span className="text-xs font-semibold tracking-wider text-purple-100 uppercase">AI Powered Marketing</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Campaign <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Studio Pro</span>
            </h1>
            <p className="text-slate-300 max-w-xl text-sm md:text-base font-medium">
              Craft stunning promotions with AI-generated copy &amp; visuals, preview across channels, edit inline, and broadcast — all in one place.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-md rounded-full px-5"
            >
              <Clock className="h-4 w-4 mr-2" /> History ({history.length})
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ History Panel ═══ */}
      {showHistory && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 relative z-20">
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white">
            <CardHeader className="py-4 px-6 bg-slate-50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500" /> Campaign History
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 max-h-[300px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No campaigns generated yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                        <Megaphone className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadFromHistory(item)}>
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.topic}</p>
                        <p className="text-xs text-slate-400">{item.createdAt} · {item.type} · {item.tone}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500" onClick={() => deleteFromHistory(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 cursor-pointer" onClick={() => loadFromHistory(item)} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ MAIN STACK ═══ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-2rem] md:mt-[-3rem] relative z-20">
        {showHistory && <div className="h-12" />}
        <div className="flex flex-col gap-8">

          {/* ═══ TOP: CONFIG PANEL ═══ */}
          <div className="w-full">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <CardContent className="p-6 md:p-8 space-y-7">

                {/* Quick Templates */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" /> Quick Templates
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TEMPLATES.map(t => (
                      <button key={t.label} onClick={() => applyTemplate(t)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-50 to-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-sm transition-all">
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

                {/* Audience */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Target className="h-4 w-4 text-pink-500" /> Target Segment
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AUDIENCES.map(aud => (
                      <button key={aud} onClick={() => setType(aud)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${type === aud
                          ? "bg-slate-800 text-white border-slate-800 shadow-md scale-105"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}>
                        {aud}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="h-4 w-4 text-violet-500" /> Campaign Tone
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TONE_OPTIONS.map(t => {
                      const Icon = t.icon
                      return (
                        <button key={t.value} onClick={() => setTone(t.value)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${tone === t.value
                            ? `${t.color} shadow-sm ring-1 ring-current/20 scale-105`
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}>
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
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: "email", label: "Email HTML", icon: Mail, active: channels.includes("email"), toggle: () => toggleChannel("email"), activeColor: "bg-amber-50/50 border-amber-200 ring-1 ring-amber-500/20", iconColor: "text-amber-600", textColor: "text-amber-900" },
                      { key: "whatsapp", label: "WhatsApp", icon: Phone, active: channels.includes("whatsapp"), toggle: () => toggleChannel("whatsapp"), activeColor: "bg-green-50/50 border-green-200 ring-1 ring-green-500/20", iconColor: "text-green-600", textColor: "text-green-900" },
                      { key: "push", label: "App Push", icon: MessageSquare, active: channels.includes("push"), toggle: () => toggleChannel("push"), activeColor: "bg-purple-50/50 border-purple-200 ring-1 ring-purple-500/20", iconColor: "text-purple-600", textColor: "text-purple-900" },
                    ] as const).map(ch => {
                      const Icon = ch.icon
                      return (
                        <label key={ch.key} className={`cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all group ${ch.active ? ch.activeColor + " shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}`} onClick={ch.toggle}>
                          <div className="flex justify-between items-center">
                            <Icon className={`h-5 w-5 ${ch.active ? ch.iconColor : "text-slate-400"}`} />
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${ch.active ? `border-current ${ch.iconColor} bg-current` : "border-slate-300"}`}>
                              {ch.active && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                            </div>
                          </div>
                          <span className={`font-semibold text-sm ${ch.active ? ch.textColor : "text-slate-600"}`}>{ch.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating
                    ? <><Loader2 className="h-5 w-5 mr-3 animate-spin text-indigo-400" /> Generating Copy & Visuals...</>
                    : <><Wand2 className="h-5 w-5 mr-3 text-indigo-400" /> Generate AI Assets</>
                  }
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ═══ BOTTOM: PREVIEW WORKSPACE ═══ */}
          <div className="w-full">

            {/* Empty state */}
            {!generatedData && !isGenerating && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center rounded-2xl bg-white/50 border-2 border-dashed border-slate-200 text-center space-y-6 p-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50" />
                  <div className="relative h-24 w-24 bg-white shadow-xl shadow-slate-200/50 rounded-2xl flex items-center justify-center rotate-3 transition-transform hover:rotate-6">
                    <Sparkles className="h-12 w-12 text-indigo-400" />
                  </div>
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Campaign Workspace</h3>
                  <p className="text-slate-500 font-medium">Pick a template or describe your objective. AI will craft production-ready copy &amp; a matching banner here.</p>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isGenerating && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center rounded-2xl bg-white/80 border border-indigo-100 shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                <div className="absolute top-0 w-full h-1" style={{ backgroundImage: "linear-gradient(90deg, transparent, #818cf8, transparent)", animation: "shimmer 2s infinite" }} />
                <div className="relative z-10 flex flex-col items-center space-y-6">
                  <div className="relative p-6 bg-indigo-50 rounded-full shadow-inner ring-4 ring-white">
                    <Wand2 className="h-12 w-12 text-indigo-600 animate-pulse" />
                    <div className="absolute -inset-2 bg-indigo-400 rounded-full blur-xl opacity-30 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Engineering Intelligence</h3>
                    <p className="text-slate-500 font-medium">Crafting copy, generating banner image &amp; composing layouts…</p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Generated Output ═══ */}
            {generatedData && !isGenerating && (
              <div className="space-y-6">

                {/* Broadcast result banner */}
                {broadcastResult && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-sm ${broadcastResult.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                    {broadcastResult.startsWith("Error") ? <AlertTriangle className="h-5 w-5 shrink-0" /> : <Check className="h-5 w-5 shrink-0" />}
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
                  <div className="absolute top-4 right-4 z-10">
                    <Button size="sm" variant="secondary" className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-white rounded-full h-8 text-xs"
                      onClick={handleGenerate}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Regenerate
                    </Button>
                  </div>
                  {generatedData.imageUrl ? (
                    <div className="bg-slate-100 flex items-center justify-center min-h-[280px] relative overflow-hidden">
                      <img src={generatedData.imageUrl} alt="AI Campaign Banner" className="w-full h-full object-cover max-h-[420px] transition-transform duration-700 group-hover:scale-[1.03]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[220px] bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center space-y-3">
                      <div className="p-4 bg-orange-100 text-orange-600 rounded-full"><ImageIcon className="h-8 w-8" /></div>
                      <div>
                        <h3 className="font-bold text-slate-700">Banner Generation Skipped</h3>
                        <p className="text-sm text-slate-500 mt-1">Image API returned no result. Check your NVIDIA_API_KEY in .env or set IMAGE_PROVIDER=test</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Push + WhatsApp grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* PUSH PREVIEW — Mobile Frame with Rich Media */}
                  {channels.includes("push") && (
                    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                      <CardHeader className="py-3 px-5 border-b border-slate-50 flex flex-row items-center justify-between bg-purple-50/30">
                        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-purple-600" /> App Push
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-purple-600"
                            onClick={() => startEdit("pushTitle", generatedData.pushTitle || "")}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-purple-600"
                            onClick={() => handleCopy(`${generatedData.pushTitle}\n${generatedData.pushBody}`, "Push")}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5">
                        {/* Mini phone frame */}
                        <div className="mx-auto w-[240px] rounded-[28px] border-[3px] border-slate-800 bg-slate-900 p-1 shadow-2xl">
                          <div className="rounded-[24px] bg-white overflow-hidden">
                            <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-2 border-b">
                              <div className="h-5 w-5 rounded-md bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                                {generatedData.storeLogo ? (
                                  <img src={generatedData.storeLogo} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                  <ShoppingCart className="h-3 w-3 text-purple-600" />
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-slate-700 truncate">{generatedData.storeName || "Store App"}</span>
                              <span className="text-[10px] text-slate-400 ml-auto shrink-0">now</span>
                            </div>
                            <div className="p-3 space-y-1.5">
                              {editingField === "pushTitle" ? (
                                <div className="space-y-1.5">
                                  <input className="w-full text-xs font-bold border rounded px-1.5 py-1 focus:ring-1 focus:ring-purple-500 focus:outline-none" value={editBuffer} onChange={e => setEditBuffer(e.target.value)} autoFocus />
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" className="h-5 text-[10px] px-2 bg-purple-500 hover:bg-purple-600 text-white" onClick={() => { confirmEdit(); startEdit("pushBody", generatedData.pushBody || "") }}><Check className="h-2.5 w-2.5 mr-1" />Save</Button>
                                    <Button size="sm" variant="ghost" className="h-5 text-[10px] px-2" onClick={cancelEdit}><X className="h-2.5 w-2.5" /></Button>
                                  </div>
                                </div>
                              ) : (
                                <h4 className="font-bold text-[11px] text-slate-900 leading-tight">{generatedData.pushTitle}</h4>
                              )}
                              {editingField === "pushBody" ? (
                                <div className="space-y-1.5">
                                  <textarea className="w-full text-[10px] border rounded px-1.5 py-1 resize-none focus:ring-1 focus:ring-purple-500 focus:outline-none" rows={2} value={editBuffer} onChange={e => setEditBuffer(e.target.value)} autoFocus />
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" className="h-5 text-[10px] px-2 bg-purple-500 hover:bg-purple-600 text-white" onClick={confirmEdit}><Check className="h-2.5 w-2.5 mr-1" />Save</Button>
                                    <Button size="sm" variant="ghost" className="h-5 text-[10px] px-2" onClick={cancelEdit}><X className="h-2.5 w-2.5" /></Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-600 text-[10px] leading-snug">{generatedData.pushBody}</p>
                              )}
                              {/* Rich Media Thumbnail */}
                              {generatedData.imageUrl && (
                                <div className="mt-1.5 rounded-lg overflow-hidden border border-slate-100">
                                  <img src={generatedData.imageUrl} alt="Rich Push" className="w-full h-[80px] object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Char counts + Deep Link */}
                        <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-medium px-2">
                          <span className={`${(generatedData.pushTitle?.length || 0) > PUSH_TITLE_LIMIT ? "text-red-500" : ""}`}>Title: {generatedData.pushTitle?.length || 0}/{PUSH_TITLE_LIMIT}</span>
                          <span className={`${(generatedData.pushBody?.length || 0) > PUSH_BODY_LIMIT ? "text-red-500" : ""}`}>Body: {generatedData.pushBody?.length || 0}/{PUSH_BODY_LIMIT}</span>
                        </div>
                        {generatedData.pushDeepLink && (
                          <div className="mt-2 flex items-center gap-1.5 px-2">
                            <ExternalLink className="h-3 w-3 text-purple-400 shrink-0" />
                            <span className="text-[10px] text-purple-500 font-medium truncate">{generatedData.pushDeepLink}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* WHATSAPP PREVIEW with Image Header */}
                  {channels.includes("whatsapp") && (
                    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      <CardHeader className="py-3 px-5 border-b border-slate-50 flex flex-row items-center justify-between bg-emerald-50/30">
                        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-emerald-600" /> WhatsApp
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-emerald-600"
                            onClick={() => startEdit("whatsappText", generatedData.whatsappText || "")}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-emerald-600"
                            onClick={() => handleCopy(generatedData.whatsappText || "", "WhatsApp")}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="bg-[#efeae2] rounded-xl p-4 min-h-[160px] bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')]">
                          <div className="bg-[#dcf8c6] rounded-xl rounded-tl-sm shadow-sm border border-[#c5e8b0] relative max-w-[95%] ml-auto overflow-hidden">
                            {/* WhatsApp Image Header */}
                            {generatedData.imageUrl && (
                              <div className="w-full">
                                <img src={generatedData.imageUrl} alt="WhatsApp Media" className="w-full h-[140px] object-cover" />
                              </div>
                            )}
                            <div className="p-3">
                              {editingField === "whatsappText" ? (
                                <div className="space-y-2">
                                  <textarea className="w-full text-sm border rounded-lg p-2 resize-none focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white" rows={4} value={editBuffer} onChange={e => setEditBuffer(e.target.value)} autoFocus />
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white" onClick={confirmEdit}><Check className="h-3 w-3 mr-1" />Save</Button>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelEdit}><X className="h-3 w-3" /></Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[#111b21] text-sm whitespace-pre-wrap font-medium leading-relaxed">
                                  {generatedData.whatsappText}
                                </p>
                              )}
                              <div className="text-[10px] text-[#667781] text-right mt-2 font-medium">
                                {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} ✓✓
                              </div>
                            </div>
                            {/* WhatsApp CTA Buttons */}
                            {generatedData.whatsappButtons && generatedData.whatsappButtons.length > 0 && (
                              <div className="border-t border-[#c5e8b0]">
                                {generatedData.whatsappButtons.map((btn, i) => (
                                  <div key={i} className={`text-center py-2 text-[13px] font-semibold text-[#00a884] ${i > 0 ? "border-t border-[#c5e8b0]" : ""}`}>
                                    <ExternalLink className="h-3 w-3 inline mr-1.5 -mt-0.5" />{btn}
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
                            <input className="flex-1 text-base font-bold border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none" value={editBuffer} onChange={e => setEditBuffer(e.target.value)} autoFocus />
                            <Button size="sm" className="h-8 bg-amber-500 hover:bg-amber-600 text-white" onClick={confirmEdit}><Check className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-8" onClick={cancelEdit}><X className="h-3.5 w-3.5" /></Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/subj">
                            <p className="text-lg font-bold text-slate-800 leading-tight truncate">{generatedData.emailSubject}</p>
                            <button className="opacity-0 group-hover/subj:opacity-100 transition-opacity" onClick={() => startEdit("emailSubject", generatedData.emailSubject || "")}>
                              <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-amber-600" />
                            </button>
                          </div>
                        )}
                      </div>
                      <Button onClick={() => handleCopy(generatedData.emailHtml || "", "Email HTML")}
                        className="bg-slate-900 text-white rounded-full hover:bg-slate-800 shadow-md h-9 text-xs px-5">
                        <Copy className="h-3.5 w-3.5 mr-2" /> GET HTML SOURCE
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="bg-[#f3f4f6] p-4 md:p-8">
                        <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 bg-white h-[500px]">
                          <iframe
                            srcDoc={generatedData.emailHtml || "<div style='padding:40px; text-align:center; font-family:sans-serif;'>No HTML Generated</div>"}
                            title="Email Preview"
                            className="w-full h-full border-none bg-white"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ── BROADCAST BUTTON AT BOTTOM ── */}
                <div className="flex flex-col items-center pt-8 pb-4 space-y-4">
                  <div className="h-px w-full max-w-sm bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={isBroadcasting}
                    className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.7)] h-16 px-12 rounded-full font-black text-lg transition-all hover:scale-105 hover:shadow-[0_15px_50px_-10px_rgba(16,185,129,0.9)] w-full sm:w-auto"
                  >
                    <Send className="h-6 w-6 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                    1-CLICK BROADCAST ALL
                  </Button>
                  <p className="text-sm font-medium text-slate-400">Review your generated content across all channels before sending.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ BROADCAST CONFIRMATION DIALOG ═══ */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6 text-amber-500" /> Confirm Broadcast
            </DialogTitle>
            <DialogDescription className="text-slate-500 pt-2">
              You are about to send this campaign to your audience. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
              <Users className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800">Target Audience</p>
                <p className="text-xs text-slate-500">{type}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {channels.map(ch => (
                <span key={ch} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {ch === "push" ? "📱 App Push" : ch === "whatsapp" ? "💬 WhatsApp" : "📧 Email"}
                </span>
              ))}
            </div>
            {generatedData?.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <img src={generatedData.imageUrl} alt="Campaign Banner" className="w-full h-[120px] object-cover" />
              </div>
            )}
            <p className="text-xs text-slate-400 font-medium bg-amber-50 p-3 rounded-lg border border-amber-100">
              ⚠️ Messages will be delivered immediately to all qualifying users in the selected segment.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleBroadcast} disabled={isBroadcasting}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-6 shadow-lg">
              {isBroadcasting
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                : <><Send className="h-4 w-4 mr-2" /> Send Now</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
