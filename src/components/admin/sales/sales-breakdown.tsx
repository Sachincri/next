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
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Button } from "@/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { TrendingUp, BarChart3, PieChartIcon, Download } from "lucide-react"
import { useGetAdminDashboardQuery, useGetProductAnalyticsQuery } from "@/redux/api/adminApi"

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export default function SalesBreakdown() {
  const [chartType, setChartType] = useState<"pie" | "bar" | "area">("pie")
  const [profitView, setProfitView] = useState<"bars" | "trend">("bars")

  const { data: dashboardData, isLoading: dashboardLoading } = useGetAdminDashboardQuery();
  const { data: analyticsData, isLoading: analyticsLoading } = useGetProductAnalyticsQuery();

  const isLoading = dashboardLoading || analyticsLoading;

  const categoryData = useMemo(() => {
    if (!analyticsData?.topCategories) return [];
    const totalRevenue = analyticsData.topCategories.reduce((acc, cat) => acc + (cat.revenue || 0), 0);
    return analyticsData.topCategories.map(cat => ({
      name: cat.name,
      value: cat.revenue || 0,
      percentage: totalRevenue > 0 ? Number(((cat.revenue || 0) / totalRevenue * 100).toFixed(1)) : 0
    }));
  }, [analyticsData]);

  const regionData = useMemo(() => {
    if (!dashboardData?.byRegion) return [];
    const totalRevenue = dashboardData.byRegion.reduce((acc: any, r: any) => acc + r.revenue, 0);
    return dashboardData.byRegion.map((r: any) => ({
      name: r.region || "Unknown",
      value: r.revenue,
      percentage: totalRevenue > 0 ? Number((r.revenue / totalRevenue * 100).toFixed(1)) : 0
    }));
  }, [dashboardData]);

  const profitData = useMemo(() => {
    if (!dashboardData?.topProducts) return [];
    return dashboardData.topProducts.map((p: any) => {
      const revenue = p.totalRevenue || 0;
      const profit = p.totalProfit !== undefined ? p.totalProfit : (revenue * 0.2); // Fallback if no profit data
      const cost = revenue - profit;
      const margin = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(1)) : 0;

      return {
        product: p.name,
        revenue: revenue,
        cost: cost,
        profit: profit,
        margin: margin
      };
    });
  }, [dashboardData]);

  if (isLoading) {
    return (
      <Card className="col-span-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Tabs defaultValue="category" className="col-span-full lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">Sales Breakdown</CardTitle>
                <p className="text-sm text-muted-foreground">Revenue distribution analysis</p>
              </div>
              <div className="flex items-center gap-2">
                <TabsList>
                  <TabsTrigger value="category">Category</TabsTrigger>
                  <TabsTrigger value="region">Region</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={chartType === "pie" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                  >
                    <PieChartIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "area" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("area")}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="category" className="mt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "pie" ? (
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percentage }: any) => `${name} (${percentage}%)`}

                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: any) => [`${value.toLocaleString()}`, "Revenue"]}
                      />
                    </PieChart>
                  ) : chartType === "bar" ? (
                    <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                      <XAxis
                        dataKey="name"
                        className="text-[10px]"
                        tick={{ fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={60}
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
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: any) => [`${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                      <XAxis
                        dataKey="name"
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
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: any) => [`${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.1}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="region" className="mt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "pie" ? (
                    <PieChart>
                      <Pie
                        data={regionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, payload }: any) => `${name} (${payload.percentage}%)`}
                        labelLine={false}
                      >
                        {regionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: any) => [`${value.toLocaleString()}`, "Revenue"]}
                      />
                    </PieChart>
                  ) : (
                    <BarChart data={regionData} layout="horizontal" margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                      <XAxis
                        type="number"
                        className="text-[10px]"
                        tick={{ fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                        dy={5}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        className="text-[10px]"
                        tick={{ fill: 'var(--muted-foreground)' }}
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
                        formatter={(value: any) => [`${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Top Products (Estimated Margin)</CardTitle>
              <p className="text-sm text-muted-foreground">Product profitability analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={profitView} onValueChange={(value: "bars" | "trend") => setProfitView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bars">Progress Bars</SelectItem>
                  <SelectItem value="trend">Trend Chart</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {profitView === "bars" && (
            <div className="space-y-4">
              {profitData.map((item, index) => (
                <div key={item.product} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{item.product}</span>
                    <span className="text-sm font-semibold">{item.margin}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${item.margin}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Revenue: {item.revenue.toLocaleString()}</span>
                    <span>Profit: {item.profit.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {profitView === "trend" && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={profitData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                  <XAxis
                    dataKey="product"
                    className="text-[10px]"
                    tick={{ fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    dy={15}
                  />
                  <YAxis
                    yAxisId="left"
                    className="text-[10px]"
                    tick={{ fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    className="text-[10px]"
                    tick={{ fill: 'var(--muted-foreground)' }}
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
                  <Bar yAxisId="left" dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
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

