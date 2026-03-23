"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

const PERIODS = [
  { label: "7D", key: "last7Days" },
  { label: "30D", key: "last30Days" },
  { label: "90D", key: "last90Days" },
  { label: "12M", key: "last12Months" },
] as const

type PeriodKey = typeof PERIODS[number]["key"]

const defaultSalesData = [
  { date: "Mon", revenue: 4000, profit: 1200, orders: 24 },
  { date: "Tue", revenue: 3000, profit: 900, orders: 18 },
  { date: "Wed", revenue: 5000, profit: 1500, orders: 32 },
  { date: "Thu", revenue: 4500, profit: 1350, orders: 28 },
  { date: "Fri", revenue: 6000, profit: 1800, orders: 38 },
  { date: "Sat", revenue: 5500, profit: 1650, orders: 35 },
  { date: "Sun", revenue: 7000, profit: 2100, orders: 42 },
]

function formatDate(raw: string, periodKey: PeriodKey): string {
  if (!raw) return ""
  try {
    if (raw.length === 7) {
      // "2026-02" -> "Feb 26"
      const [y, m] = raw.split("-")
      const d = new Date(Number(y), Number(m) - 1)
      return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
    }
    // "2026-02-18" -> "Feb 18"
    const d = new Date(raw)
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
  } catch {
    return raw
  }
}

function formatCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
  return `₹${value}`
}

interface ChartData {
  date?: string
  month?: string
  revenue: number
  profit?: number
  orders?: number
}

interface SalesChartProps {
  allData?: Record<string, { series: ChartData[] }>
  /** Legacy: single series (last7Days) */
  data?: ChartData[]
}

export default function SalesChart({ allData, data }: SalesChartProps) {
  const [period, setPeriod] = useState<PeriodKey>("last7Days")

  // Build normalized chart data
  const rawSeries: ChartData[] = allData
    ? (allData[period]?.series ?? [])
    : (data ?? defaultSalesData)

  const isDefault = !allData && !data
  const chartData = rawSeries.map((d) => ({
    ...d,
    label: formatDate((d.date ?? d.month) as string, period),
    revenue: d.revenue ?? 0,
    profit: d.profit ?? 0,
    orders: d.orders ?? 0,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-sm min-w-[160px]">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: p.stroke }} />
            <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
            <span className="font-bold text-foreground ml-auto">
              {p.dataKey === "orders" ? p.value : formatCurrency(p.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow min-w-0 overflow-hidden">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Revenue & Profit Trend</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isDefault ? "Sample data — connect orders to see real data" : "Based on non-cancelled orders"}
            </p>
          </div>
          {/* Period Selector */}
          {allData && (
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${period === p.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full min-w-0 bg-muted/20 rounded-xl p-2 sm:p-4 border border-border/50">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", color: "var(--color-muted-foreground)", paddingTop: "8px" }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Row */}
        {allData && (() => {
          const totRev = chartData.reduce((s, d) => s + d.revenue, 0)
          const totProfit = chartData.reduce((s, d) => s + d.profit, 0)
          const totOrders = chartData.reduce((s, d) => s + d.orders, 0)
          const margin = totRev > 0 ? ((totProfit / totRev) * 100).toFixed(1) : "0"
          return (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Total Revenue", value: formatCurrency(totRev), color: "text-blue-600" },
                { label: "Total Profit", value: formatCurrency(totProfit), color: "text-emerald-600" },
                { label: "Margin", value: `${margin}%`, color: "text-violet-600" },
              ].map((s) => (
                <div key={s.label} className="text-center bg-muted/30 rounded-lg p-2 border border-border/50">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}
