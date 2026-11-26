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
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-indigo-50 border border-indigo-100 text-indigo-600"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble Container */}
      <div
        className={`max-w-[92%] sm:max-w-[85%] space-y-2.5 rounded-2xl px-4 py-3 shadow-xs ${
          isUser
            ? "rounded-br-sm bg-indigo-600 text-white font-medium text-sm leading-relaxed"
            : "rounded-bl-sm border border-slate-200 bg-slate-50 text-slate-800"
        }`}
      >
        {/* 1. KPI Cards Grid */}
        {!isUser && hasKpis && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {message.kpiCards!.map((kpi, kIdx) => {
              const isUp = kpi.trend === "up" || (kpi.changePercent && kpi.changePercent > 0)
              const isDown = kpi.trend === "down" || (kpi.changePercent && kpi.changePercent < 0)

              return (
                <div
                  key={kIdx}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 transition-colors hover:border-indigo-300"
                >
                  <p className="text-[11px] font-medium text-slate-500 truncate">
                    {kpi.label}
                  </p>
                  <p className="text-base font-bold text-slate-900 mt-0.5 tracking-tight">
                    {kpi.value}
                  </p>
                  {kpi.changePercent !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      {isUp ? (
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                      ) : isDown ? (
                        <TrendingDown className="w-3 h-3 text-rose-600" />
                      ) : (
                        <Minus className="w-3 h-3 text-slate-400" />
                      )}
                      <span
                        className={`text-[11px] font-semibold ${
                          isUp ? "text-emerald-600" : isDown ? "text-rose-600" : "text-slate-500"
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

        {/* 2. Markdown Analysis / User Message */}
        <div
          className={`prose prose-xs sm:prose-sm max-w-none text-xs sm:text-sm leading-relaxed ${
            isUser ? "text-white" : "text-slate-800"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-sm font-semibold text-slate-900 mt-3 mb-1.5">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-semibold text-slate-900 mt-2 mb-1">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                li: ({ children }) => <li className="text-slate-700">{children}</li>,
                strong: ({ children }) => (
                  <strong className="text-slate-900 font-semibold">{children}</strong>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[11px] font-mono text-indigo-700">
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
          <div className="pt-1">
            <AiDynamicChart chart={message.chartConfig || message.chart} />
          </div>
        )}

        {/* 4. Data Table */}
        {!isUser && message.table && (
          <div className="pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-2">
              <Table2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{message.table.title}</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/80">
                    {message.table.headers.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-3 py-2 font-semibold uppercase tracking-wider text-slate-600 text-[10px]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {message.table.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="whitespace-nowrap px-3 py-2 text-slate-700 font-medium">
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

        {/* 5. Recommendations */}
        {!isUser && hasRecommendations && (
          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold">
              <Lightbulb className="w-3.5 h-3.5" />
              Recommendations
            </div>
            <ul className="space-y-1 text-xs text-slate-700 leading-snug pl-1">
              {message.actionableRecommendations!.map((rec, rIdx) => (
                <li key={rIdx} className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer: Timestamp & Subtle Audio Toggle */}
        <div className={`flex items-center gap-2 pt-0.5 ${isUser ? "justify-end" : "justify-between"}`}>
          <p className={`text-[11px] font-medium ${isUser ? "text-indigo-100" : "text-slate-500"}`}>
            {message.timestamp.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {!isUser && speechText && (
            <button
              type="button"
              onClick={speak}
              title={isSpeaking ? "Mute audio brief" : "Listen to audio brief"}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                isSpeaking
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200/70"
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>{isSpeaking ? "Mute" : "Listen"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
