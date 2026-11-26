"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  X,
  Send,
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
    "Namaste! I'm **Aura Intelligence**, your store data analyst. Ask me about net revenue, stockout risks, COD mix, or pending orders.",
  spokenResponse:
    "Hello! I am Aura Intelligence, your store data analyst. Ask me about your revenue, stockout risks, COD mix, or order trends.",
  kpiCards: [],
  chartConfig: null,
  chart: null,
  table: null,
  actionableRecommendations: [],
  timestamp: new Date(),
}

const SUGGESTION_CHIPS = [
  "Today's revenue summary",
  "Low stock products",
  "Top selling this week",
  "Pending orders",
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
      setTimeout(() => inputRef.current?.focus(), 250)
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
        className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Clean Light Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white text-slate-900 shadow-2xl border-l border-slate-200 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-slate-900">
                  Aura Intelligence
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  Live Analyst
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Store Intelligence &amp; Data Analyst
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={clearChat}
              title="Clear chat session"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close drawer"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Proactive Diagnostic Alerts Bar */}
        {alertCount > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-900 font-medium truncate">
                {alertCount} Alert{alertCount > 1 ? "s" : ""}: {alerts[0]?.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleAlertClick(alerts[0])}
              className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white text-amber-800 hover:bg-amber-100 border border-amber-300 shrink-0 transition-colors"
            >
              Inspect
            </button>
          </div>
        )}

        {/* Chat Message View */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white">
          {messages.map((msg, idx) => (
            <AiMessageBubble key={idx} message={msg} />
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
                <span className="text-xs font-medium text-slate-600 block">
                  Analyzing store metrics...
                </span>
                <div className="flex items-center gap-1 pt-0.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Compact Quick Query Pills */}
          {messages.length <= 1 && !isThinking && (
            <div className="space-y-2 pt-1 pl-11">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Quick Insights
              </span>
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => sendMessage(chip)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 font-medium transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 whitespace-nowrap"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Unified Light Input Bar */}
        <div className="border-t border-slate-200 bg-white p-4">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all"
          >
            <AiVoiceButton onTranscript={handleVoiceTranscript} disabled={isThinking} />

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about revenue, stock levels, COD mix, or orders..."
              disabled={isThinking}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
