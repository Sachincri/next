"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

const defaultOrderStatusData = [
  { name: "Delivered", value: 145 },
  { name: "Shipped", value: 89 },
  { name: "Pending", value: 34 },
  { name: "Canceled", value: 12 },
]

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function OrderStatusChart({ data }: { data?: Record<string, number> }) {
  const chartData = data ? Object.entries(data).map(([name, value], idx) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: COLORS[idx % COLORS.length]
  })) : defaultOrderStatusData.map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Order Status</CardTitle>
        <p className="text-sm text-muted-foreground">Current order distribution</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-foreground)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: "var(--color-foreground)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
