"use client"

import { useMemo } from "react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts"

export interface ChartSeries {
  dataKey: string
  name?: string
  color?: string
}

export interface ChartConfigData {
  type?: "bar" | "line" | "pie" | "area"
  chartType?: "bar" | "line" | "pie" | "area"
  title: string
  xKey?: string
  xAxisKey?: string
  yKey?: string
  series?: ChartSeries[]
  data: Record<string, any>[]
}

const CHART_COLORS = [
  "#10b981", "#818cf8", "#f59e0b", "#ec4899",
  "#06b6d4", "#a855f7", "#3b82f6", "#14b8a6",
  "#e11d48", "#84cc16"
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-gray-950/95 px-3 py-2.5 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold text-gray-300 mb-1">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-400 font-medium">{item.name || item.dataKey}:</span>
            <span className="font-bold text-white">
              {typeof item.value === "number"
                ? item.value >= 1000
                  ? `₹${(item.value / 1000).toFixed(1)}K`
                  : item.value.toLocaleString("en-IN")
                : item.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AiDynamicChart({
  chart,
  chartConfig,
}: {
  chart?: ChartConfigData
  chartConfig?: ChartConfigData
}) {
  const activeChart = chartConfig || chart
  if (!activeChart) return null

  const chartType = activeChart.chartType || activeChart.type || "bar"
  const xKey = activeChart.xAxisKey || activeChart.xKey || "name"
  const series =
    activeChart.series && activeChart.series.length > 0
      ? activeChart.series
      : [{ dataKey: activeChart.yKey || "value", name: "Value", color: "#10b981" }]

  const formattedData = useMemo(() => {
    return (activeChart.data || []).map((item) => {
      const row: Record<string, any> = { ...item }
      row.name =
        item[xKey] ||
        item.label ||
        item.date ||
        item.status ||
        item.category ||
        item.state ||
        item.name ||
        ""

      // Ensure primary metric has a numerical value
      series.forEach((s) => {
        row[s.dataKey] = Number(
          item[s.dataKey] ?? item.value ?? item.revenue ?? item.orders ?? item.count ?? 0
        )
      })

      return row
    })
  }, [activeChart.data, xKey, series])

  if (!activeChart.data || activeChart.data.length === 0) return null

  const commonAxisProps = {
    tick: { fill: "#9ca3af", fontSize: 10 },
    axisLine: { stroke: "#374151" },
    tickLine: { stroke: "#374151" },
  }

  return (
    <div className="mt-3 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-gray-950/80 via-gray-900/50 to-gray-950/80 p-4 shadow-xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          {activeChart.title}
        </h4>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {chartType}
        </span>
      </div>

      <div className="h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={formattedData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis {...commonAxisProps} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)} />
              <Tooltip content={<CustomTooltip />} />
              {series.map((s, idx) => (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name || s.dataKey}
                  fill={s.color || CHART_COLORS[idx % CHART_COLORS.length]}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                >
                  {series.length === 1 &&
                    formattedData.map((_, cellIdx) => (
                      <Cell key={cellIdx} fill={CHART_COLORS[cellIdx % CHART_COLORS.length]} />
                    ))}
                </Bar>
              ))}
              {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />}
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis {...commonAxisProps} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)} />
              <Tooltip content={<CustomTooltip />} />
              {series.map((s, idx) => (
                <Line
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name || s.dataKey}
                  stroke={s.color || CHART_COLORS[idx % CHART_COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: s.color || CHART_COLORS[idx % CHART_COLORS.length], strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: s.color || CHART_COLORS[idx % CHART_COLORS.length], stroke: "#ffffff", strokeWidth: 2 }}
                />
              ))}
              {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />}
            </LineChart>
          ) : chartType === "area" ? (
            <AreaChart data={formattedData}>
              <defs>
                {series.map((s, idx) => {
                  const color = s.color || CHART_COLORS[idx % CHART_COLORS.length]
                  return (
                    <linearGradient key={s.dataKey} id={`areaGrad-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                  )
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis {...commonAxisProps} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)} />
              <Tooltip content={<CustomTooltip />} />
              {series.map((s, idx) => {
                const color = s.color || CHART_COLORS[idx % CHART_COLORS.length]
                return (
                  <Area
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={s.name || s.dataKey}
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#areaGrad-${s.dataKey})`}
                  />
                )
              })}
              {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />}
            </AreaChart>
          ) : (
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey={series[0]?.dataKey || "value"}
                nameKey="name"
                paddingAngle={3}
                strokeWidth={0}
              >
                {formattedData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} iconType="circle" iconSize={8} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
