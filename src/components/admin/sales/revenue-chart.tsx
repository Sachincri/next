"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { TrendingUp, BarChart3 } from "lucide-react"
import { useGetAdminDashboardQuery } from "@/redux/api/adminApi"

export default function RevenueChart() {
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "orders" | "aov">("revenue")
  const [timeRange, setTimeRange] = useState("30d")

  const { data: dashboardData, isLoading } = useGetAdminDashboardQuery()

  const chartData = useMemo(() => {
    if (!dashboardData?.charts) return [];

    let series = [];
    switch (timeRange) {
      case "7d":
        series = dashboardData.charts.last7Days?.series || [];
        break;
      case "30d":
        series = dashboardData.charts.last30Days?.series || [];
        break;
      case "90d":
        series = dashboardData.charts.last90Days?.series || [];
        break;
      case "1y":
        series = dashboardData.charts.last12Months?.series || [];
        break;
      default:
        series = dashboardData.charts.last30Days?.series || [];
    }

    return series.map((item: any) => {
      let dateLabel = item.date;
      if (timeRange === "1y" && item.month) {
        dateLabel = item.month; // Already formatted as YYYY-MM
        // Optional: Format to MMM YYYY if needed, but YYYY-MM is fine.
        // Let's try to format it nicely if possible, or leave it. 
        // format(new Date(item.month), "MMM yyyy") might break if item.month is not full date.
        // But admin controller builds "yyyy-MM" string. new Date("2023-01") works.
        try {
          dateLabel = new Date(item.month).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        } catch (e) { }
      } else if (item.date) {
        try {
          dateLabel = new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        } catch (e) { }
      }

      return {
        date: dateLabel,
        revenue: item.revenue,
        orders: item.orders,
        aov: item.orders > 0 ? Number((item.revenue / item.orders).toFixed(2)) : 0
      };
    });
  }, [dashboardData, timeRange]);

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "revenue":
        return "Revenue"
      case "orders":
        return "Orders"
      case "aov":
        return "Average Order Value"
      default:
        return "Revenue"
    }
  }

  const getMetricColor = () => {
    switch (selectedMetric) {
      case "revenue":
        return "var(--color-primary)"
      case "orders":
        return "var(--color-chart-2)"
      case "aov":
        return "var(--color-chart-3)"
      default:
        return "var(--color-primary)"
    }
  }

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardContent className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Revenue Analytics</CardTitle>
            <p className="text-sm text-muted-foreground">Interactive revenue trends overview</p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 h-8">
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
                variant={selectedMetric === "aov" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedMetric("aov")}
              >
                AOV
              </Button>
            </div>

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
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
                <XAxis
                  dataKey="date"
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
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={getMetricColor()}
                  strokeWidth={3}
                  dot={{ fill: getMetricColor(), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: getMetricColor() }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
                <XAxis
                  dataKey="date"
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
                <Bar dataKey={selectedMetric} fill={getMetricColor()} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

