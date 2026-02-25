"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart3, TrendingUp, X, Plus, Loader2 } from "lucide-react"
import { useGetAdminDashboardQuery } from "@/redux/api/adminApi"

const availableMetrics = [
  { id: "revenue", label: "Revenue", color: "var(--color-primary)" },
  { id: "orders", label: "Orders", color: "var(--color-chart-2)" },
  { id: "aov", label: "Average Order Value", color: "var(--color-chart-3)" },
  // { id: "customers", label: "New Customers", color: "var(--color-chart-4)" },
  // { id: "conversion", label: "Conversion Rate", color: "var(--color-chart-5)" },
]

const availableDimensions = [
  { id: "date", label: "Date" },
  // { id: "product", label: "Product" },
  // { id: "category", label: "Category" },
  // { id: "region", label: "Region" },
  // { id: "traffic_source", label: "Traffic Source" },
  // { id: "device", label: "Device Type" },
]

export default function ReportBuilder() {
  const { data: dashboardData, isLoading } = useGetAdminDashboardQuery();

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["revenue"])
  const [selectedDimension, setSelectedDimension] = useState("date")
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  if (isLoading) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  // Prepare Real Data from Last 30 Days
  const sampleData = dashboardData?.charts?.last30Days?.series?.map(item => ({
    date: item.date,
    revenue: item.revenue,
    orders: item.orders,
    // Calculate derived metrics if needed
    aov: item.orders > 0 ? parseFloat((item.revenue / item.orders).toFixed(2)) : 0
  })) || [];

  const addMetric = (metricId: string) => {
    if (!selectedMetrics.includes(metricId)) {
      setSelectedMetrics([...selectedMetrics, metricId])
    }
  }

  const removeMetric = (metricId: string) => {
    setSelectedMetrics(selectedMetrics.filter((id) => id !== metricId))
  }

  const getMetricConfig = (metricId: string) => {
    return availableMetrics.find((m) => m.id === metricId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Interactive Report Builder</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag and drop metrics and dimensions to create custom analytics reports
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-3">Selected Metrics</h4>
            <div className="space-y-2">
              {selectedMetrics.map((metricId) => {
                const metric = getMetricConfig(metricId)
                return (
                  <Badge key={metricId} variant="secondary" className="gap-2">
                    {metric?.label}
                    <button onClick={() => removeMetric(metricId)} className="hover:bg-muted-foreground/20 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
            <Select onValueChange={addMetric}>
              <SelectTrigger className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Add metric" />
              </SelectTrigger>
              <SelectContent>
                {availableMetrics
                  .filter((m) => !selectedMetrics.includes(m.id))
                  .map((metric) => (
                    <SelectItem key={metric.id} value={metric.id}>
                      {metric.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="font-medium mb-3">Dimension</h4>
            <Select value={selectedDimension} onValueChange={setSelectedDimension}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableDimensions.map((dimension) => (
                  <SelectItem key={dimension.id} value={dimension.id}>
                    {dimension.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="font-medium mb-3">Chart Type</h4>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("line")}
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
              <Button variant={chartType === "bar" ? "default" : "ghost"} size="sm" onClick={() => setChartType("bar")}>
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Generated Chart */}
        <div className="h-96 border border-border rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={sampleData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
                <XAxis
                  dataKey={selectedDimension}
                  className="text-[10px]"
                  tick={{ fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  className="text-[10px]"
                  tick={{ fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-foreground)",
                  }}
                />
                {selectedMetrics.map((metricId) => {
                  const metric = getMetricConfig(metricId)
                  return (
                    <Line
                      key={metricId}
                      type="monotone"
                      dataKey={metricId}
                      stroke={metric?.color}
                      strokeWidth={2}
                      dot={{ fill: metric?.color, strokeWidth: 2, r: 4 }}
                    />
                  )
                })}
              </LineChart>
            ) : (
              <BarChart data={sampleData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
                <XAxis
                  dataKey={selectedDimension}
                  className="text-[10px]"
                  tick={{ fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  className="text-[10px]"
                  tick={{ fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-foreground)",
                  }}
                />
                {selectedMetrics.map((metricId, index) => {
                  const metric = getMetricConfig(metricId)
                  return <Bar key={metricId} dataKey={metricId} fill={metric?.color} />
                })}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Save Report</Button>
          <Button>Generate Report</Button>
        </div>
      </CardContent>
    </Card>
  )
}
