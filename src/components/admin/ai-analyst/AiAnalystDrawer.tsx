"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Send, Sparkles, Trash2, BrainCircuit } from "lucide-react"
import { useAnalystChatMutation } from "@/redux/api/aiApi"
import AiMessageBubble from "./AiMessageBubble"
import dynamic from "next/dynamic"

const AiVoiceButton = dynamic(() => import("./AiVoiceButton"), { ssr: false })

interface Message {
  role: "user" | "assistant"
  content: string
  chart?: any
  table?: any
  timestamp: Date
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm Aura Analytics 🧠 — your AI Data Analyst. Ask me anything about your store's revenue, orders, products, customers, or performance. I can show you charts and tables too! Try: \"Show me this week's revenue trend\"",
  chart: null,
  table: null,
  timestamp: new Date(),
}

const SUGGESTION_CHIPS = [
  "Today's revenue?",
  "Top 5 selling products",
  "Order status breakdown",
  "Low stock alerts",
  "Customer insights",
  "Regional sales data",
]

export default function AiAnalystDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [analystChat] = useAnalystChatMutation()

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
    if (typeof window === "undefined" || !window.speechSynthesis) return
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

      const userMsg: Message = {
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setIsThinking(true)

      try {
        // Build history for context (exclude welcome message)
        const history = messages
          .filter((m) => m !== WELCOME_MESSAGE)
          .map((m) => ({ role: m.role, content: m.content }))

        const res: any = await analystChat({
          question: trimmed,
          history,
        }).unwrap()

        // Extract the actual data from the ApiResponse payload
        const data = res.data || res;

        const aiMsg: Message = {
          role: "assistant",
          content: data.answer || "I couldn't analyze that. Please try a different question.",
          chart: data.chart || null,
          table: data.table || null,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMsg])

        // Auto-speak the answer
        if (data.answer) {
          autoSpeak(data.answer)
        }
      } catch (err: any) {
        const errorMessage = err?.data?.message || err?.message || err?.error || "Unknown error";
        // console.error("AI Analyst Error:", errorMessage, err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              err?.data?.message || "Something went wrong. Please try again.",
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsThinking(false)
      }
    },
    [isThinking, messages, analystChat, autoSpeak]
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
    speechSynthesis?.cancel()
    setMessages([WELCOME_MESSAGE])
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          fixed right-0 top-0 z-[70] flex h-full w-full max-w-[480px] flex-col
          border-l border-white/[0.06]
          bg-gradient-to-b from-[#0f0f1a] via-[#111127] to-[#0d0d1a]
          shadow-2xl shadow-indigo-500/5
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 shadow-lg shadow-violet-500/10">
              <BrainCircuit className="h-5 w-5 text-violet-300" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#0f0f1a]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Aura Analytics</h2>
              <p className="text-[11px] text-gray-500">AI Data Analyst • Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-300"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {messages.map((msg, idx) => (
            <AiMessageBubble key={idx} message={msg} />
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30">
                <BrainCircuit className="h-4 w-4 text-violet-300" />
              </div>
              <div className="rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.04] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Suggestion chips (only show when few messages) */}
          {messages.length <= 1 && !isThinking && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs text-gray-400 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
                >
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.06] bg-white/[0.02] p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <AiVoiceButton onTranscript={handleVoiceTranscript} disabled={isThinking} />

            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your store data..."
                disabled={isThinking}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/20 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/80 text-white transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-2 text-center text-[10px] text-gray-600">
            Aura Analytics uses AI. Responses may not always be accurate.
          </p>
        </div>
      </div>
    </>
  )
}
