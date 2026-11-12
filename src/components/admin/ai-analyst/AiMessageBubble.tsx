"use client"

import {
  Bot,
  User,
  Volume2,
  VolumeX,
  Table2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Lightbulb,
} from "lucide-react"
import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import ReactMarkdown from "react-markdown"

const AiDynamicChart = dynamic(() => import("./AiDynamicChart"), { ssr: false })

export interface KpiCardData {
  label: string
  value: string
  changePercent?: number
  trend?: "up" | "down" | "neutral"
}

export interface MessageData {
  role: "user" | "assistant"
  content: string
  spokenResponse?: string
  detailedMarkdown?: string
  kpiCards?: KpiCardData[]
  chartConfig?: any
  chart?: any
  table?: {
    title: string
    headers: string[]
    rows: string[][]
  } | null
  actionableRecommendations?: string[]
  timestamp: Date
}

export default function AiMessageBubble({ message }: { message: MessageData }) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speechText = message.spokenResponse || message.content

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !speechText) return

    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(speechText)
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

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }, [speechText, isSpeaking])

  const isUser = message.role === "user"
  const hasKpis = !!message.kpiCards && message.kpiCards.length > 0
  const hasChart =
    (message.chartConfig?.shouldRenderChart && message.chartConfig?.data?.length > 0) ||
    (message.chart?.data && message.chart.data.length > 0)
  const hasRecommendations =
    !!message.actionableRecommendations && message.actionableRecommendations.length > 0

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar Icon */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-md ${
          isUser
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-bold"
            : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble Container */}
      <div
        className={`max-w-[92%] sm:max-w-[85%] space-y-3 rounded-2xl px-4 py-3 shadow-md ${
          isUser
            ? "rounded-br-md bg-emerald-600 text-white font-medium text-sm leading-relaxed"
            : "rounded-bl-md border border-white/[0.08] bg-gray-900/90 text-gray-100"
        }`}
      >
        {/* Header / Spoken Response Bar (AI Only) */}
        {!isUser && (
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-xs text-gray-400">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px] tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Aura Intelligence
            </span>

            {speechText && (
              <button
                onClick={speak}
                title={isSpeaking ? "Mute audio brief" : "Listen to audio brief"}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                  isSpeaking
                    ? "bg-emerald-500/20 text-emerald-300 animate-pulse border border-emerald-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{isSpeaking ? "Mute" : "Audio Brief"}</span>
              </button>
            )}
          </div>
        )}

        {/* 1. KPI Cards Grid (Rendered above analysis if available) */}
        {!isUser && hasKpis && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {message.kpiCards!.map((kpi, kIdx) => {
              const isUp = kpi.trend === "up" || (kpi.changePercent && kpi.changePercent > 0)
              const isDown = kpi.trend === "down" || (kpi.changePercent && kpi.changePercent < 0)

              return (
                <div
                  key={kIdx}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 transition-all hover:border-emerald-500/30 shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">
                    {kpi.label}
                  </p>
                  <p className="text-base font-extrabold text-white mt-0.5 tracking-tight">
                    {kpi.value}
                  </p>
                  {kpi.changePercent !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      {isUp ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : isDown ? (
                        <TrendingDown className="w-3 h-3 text-rose-400" />
                      ) : (
                        <Minus className="w-3 h-3 text-gray-400" />
                      )}
                      <span
                        className={`text-[10px] font-bold ${
                          isUp ? "text-emerald-400" : isDown ? "text-rose-400" : "text-gray-400"
                        }`}
                      >
                        {kpi.changePercent > 0 ? "+" : ""}
                        {kpi.changePercent}%
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* 2. Detailed Markdown Analysis / User Question */}
        <div className="prose prose-invert prose-xs sm:prose-sm max-w-none text-xs sm:text-sm leading-relaxed text-gray-200">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold text-emerald-300 mt-3 mb-1.5 flex items-center gap-1.5">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-bold text-white mt-2 mb-1">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                li: ({ children }) => <li className="text-gray-300">{children}</li>,
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">{children}</strong>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-black/40 px-1 py-0.5 text-[11px] font-mono text-emerald-300">
                    {children}
                  </code>
                ),
              }}
            >
              {message.detailedMarkdown || message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* 3. Dynamic Recharts Chart */}
        {!isUser && hasChart && (
          <div className="pt-2">
            <AiDynamicChart chart={message.chartConfig || message.chart} />
          </div>
        )}

        {/* 4. Table Fallback */}
        {!isUser && message.table && (
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
              <Table2 className="w-3.5 h-3.5" />
              <span>{message.table.title}</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.04]">
                    {message.table.headers.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-3 py-2 font-bold uppercase tracking-wider text-gray-400 text-[10px]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {message.table.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-white/[0.02] transition-colors">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="whitespace-nowrap px-3 py-2 text-gray-300 font-medium">
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

        {/* 5. Actionable Insights & Recommendations */}
        {!isUser && hasRecommendations && (
          <div className="mt-2.5 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-3.5 shadow-md space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5" />
              Actionable Recommendations
            </div>
            <div className="space-y-1.5">
              {message.actionableRecommendations!.map((rec, rIdx) => (
                <div
                  key={rIdx}
                  className="p-2 rounded-xl bg-gray-950/60 border border-white/[0.05] text-xs text-gray-300 leading-snug"
                >
                  <span className="text-amber-400 font-bold mr-1.5">•</span>
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] text-gray-500 font-medium ${isUser ? "text-right" : "text-left"}`}>
          {message.timestamp.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
