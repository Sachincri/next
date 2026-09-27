"use client"

import { useMemo } from "react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts"

interface ChartData {
  type: "bar" | "line" | "pie" | "area"
  title: string
  xKey?: string
  yKey?: string
  data: Record<string, any>[]
}

const CHART_COLORS = [
  "#818cf8", "#34d399", "#fbbf24", "#f87171",
  "#a78bfa", "#38bdf8", "#fb923c", "#4ade80",
  "#e879f9", "#22d3ee"
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-gray-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
        <p className="text-xs font-medium text-gray-300">{label}</p>
        {payload.map((item: any, idx: number) => (
          <p key={idx} className="text-sm font-bold" style={{ color: item.color }}>
            {typeof item.value === "number"
              ? item.value >= 1000
                ? `₹${(item.value / 1000).toFixed(1)}K`
                : item.value.toLocaleString("en-IN")
              : item.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AiDynamicChart({ chart }: { chart: ChartData }) {
  const { type, title, data, xKey = "label", yKey = "value" } = chart

  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      // Ensure we have standard keys for the chart
      name: item[xKey] || item.label || item.name || item.date || item.status || item.category || item.state || "",
      value: Number(item[yKey] || item.value || item.revenue || item.count || item.orders || 0),
    }))
  }, [data, xKey, yKey])

  if (!data || data.length === 0) return null

  const commonAxisProps = {
    tick: { fill: "#9ca3af", fontSize: 11 },
    axisLine: { stroke: "#374151" },
    tickLine: { stroke: "#374151" },
  }

  return (
    <div className="mt-3 rounded-xl border border-white/[0.06] bg-gradient-to-br from-gray-900/60 to-gray-800/40 p-4 backdrop-blur-sm">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h4>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={formattedData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis {...commonAxisProps} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {formattedData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis {...commonAxisProps} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#818cf8"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#818cf8", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#818cf8", stroke: "#c7d2fe", strokeWidth: 2 }}
              />
            </LineChart>
          ) : type === "area" ? (
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis {...commonAxisProps} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#818cf8"
                strokeWidth={2}
                fill="url(#areaGradient)"
              />
            </AreaChart>
          ) : (
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                nameKey="name"
                paddingAngle={3}
                strokeWidth={0}
              >
                {formattedData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#9ca3af" }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
