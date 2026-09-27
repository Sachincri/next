"use client"

import { Bot, User, Volume2, VolumeX, Table2 } from "lucide-react"
import { useState, useCallback } from "react"
import dynamic from "next/dynamic"

const AiDynamicChart = dynamic(() => import("./AiDynamicChart"), { ssr: false })

interface MessageData {
  role: "user" | "assistant"
  content: string
  chart?: {
    type: "bar" | "line" | "pie" | "area"
    title: string
    xKey?: string
    yKey?: string
    data: Record<string, any>[]
  } | null
  table?: {
    title: string
    headers: string[]
    rows: string[][]
  } | null
  timestamp: Date
}

export default function AiMessageBubble({ message }: { message: MessageData }) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(() => {
    if (typeof window === "undefined") return

    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(message.content)
    utterance.lang = "en-IN"
    utterance.rate = 1.0
    utterance.pitch = 1.0

    // Try to find a good voice
    const voices = speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Female") || v.name.includes("Google") || v.name.includes("Samantha"))
    ) || voices.find((v) => v.lang.startsWith("en"))
    if (preferred) utterance.voice = preferred

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }, [message.content, isSpeaking])

  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-indigo-500/20 text-indigo-400"
            : "bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className={`max-w-[85%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-br-md bg-indigo-500/20 text-indigo-100"
              : "rounded-bl-md bg-white/[0.04] text-gray-200 border border-white/[0.06]"
          }`}
        >
          {message.content}

          {/* Voice button for AI messages */}
          {!isUser && (
            <button
              onClick={speak}
              className="ml-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-300"
              title={isSpeaking ? "Stop speaking" : "Listen to response"}
            >
              {isSpeaking ? (
                <VolumeX className="h-3 w-3 text-red-400" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </button>
          )}
        </div>

        {/* Chart */}
        {!isUser && message.chart && message.chart.data?.length > 0 && (
          <AiDynamicChart chart={message.chart} />
        )}

        {/* Table */}
        {!isUser && message.table && message.table.rows?.length > 0 && (
          <div className="mt-2 rounded-xl border border-white/[0.06] bg-gradient-to-br from-gray-900/60 to-gray-800/40 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <Table2 className="h-3.5 w-3.5 text-gray-500" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {message.table.title}
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {message.table.headers.map((header, i) => (
                      <th
                        key={i}
                        className="whitespace-nowrap px-3 py-2 font-semibold text-gray-400"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {message.table.rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                    >
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="whitespace-nowrap px-3 py-2 text-gray-300"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] text-gray-600 ${isUser ? "text-right" : "text-left"}`}>
          {message.timestamp.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
