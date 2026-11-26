"use client"
import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
  Area,
  AreaChart,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Button } from "@/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { TrendingUp, BarChart3, PieChartIcon, Download } from "lucide-react"
import { useGetAdminDashboardQuery, useGetProductAnalyticsQuery } from "@/redux/api/adminApi"
import toast from "react-hot-toast"

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#ef4444",
]

export default function SalesBreakdown() {
  const [chartType, setChartType] = useState<"pie" | "bar" | "area">("pie")
  const [profitView, setProfitView] = useState<"bars" | "trend">("bars")

  const { data: dashboardData, isLoading: dashboardLoading } = useGetAdminDashboardQuery()
  const { data: analyticsData, isLoading: analyticsLoading } = useGetProductAnalyticsQuery()

  const isLoading = dashboardLoading || analyticsLoading

  const categoryData = useMemo(() => {
    if (!analyticsData?.topCategories) return []
    const totalRevenue = analyticsData.topCategories.reduce(
      (acc: number, cat: any) => acc + (cat.revenue || 0),
      0
    )
    return analyticsData.topCategories.map((cat: any) => ({
      name: cat.name || "Uncategorized",
      value: Number(cat.revenue || 0),
      count: cat.count || 0,
      percentage:
        totalRevenue > 0
          ? Number((((cat.revenue || 0) / totalRevenue) * 100).toFixed(1))
          : 0,
    }))
  }, [analyticsData])

  const pieCategoryData = useMemo(
    () => categoryData.filter((d) => d.value > 0),
    [categoryData]
  )

  const regionData = useMemo(() => {
    if (!dashboardData?.byRegion) return []
    const totalRevenue = dashboardData.byRegion.reduce(
      (acc: number, r: any) => acc + (r.revenue || 0),
      0
    )
    return dashboardData.byRegion.map((r: any) => ({
      name: r.region || "Unknown",
      value: Number(r.revenue || 0),
      orders: r.orders || 0,
      percentage:
        totalRevenue > 0
          ? Number((((r.revenue || 0) / totalRevenue) * 100).toFixed(1))
          : 0,
    }))
  }, [dashboardData])

  const pieRegionData = useMemo(
    () => regionData.filter((d: any) => d.value > 0),
    [regionData]
  )

  const profitData = useMemo(() => {
    if (!dashboardData?.topProducts) return []
    return dashboardData.topProducts.map((p: any) => {
      const revenue = Number(p.totalRevenue || 0)
      const profit =
        p.totalProfit !== undefined ? Number(p.totalProfit) : revenue * 0.2
      const cost = revenue - profit
      const margin =
        revenue > 0 ? Number(((profit / revenue) * 100).toFixed(1)) : 0

      return {
        product: p.name || "Product",
        revenue,
        cost,
        profit,
        margin,
      }
    })
  }, [dashboardData])

  const handleExportProducts = () => {
    if (profitData.length === 0) {
      toast.error("No product profitability data to export")
      return
    }
    const headers = ["Product", "Revenue (INR)", "Estimated Cost (INR)", "Estimated Profit (INR)", "Margin (%)"]
    const rows = profitData.map((p) => [
      `"${String(p.product).replace(/"/g, '""')}"`,
      p.revenue.toFixed(2),
      p.cost.toFixed(2),
      p.profit.toFixed(2),
      p.margin,
    ])
    const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `top_products_margins_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Exported product margin breakdown!")
  }

  if (isLoading) {
    return (
      <Card className="col-span-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </Card>
    )
  }

  const renderEmptyChart = (label: string) => (
    <div className="h-80 flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
      <BarChart3 className="w-8 h-8 mb-2 opacity-40" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Tabs defaultValue="category" className="col-span-full lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">Sales Breakdown</CardTitle>
                <p className="text-sm text-muted-foreground">Revenue distribution analysis</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <TabsList>
                  <TabsTrigger value="category">Category</TabsTrigger>
                  <TabsTrigger value="region">Region</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={chartType === "pie" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                    title="Pie Chart"
                  >
                    <PieChartIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    title="Bar Chart"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "area" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("area")}
                    title="Area Chart"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* CATEGORY TAB */}
            <TabsContent value="category" className="mt-0">
              {categoryData.length === 0 || (chartType === "pie" && pieCategoryData.length === 0) ? (
                renderEmptyChart("No category revenue data available yet")
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "pie" ? (
                      <PieChart>
                        <Pie
                          data={pieCategoryData}
                          cx="50%"
                          cy="46%"
                          innerRadius={45}
                          outerRadius={95}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, payload }: any) =>
                            `${name} (${payload?.percentage ?? 0}%)`
                          }
                          labelLine={false}
                        >
                          {pieCategoryData.map((_entry, index) => (
                            <Cell key={`cat-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: any) => [
                            `₹${Number(value || 0).toLocaleString("en-IN")}`,
                            "Revenue",
                          ]}
                        />
                        <Legend verticalAlign="bottom" height={28} />
                      </PieChart>
                    ) : chartType === "bar" ? (
                      <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                        <XAxis
                          dataKey="name"
                          className="text-[10px]"
                          tick={{ fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                          angle={-30}
                          textAnchor="end"
                          height={55}
                        />
                        <YAxis
                          className="text-[10px]"
                          tick={{ fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: any) => [
                            `₹${Number(value || 0).toLocaleString("en-IN")}`,
                            "Revenue",
                          ]}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <AreaChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                        <XAxis
                          dataKey="name"
                          className="text-[10px]"
                          tick={{ fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          className="text-[10px]"
                          tick={{ fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: any) => [
                            `₹${Number(value || 0).toLocaleString("en-IN")}`,
                            "Revenue",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.15}
                          strokeWidth={3}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>

            {/* REGION TAB */}
            <TabsContent value="region" className="mt-0">
              {regionData.length === 0 || (chartType === "pie" && pieRegionData.length === 0) ? (
                renderEmptyChart("No regional sales data available yet")
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "pie" ? (
                      <PieChart>
                        <Pie
                          data={pieRegionData}
                          cx="50%"
                          cy="46%"
                          innerRadius={45}
                          outerRadius={95}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, payload }: any) =>
                            `${name} (${payload?.percentage ?? 0}%)`
                          }
                          labelLine={false}
                        >
                          {pieRegionData.map((_entry: any, index: number) => (
                            <Cell key={`reg-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: any) => [
                            `₹${Number(value || 0).toLocaleString("en-IN")}`,
                            "Revenue",
                          ]}
                        />
                        <Legend verticalAlign="bottom" height={28} />
                      </PieChart>
                    ) : chartType === "bar" ? (
                      <BarChart
                        data={regionData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                        <XAxis
                          type="number"
                          className="text-[10px]"
                          tick={{ fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          className="text-[10px]"
                          tick={{ fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: any) => [
                            `₹${Number(value || 0).toLocaleString("en-IN")}`,
                            "Revenue",
                          ]}
                        />
                        <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    ) : (
                      <AreaChart data={regionData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                        <XAxis
                          dataKey="name"
                          className="text-[10px]"
                          tick={{ fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          className="text-[10px]"
                          tick={{ fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: any) => [
                            `₹${Number(value || 0).toLocaleString("en-IN")}`,
                            "Revenue",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#06b6d4"
                          fill="#06b6d4"
                          fillOpacity={0.15}
                          strokeWidth={3}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* TOP PRODUCTS CARD */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Top Products (Estimated Margin)</CardTitle>
              <p className="text-sm text-muted-foreground">Product profitability analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={profitView}
                onValueChange={(value: "bars" | "trend") => setProfitView(value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bars">Progress Bars</SelectItem>
                  <SelectItem value="trend">Trend Chart</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExportProducts}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {profitData.length === 0 ? (
            renderEmptyChart("No top product sales recorded yet")
          ) : profitView === "bars" ? (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {profitData.map((item: any, idx: number) => {
                const clampedMargin = Math.max(0, Math.min(100, item.margin))
                return (
                  <div key={`${item.product}-${idx}`} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{item.product}</span>
                      <span
                        className={`text-sm font-semibold shrink-0 ${
                          item.margin < 0 ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {item.margin}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ease-out ${
                          item.margin < 0
                            ? "bg-red-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-600"
                        }`}
                        style={{ width: `${clampedMargin}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Revenue: ₹{item.revenue.toLocaleString("en-IN")}</span>
                      <span>Profit: ₹{item.profit.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={profitData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                  <XAxis
                    dataKey="product"
                    className="text-[10px]"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    yAxisId="left"
                    className="text-[10px]"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    className="text-[10px]"
                    tick={{ fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar yAxisId="left" dataKey="profit" fill="#10b981" name="Profit (₹)" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="margin"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Margin %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
