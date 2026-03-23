"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { TrendingUp, BarChart3, PieChartIcon, Activity, Download } from "lucide-react"
import { useGetAdminDashboardQuery, useGetProductAnalyticsQuery } from "@/redux/api/adminApi"

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter
} from "recharts"

export default function EnhancedAnalyticsDashboard() {
  const [selectedChart, setSelectedChart] = useState<"line" | "area" | "bar" | "composed">("line")
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "orders" | "profit" | "customers">("revenue")
  const [timeRange, setTimeRange] = useState("7d")

  const [mounted, setMounted] = useState(false)

  // RTK Query Hooks
  const { data: dashboardData, isLoading: dashboardLoading } = useGetAdminDashboardQuery();
  const { data: analyticsData, isLoading: analyticsLoading } = useGetProductAnalyticsQuery();

  const loading = dashboardLoading || analyticsLoading;

  useEffect(() => {
    setMounted(true)
  }, [])

  const salesData = useMemo(() => {
    if (!dashboardData?.charts) return [];

    switch (timeRange) {
      case "7d": return dashboardData.charts.last7Days?.series || [];
      case "30d": return dashboardData.charts.last30Days?.series || [];
      case "90d": return dashboardData.charts.last90Days?.series || [];
      case "1y": return dashboardData.charts.last12Months?.series || [];
      default: return dashboardData.charts.last7Days?.series || [];
    }
  }, [dashboardData, timeRange]);

  const categoryData = useMemo(() => {
    return analyticsData?.topCategories?.map(cat => ({
      category: cat.name,
      revenue: cat.revenue || 0,
      count: cat.count
    })) || [];
  }, [analyticsData]);

  const customerSegmentData = useMemo(() => {
    const counts = dashboardData?.ordersByStatus || {};
    return Object.entries(counts).map(([status, value], index) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: value as number,
      color: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#ef4444", "#3b82f6"][index % 7]
    }));
  }, [dashboardData]);

  const regionData = useMemo(() => {
    return (dashboardData?.byRegion || []).map(r => ({
      region: r.region,
      revenue: r.revenue,
      customers: r.orders,
      growth: 0
    }));
  }, [dashboardData]);

  const getMetricColor = () => {
    switch (selectedMetric) {
      case "revenue":
        return "#8b5cf6"
      case "orders":
        return "#06b6d4"
      case "profit":
        return "#10b981"
      case "customers":
        return "#f59e0b"
      default:
        return "#8b5cf6"
    }
  }

  const formatValue = (value: number) => {
    if (selectedMetric === "revenue" || selectedMetric === "profit") {
      return `₹${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }

  const renderChart = () => {
    switch (selectedChart) {
      case "line":
        return (
          <LineChart data={salesData} margin={{ top: 20, right: 10, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
            <XAxis
              dataKey={timeRange === "1y" ? "month" : "date"}
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
              formatter={(value: any) => [
                formatValue(Number(value)),
                selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
              ]}
            />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricColor()}
              strokeWidth={3}
              dot={{ fill: getMetricColor(), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: getMetricColor(), strokeWidth: 2 }}
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={salesData} margin={{ top: 20, right: 10, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
            <XAxis
              dataKey={timeRange === "1y" ? "month" : "date"}
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
              formatter={(value: any) => [
                formatValue(Number(value)),
                selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
              ]}
            />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricColor()}
              fill={getMetricColor()}
              fillOpacity={0.1}
              strokeWidth={3}
            />
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={salesData} margin={{ top: 20, right: 10, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
            <XAxis
              dataKey={timeRange === "1y" ? "month" : "date"}
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
              formatter={(value: any) => [
                formatValue(Number(value)),
                selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
              ]}
            />
            <Bar dataKey={selectedMetric} fill={getMetricColor()} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case "composed":
        return (
          <ComposedChart data={salesData} margin={{ top: 20, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
            <XAxis
              dataKey={timeRange === "1y" ? "month" : "date"}
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
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey="orders" stroke="#06b6d4" strokeWidth={3} name="Orders" />
          </ComposedChart>
        );
      default:
        return null;
    }
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Analytics Chart */}
      <Card className="col-span-full min-w-0 overflow-hidden">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Advanced Analytics Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground">Interactive data visualization with live API data</p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={selectedMetric === "revenue" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMetric("revenue")}
                >
                  Revenue
                </Button>
                <Button
                  variant={selectedMetric === "orders" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMetric("orders")}
                >
                  Orders
                </Button>
                <Button
                  variant={selectedMetric === "profit" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMetric("profit")}
                >
                  Profit
                </Button>
                <Button
                  variant={selectedMetric === "customers" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMetric("customers")}
                >
                  Customers
                </Button>
              </div>

              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={selectedChart === "line" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedChart("line")}
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedChart === "area" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedChart("area")}
                >
                  <Activity className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedChart === "bar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedChart("bar")}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedChart === "composed" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedChart("composed")}
                >
                  <PieChartIcon className="w-4 h-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full min-w-0 bg-muted/20 rounded-xl p-2 sm:p-4 border border-border/50">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {renderChart() as any}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 w-full">
        {/* Category Performance */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Category Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Revenue by product category</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    className="text-xs fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#ef4444"][index % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Customer Segments</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution by customer type</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={customerSegmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {customerSegmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Performance */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Regional Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Revenue and growth by region</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ComposedChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                  <XAxis
                    dataKey="region"
                    className="text-xs fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis yAxisId="left" className="text-xs fill-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    className="text-xs fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8b5cf6" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growth"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Growth %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue vs Profit Correlation */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue vs Profit Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">Correlation between revenue and profit</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ScatterChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                  <XAxis
                    dataKey="revenue"
                    name="Revenue"
                    className="text-xs fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="profit"
                    name="Profit"
                    className="text-xs fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]}
                  />
                  <Scatter dataKey="profit" fill="#06b6d4" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
