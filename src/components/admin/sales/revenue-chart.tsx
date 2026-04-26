"use client"

import { useState, useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { TrendingUp, BarChart3 } from "lucide-react"
import { useGetAdminDashboardQuery } from "@/redux/api/adminApi"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card text-card-foreground border border-border shadow-md p-3 rounded-lg text-sm min-w-[220px]">
        <p className="font-semibold mb-3 border-b border-border pb-2">{label}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Gross Sales:</span>
            <span className="font-medium">₹{data.grossSales?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Discounts:</span>
            <span className="font-medium text-red-500">-₹{data.coinDiscount?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Shipping Fees:</span>
            <span className="font-medium">₹{data.shippingFees?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Taxes:</span>
            <span className="font-medium">₹{data.tax?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">COGS:</span>
            <span className="font-medium">₹{data.cost?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Gateway Fees:</span>
            <span className="font-medium">₹{data.gatewayFee?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Refunds:</span>
            <span className="font-medium text-red-500">-₹{data.refunds?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="my-2 border-t border-border pt-1.5"></div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground font-semibold">Net Revenue:</span>
            <span className="font-bold text-primary">₹{data.revenue?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground font-semibold">Net Profit:</span>
            <span className="font-bold text-green-600">₹{data.profit?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="my-2 border-t border-border pt-1.5"></div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Orders:</span>
            <span className="font-medium">{data.orders || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">AOV:</span>
            <span className="font-medium">₹{data.aov?.toLocaleString('en-IN') || 0}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  const [chartType, setChartType] = useState<"area" | "bar">("area")
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "orders" | "profit">("revenue")
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
        dateLabel = item.month;
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
        revenue: item.revenue || 0,
        orders: item.orders || 0,
        aov: item.orders > 0 ? Number((item.revenue / item.orders).toFixed(2)) : 0,
        profit: Number(item.profit?.toFixed(2)) || 0,
        grossSales: item.grossSales || 0,
        coinDiscount: item.coinDiscount || 0,
        shippingFees: item.shippingFees || 0,
        tax: Number(item.tax?.toFixed(2)) || 0,
        cost: Number(item.cost?.toFixed(2)) || 0,
        gatewayFee: Number(item.gatewayFee?.toFixed(2)) || 0,
        refunds: item.refunds || 0,
        refundCount: item.refundCount || 0,
      };
    });
  }, [dashboardData, timeRange]);

  const getMetricColor = () => {
    switch (selectedMetric) {
      case "revenue":
        return "var(--color-primary)"
      case "orders":
        return "var(--color-chart-2)"
      case "profit":
        return "var(--color-chart-3)"
      default:
        return "var(--color-primary)"
    }
  }

  if (isLoading) {
    return (
      <Card className="col-span-full min-w-0 overflow-hidden">
        <CardContent className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full min-w-0 overflow-hidden">
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
                variant={selectedMetric === "profit" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedMetric("profit")}
              >
                Profit
              </Button>
            </div>

            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={chartType === "area" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("area")}
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
        <div className="h-96 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            {chartType === "area" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={getMetricColor()}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                  activeDot={{ r: 6, fill: getMetricColor() }}
                />
              </AreaChart>
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
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={selectedMetric} fill={getMetricColor()} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
