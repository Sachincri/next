"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  X,
  Send,
  Sparkles,
  Trash2,
  BrainCircuit,
  AlertTriangle,
} from "lucide-react"
import {
  useAskAnalystMutation,
  useGetProactiveAlertsQuery,
} from "@/redux/api/aiApi"
import AiMessageBubble, { MessageData } from "./AiMessageBubble"
import dynamic from "next/dynamic"

const AiVoiceButton = dynamic(() => import("./AiVoiceButton"), { ssr: false })

const WELCOME_MESSAGE: MessageData = {
  role: "assistant",
  content:
    "Namaste! I'm **Aura Intelligence** 🧠 — your Autonomous Store Intelligence & Data Analyst.\n\nI can analyze your **Net Revenue, AOV, 7-day Stockout Velocity, COD vs Prepaid mix, VIP Customer Segments, and Regional Delivery/RTO Trends** using real-time database tools. What business metrics would you like to explore?",
  spokenResponse:
    "Hello! I am Aura Intelligence, your store data analyst. Ask me about your revenue, stockout risks, COD mix, or order trends.",
  kpiCards: [],
  chartConfig: null,
  chart: null,
  table: null,
  actionableRecommendations: [
    "Run 30-day net revenue analysis to evaluate current AOV and discount impact.",
    "Inspect top products with critical 7-day stockout risk (< 5 days remaining).",
  ],
  timestamp: new Date(),
}

const SUGGESTION_CHIPS = [
  "📊 30-Day Net Revenue & AOV",
  "🔥 Critical Stockout Risk (7-Day)",
  "📦 COD vs Prepaid & RTO Rates",
  "👥 VIP Repeat vs At-Risk Segments",
  "🗺️ Regional Sales & RTO Hotspots",
  "📦 Order Delivery & Status Trends",
]

export default function AiAnalystDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [messages, setMessages] = useState<MessageData[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [askAnalyst] = useAskAnalystMutation()
  const { data: alertsData } = useGetProactiveAlertsQuery(undefined, {
    skip: !isOpen,
    pollingInterval: 60000,
  })

  const alerts = alertsData?.data?.alerts || []
  const alertCount = alertsData?.data?.alertCount || 0

  // Initialize persistent session ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      let stored = sessionStorage.getItem("aura_analyst_session")
      if (!stored) {
        stored = `aura_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        sessionStorage.setItem("aura_analyst_session", stored)
      }
      setSessionId(stored)
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Auto-speak AI response
  const autoSpeak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-IN"
    utterance.rate = 1.05
    utterance.pitch = 1.0
    const voices = speechSynthesis.getVoices()
    const preferred =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Female") || v.name.includes("Google") || v.name.includes("Samantha"))
      ) || voices.find((v) => v.lang.startsWith("en"))
    if (preferred) utterance.voice = preferred
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isThinking) return

      const userMsg: MessageData = {
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setIsThinking(true)

      try {
        const history = messages
          .filter((m) => m !== WELCOME_MESSAGE)
          .map((m) => ({
            role: m.role,
            content: m.detailedMarkdown || m.content,
          }))

        const res: any = await askAnalyst({
          question: trimmed,
          conversationHistory: history,
          sessionId: sessionId || undefined,
        }).unwrap()

        const data = res.data || res

        const aiMsg: MessageData = {
          role: "assistant",
          content: data.detailedMarkdown || data.answer || "I have analyzed your store metrics.",
          spokenResponse: data.spokenResponse || data.answer,
          detailedMarkdown: data.detailedMarkdown,
          kpiCards: Array.isArray(data.kpiCards) ? data.kpiCards : [],
          chartConfig: data.chartConfig || null,
          chart: data.chart || null,
          table: data.table || null,
          actionableRecommendations: Array.isArray(data.actionableRecommendations)
            ? data.actionableRecommendations
            : [],
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMsg])

        if (data.spokenResponse) {
          autoSpeak(data.spokenResponse)
        } else if (data.answer) {
          autoSpeak(data.answer)
        }
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              err?.data?.message ||
              err?.message ||
              "Something went wrong while analyzing the data. Please try again.",
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsThinking(false)
      }
    },
    [isThinking, messages, askAnalyst, autoSpeak, sessionId]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      sendMessage(text)
    },
    [sendMessage]
  )

  const clearChat = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      speechSynthesis.cancel()
    }
    setMessages([WELCOME_MESSAGE])
  }

  const handleAlertClick = (alert: any) => {
    sendMessage(
      `Analyze the proactive alert regarding: "${alert.title}". ${alert.description}. What immediate actions should we take?`
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-gray-950/95 text-white shadow-2xl backdrop-blur-xl border-l border-white/[0.08] transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-lg shadow-emerald-500/25 text-slate-950 font-black">
              <BrainCircuit className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  Aura Intelligence
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live AI Analyst
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Autonomous Store Intelligence & Data Analyst
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Clear chat session"
              className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close drawer"
              className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Proactive Diagnostic Alerts Bar */}
        {alertCount > 0 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span className="text-amber-200 font-bold truncate text-[11px]">
                {alertCount} Proactive Alert{alertCount > 1 ? "s" : ""}: {alerts[0]?.title}
              </span>
            </div>
            <button
              onClick={() => handleAlertClick(alerts[0])}
              className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 shrink-0 transition-colors"
            >
              Inspect
            </button>
          </div>
        )}

        {/* Chat Message View */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {messages.map((msg, idx) => (
            <AiMessageBubble key={idx} message={msg} />
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-md border border-white/[0.08] bg-gray-900/90 px-4 py-3 shadow-md space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 animate-spin" /> Querying Database & Analyzing Metrics...
                  </span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Suggestion Chips */}
          {messages.length <= 1 && !isThinking && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block px-1">
                Recommended Analysis Queries:
              </span>
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-gray-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300 text-left font-medium active:scale-95 shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/[0.08] bg-white/[0.02] p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <AiVoiceButton onTranscript={handleVoiceTranscript} disabled={isThinking} />

            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about net revenue, stockout risks, COD mix, or order trends..."
                disabled={isThinking}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-bold transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30 shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Autonomous Analytics Engine
            </span>
            <span>Self-Correcting AST Sandbox</span>
          </div>
        </div>
      </div>
    </>
  )
}
