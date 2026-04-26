"use client"

import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, RotateCcw } from "lucide-react"

const PERIODS = [
  { label: "7D", key: "last7Days" },
  { label: "30D", key: "last30Days" },
  { label: "90D", key: "last90Days" },
  { label: "12M", key: "last12Months" },
] as const

type PeriodKey = typeof PERIODS[number]["key"]

const defaultSalesData = [
  { date: "Mon", revenue: 4000, profit: 1200, orders: 24, grossSales: 4800, coinDiscount: 200, shippingFees: 100, refunds: 0 },
  { date: "Tue", revenue: 3000, profit: 900, orders: 18, grossSales: 3600, coinDiscount: 150, shippingFees: 50, refunds: 0 },
  { date: "Wed", revenue: 5000, profit: 1500, orders: 32, grossSales: 5800, coinDiscount: 300, shippingFees: 100, refunds: 0 },
  { date: "Thu", revenue: 4500, profit: 1350, orders: 28, grossSales: 5200, coinDiscount: 250, shippingFees: 50, refunds: 0 },
  { date: "Fri", revenue: 6000, profit: 1800, orders: 38, grossSales: 7000, coinDiscount: 400, shippingFees: 200, refunds: 0 },
  { date: "Sat", revenue: 5500, profit: 1650, orders: 35, grossSales: 6400, coinDiscount: 350, shippingFees: 150, refunds: 0 },
  { date: "Sun", revenue: 7000, profit: 2100, orders: 42, grossSales: 8200, coinDiscount: 500, shippingFees: 200, refunds: 0 },
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

function formatFullDate(raw: string): string {
  if (!raw) return ""
  try {
    if (raw.length === 7) {
      const [y, m] = raw.split("-")
      const d = new Date(Number(y), Number(m) - 1)
      return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    }
    const d = new Date(raw)
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return raw
  }
}

function formatCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`
  return `₹${Math.round(value)}`
}

function formatCurrencyFull(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0)
}

interface ChartData {
  date?: string
  month?: string
  revenue: number
  profit?: number
  orders?: number
  grossSales?: number
  coinDiscount?: number
  shippingFees?: number
  refunds?: number
  refundCount?: number
  cost?: number
  tax?: number
  gatewayFee?: number
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
    rawDate: (d.date ?? d.month) as string,
    revenue: d.revenue ?? 0,
    profit: d.profit ?? 0,
    orders: d.orders ?? 0,
    grossSales: d.grossSales ?? 0,
    coinDiscount: d.coinDiscount ?? 0,
    shippingFees: d.shippingFees ?? 0,
    refunds: d.refunds ?? 0,
    refundCount: d.refundCount ?? 0,
    cost: d.cost ?? 0,
    tax: d.tax ?? 0,
    gatewayFee: d.gatewayFee ?? 0,
  }))

  // Smart P&L Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload

    const hasBreakdown = d.grossSales > 0 || d.refunds > 0
    const margin = d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(1) : "0"

    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl min-w-[260px] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-muted/40 border-b border-border/50">
          <p className="font-bold text-foreground text-sm">{formatFullDate(d.rawDate)} Overview</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{d.orders} order{d.orders !== 1 ? "s" : ""}</p>
        </div>

        {/* Breakdown */}
        <div className="px-4 py-3 space-y-2">
          {hasBreakdown ? (
            <>
              {/* Gross Sales */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Gross Sales</span>
                <span className="font-semibold text-foreground">{formatCurrencyFull(d.grossSales)}</span>
              </div>

              {/* Coin Discount */}
              {d.coinDiscount > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Coins Discount</span>
                  <span className="font-semibold text-amber-600">-{formatCurrencyFull(d.coinDiscount)}</span>
                </div>
              )}

              {/* Shipping */}
              {d.shippingFees > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Shipping Collected</span>
                  <span className="font-semibold text-slate-500">+{formatCurrencyFull(d.shippingFees)}</span>
                </div>
              )}

              <div className="h-px bg-border/70 my-1" />

              {/* Net Revenue */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-semibold text-foreground">Net Revenue</span>
                </div>
                <span className="font-bold text-blue-600">{formatCurrencyFull(d.revenue + (d.refunds || 0))}</span>
              </div>

              {/* Refunds */}
              {d.refunds > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-3 h-3 text-red-500" />
                    <span className="text-red-600 font-medium">Refunds ({d.refundCount})</span>
                  </div>
                  <span className="font-bold text-red-600">-{formatCurrencyFull(d.refunds)}</span>
                </div>
              )}

              {/* Cost */}
              {d.cost > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Product Cost (COGS)</span>
                  <span className="font-semibold text-slate-500">-{formatCurrencyFull(d.cost)}</span>
                </div>
              )}

              {/* Tax */}
              {(d.tax ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Taxes (GST)</span>
                  <span className="font-semibold text-slate-500">-{formatCurrencyFull(d.tax)}</span>
                </div>
              )}

              {/* Gateway Fee */}
              {(d.gatewayFee ?? 0) > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Gateway Fees</span>
                  <span className="font-semibold text-slate-500">-{formatCurrencyFull(d.gatewayFee)}</span>
                </div>
              )}

              <div className="h-px bg-border/70 my-1" />

              {/* Net Profit */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">Net Profit</span>
                </div>
                <span className={`font-bold ${d.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrencyFull(d.profit)}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Fallback: simple values for default data */}
              {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.stroke || p.fill }} />
                  <span className="text-muted-foreground capitalize text-xs">{p.dataKey}:</span>
                  <span className="font-bold text-foreground ml-auto text-xs">
                    {p.dataKey === "orders" ? p.value : formatCurrencyFull(p.value)}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer: Margin indicator */}
        {hasBreakdown && (
          <div className="px-4 py-2 bg-muted/30 border-t border-border/50 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">Profit Margin</span>
            <div className="flex items-center gap-1">
              {Number(margin) > 20 ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              ) : Number(margin) < 10 ? (
                <ArrowDownRight className="w-3 h-3 text-red-500" />
              ) : (
                <Minus className="w-3 h-3 text-amber-500" />
              )}
              <span className={`text-xs font-bold ${Number(margin) > 20 ? "text-emerald-600" : Number(margin) < 10 ? "text-red-600" : "text-amber-600"}`}>
                {margin}%
              </span>
            </div>
          </div>
        )}
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
              {isDefault ? "Sample data — connect orders to see real data" : "Net of refunds · Hover for P&L breakdown"}
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
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)', strokeDasharray: '4 4' }} />
              <Legend
                wrapperStyle={{ fontSize: "11px", color: "var(--color-muted-foreground)", paddingTop: "8px" }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, fill: "#3b82f6", stroke: "#fff" }}
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="5 3"
                fill="url(#profitGradient)"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, fill: "#10b981", stroke: "#fff" }}
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Row */}
        {allData && (() => {
          const totRev = chartData.reduce((s, d) => s + d.revenue, 0)
          const totProfit = chartData.reduce((s, d) => s + d.profit, 0)
          const totRefunds = chartData.reduce((s, d) => s + d.refunds, 0)
          const totOrders = chartData.reduce((s, d) => s + d.orders, 0)
          const margin = totRev > 0 ? ((totProfit / totRev) * 100).toFixed(1) : "0"
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: "Net Revenue", value: formatCurrency(totRev), color: "text-blue-600", sub: `${totOrders} orders` },
                { label: "Net Profit", value: formatCurrency(totProfit), color: "text-emerald-600", sub: `${margin}% margin` },
                { label: "Refunds", value: totRefunds > 0 ? `-${formatCurrency(totRefunds)}` : "₹0", color: totRefunds > 0 ? "text-red-600" : "text-slate-400", sub: "already deducted" },
                { label: "Avg/Day", value: formatCurrency(chartData.length > 0 ? totRev / chartData.length : 0), color: "text-violet-600", sub: `per ${period.includes("Month") ? "month" : "day"}` },
              ].map((s) => (
                <div key={s.label} className="text-center bg-muted/30 rounded-lg p-2.5 border border-border/50">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}
