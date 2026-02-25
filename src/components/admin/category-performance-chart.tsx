"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface CategoryData {
    name: string
    count: number
    revenue?: number
    profit?: number
}

interface CategoryPerformanceChartProps {
    data?: CategoryData[]
}

const defaultData: CategoryData[] = [
    { name: "Electronics", count: 45, revenue: 120000, profit: 32000 },
    { name: "Fashion", count: 82, revenue: 85000, profit: 22000 },
    { name: "Home", count: 34, revenue: 42000, profit: 11000 },
    { name: "Beauty", count: 21, revenue: 18000, profit: 5000 },
    { name: "Sports", count: 15, revenue: 25000, profit: 7000 },
]

const BAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

type ViewMode = "revenue" | "profit" | "count"

function formatCurrency(value: number) {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
    return `₹${value}`
}

export default function CategoryPerformanceChart({ data }: CategoryPerformanceChartProps) {
    const [view, setView] = useState<ViewMode>("revenue")
    const chartData = data && data.length > 0 ? data : defaultData
    const isDefault = !data || data.length === 0

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null
        const d = payload[0].payload as CategoryData
        return (
            <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-sm min-w-[170px]">
                <p className="font-bold text-foreground mb-2">{label}</p>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Products</span>
                        <span className="font-semibold">{d.count}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(d.revenue ?? 0)}</span>
                    </div>
                    {d.profit !== undefined && d.profit > 0 && (
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Profit</span>
                            <span className="font-semibold text-emerald-600">{formatCurrency(d.profit)}</span>
                        </div>
                    )}
                    {(d.revenue ?? 0) > 0 && d.profit !== undefined && (
                        <div className="flex justify-between gap-4 pt-1 border-t border-border/50">
                            <span className="text-muted-foreground">Margin</span>
                            <span className="font-semibold text-violet-600">
                                {(((d.profit ?? 0) / d.revenue!) * 100).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const formatYAxis = (val: number) => {
        if (view === "count") return `${val}`
        return formatCurrency(val)
    }

    return (
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            {isDefault && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
                    <p className="text-sm font-medium text-muted-foreground bg-background px-3 py-1 rounded-full border shadow-sm">
                        Sample Data
                    </p>
                </div>
            )}
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-semibold">Category Performance</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">Real revenue from completed orders</p>
                    </div>
                    {/* View mode toggle */}
                    <div className="flex gap-1 bg-muted rounded-lg p-1 shrink-0">
                        {(["revenue", "profit", "count"] as ViewMode[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all ${view === v
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-72 w-full min-w-0 bg-muted/20 rounded-xl p-2 sm:p-4 border border-border/50">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatYAxis}
                                width={55}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                            <Bar dataKey={view} radius={[6, 6, 0, 0]} maxBarSize={48}>
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {[
                        {
                            label: "Total Revenue",
                            value: formatCurrency(chartData.reduce((s, d) => s + (d.revenue ?? 0), 0)),
                            color: "text-blue-600",
                        },
                        {
                            label: "Total Profit",
                            value: formatCurrency(chartData.reduce((s, d) => s + (d.profit ?? 0), 0)),
                            color: "text-emerald-600",
                        },
                        {
                            label: "Categories",
                            value: chartData.length,
                            color: "text-violet-600",
                        },
                    ].map((s) => (
                        <div key={s.label} className="text-center bg-muted/30 rounded-lg p-2 border border-border/50">
                            <p className="text-[10px] text-muted-foreground">{s.label}</p>
                            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
