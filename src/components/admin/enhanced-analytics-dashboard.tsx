"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { TrendingUp, BarChart3, PieChartIcon, Activity, Download, Inbox, AlertTriangle, Star } from "lucide-react"
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
  Scatter,
  FunnelChart,
  Funnel,
  LabelList
} from "recharts"

const EmptyState = ({ message = "No data for this period" }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border/50">
    <Inbox className="w-8 h-8 mb-2 opacity-50" />
    <span className="text-sm font-medium">{message}</span>
  </div>
)

const ALERT_COLORS: Record<string, string> = {
  critical: "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30",
  low_rating: "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30",
  high_refunds: "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30",
}

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
      profit: cat.profit || 0,
      count: cat.count
    })) || [];
  }, [analyticsData]);

  const customerSegmentData = useMemo(() => {
    const customers = dashboardData?.customers || { newCustomers: 0, returningCustomers: 0, vipCustomers: 0 };

    if (customers.newCustomers === 0 && customers.returningCustomers === 0 && (customers.vipCustomers || 0) === 0) {
      return [];
    }

    return [
      { name: "New Customers", value: customers.newCustomers, color: "#06b6d4" },
      { name: "Returning", value: customers.returningCustomers, color: "#8b5cf6" },
      { name: "VIP (Top 10%)", value: customers.vipCustomers || 0, color: "#f59e0b" }
    ].filter(segment => segment.value > 0);
  }, [dashboardData]);

  const taxSettings = (dashboardData?.summary as any)?.taxSettings;
  const isTaxEnabled = taxSettings?.taxEnabled ?? false;

  const regionData = useMemo(() => {
    return (dashboardData?.byRegion || []).map(r => ({
      region: r.region,
      revenue: r.revenue,
      shippingCost: r.shippingCost || 0,
      orders: r.orders,
      shippingPct: (r.shippingCost || 0) === 0 ? 0 : (r.revenue > 0 ? Number((((r.shippingCost || 0) / r.revenue) * 100).toFixed(1)) : 0),
    }));
  }, [dashboardData]);

  const deductionsData = useMemo(() => {
    const d = dashboardData?.deductions;
    if (!d || d.grossSales === 0) return [];
    const items = [
      { name: "Net Profit", value: d.netProfit, color: "#10b981" },
      { name: "COGS", value: d.cogs, color: "#8b5cf6" },
      { name: "Discounts", value: d.totalDiscounts, color: "#f59e0b" },
      { name: "Shipping", value: d.totalShipping, color: "#06b6d4" },
    ];
    if (isTaxEnabled) {
      const combinedRate = (taxSettings?.gstRate || 0) + (taxSettings?.taxRate || 0);
      items.push({ name: `Taxes (${combinedRate}%)`, value: d.totalTax || 0, color: "#ef4444" });
      if ((d as any).totalGatewayFee > 0) {
        items.push({ name: `Gateway (${taxSettings?.gatewayFeeRate || 2}%)`, value: (d as any).totalGatewayFee, color: "#f97316" });
      }
    }
    return items.filter(s => s.value > 0);
  }, [dashboardData, isTaxEnabled, taxSettings]);

  const paymentMethodData = useMemo(() => {
    const methods = (dashboardData?.summary as any)?.paymentMethods || [];
    const colors: Record<string, string> = { "COD": "#f59e0b", "Online": "#06b6d4", "Prepaid": "#8b5cf6" };
    return methods.map((m: any, i: number) => ({
      name: m._id,
      value: m.count,
      amount: m.amount,
      color: colors[m._id] || ["#10b981", "#3b82f6", "#ef4444"][i % 3]
    }));
  }, [dashboardData]);

  const funnelData = useMemo(() => {
    // Returning empty array as visits/views are not currently tracked in DB.
    // This will trigger the "Connect Google Analytics" empty state.
    return [];
    /* 
    if (!dashboardData) return [];
    ... existing logic for future reference ...
    */
  }, [dashboardData]);

  const productAlerts = dashboardData?.productAlerts || [];

  const periodMetrics = useMemo(() => {
    if (!salesData.length) return null;
    const totalRevenue = salesData.reduce((acc: number, curr: any) => acc + (curr.revenue || 0), 0);
    const totalOrders = salesData.reduce((acc: number, curr: any) => acc + (curr.orders || 0), 0);
    const totalGross = salesData.reduce((acc: number, curr: any) => acc + (curr.grossSales || 0), 0);
    const totalProfit = salesData.reduce((acc: number, curr: any) => acc + (curr.profit || 0), 0);
    const totalTax = totalGross * 0.18;

    return {
      aov: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      tax: totalTax,
      netProfit: totalProfit,
      revenue: totalRevenue
    }
  }, [salesData]);

  const handleExportCSV = () => {
    if (!salesData.length) return;
    const csvContent = [
      ["Date", "Orders", "Revenue", "Gross Sales", "Net Profit", "Shipping Fees", "Refunds"].join(","),
      ...salesData.map((d: any) => [
        d.date || d.month,
        d.orders || 0,
        d.revenue || 0,
        d.grossSales || 0,
        d.profit || 0,
        d.shippingFees || 0,
        d.refunds || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `store_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case "revenue": return "#8b5cf6"
      case "orders": return "#06b6d4"
      case "profit": return "#10b981"
      case "customers": return "#f59e0b"
      default: return "#8b5cf6"
    }
  }

  const formatValue = (value: number) => {
    if (selectedMetric === "revenue" || selectedMetric === "profit") {
      return `₹${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }

  const renderChart = () => {
    if (!salesData.length) return <EmptyState />;

    switch (selectedChart) {
      case "line":
        return (
          <LineChart data={salesData} margin={{ top: 20, right: 10, left: 10, bottom: 25 }} syncId="dashboard-sync">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
            <XAxis dataKey={timeRange === "1y" ? "month" : "date"} className="text-[10px]" tick={{ fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis className="text-[10px]" tick={{ fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: any) => [formatValue(Number(value)), selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)]} />
            <Line type="monotone" dataKey={selectedMetric} stroke={getMetricColor()} strokeWidth={3} dot={{ fill: getMetricColor(), strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: getMetricColor(), strokeWidth: 2 }} />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={salesData} margin={{ top: 20, right: 10, left: 10, bottom: 25 }} syncId="dashboard-sync">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
            <XAxis dataKey={timeRange === "1y" ? "month" : "date"} className="text-[10px]" tick={{ fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis className="text-[10px]" tick={{ fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: any, name: string | undefined) => [formatValue(Number(value)), name]} />
            <Legend verticalAlign="top" height={36} />
            {selectedMetric === "revenue" || selectedMetric === "profit" ? (
              <>
                <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={3} />
                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              </>
            ) : (
              <Area type="monotone" dataKey={selectedMetric} name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} stroke={getMetricColor()} fill={getMetricColor()} fillOpacity={0.1} strokeWidth={3} />
            )}
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={salesData} margin={{ top: 20, right: 10, left: 10, bottom: 25 }} syncId="dashboard-sync">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
            <XAxis dataKey={timeRange === "1y" ? "month" : "date"} className="text-[10px]" tick={{ fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis className="text-[10px]" tick={{ fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: any) => [formatValue(Number(value)), selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)]} />
            <Bar dataKey={selectedMetric} fill={getMetricColor()} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case "composed":
        return (
          <ComposedChart data={salesData} margin={{ top: 20, right: 10, left: -20, bottom: 25 }} syncId="dashboard-sync">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
            <XAxis dataKey={timeRange === "1y" ? "month" : "date"} className="text-[10px]" tick={{ fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis className="text-[10px]" tick={{ fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
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

      {/* Uncategorized Data Alert */}
      {((dashboardData?.summary as any)?.uncategorizedCount > 0) && (
        <Card className="border-red-200 dark:border-red-800/30 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Uncategorized Products Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-foreground">
              <span className="font-bold">{(dashboardData?.summary as any)?.uncategorizedCount} products</span> have no category assigned. Categorize them to get accurate performance metrics by segment (e.g., Men, Women, Kids).
            </p>
          </CardContent>
        </Card>
      )}

      {/* Product Quality Alerts Banner */}
      {productAlerts.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800/30 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Product Quality Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {productAlerts.map((alert: any, i: number) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${ALERT_COLORS[alert.alertType] || ALERT_COLORS.low_rating}`}>
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.alertType === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{alert.productName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        {alert.rating}/5
                      </span>
                      <span>{alert.refundCount} refund{alert.refundCount !== 1 ? "s" : ""}</span>
                    </div>
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-medium mt-1">
                      {alert.alertType === 'critical' ? "⚠️ Quality check required" : alert.alertType === 'low_rating' ? "Rating below threshold" : "High refund rate"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Chart */}
      <Card className="col-span-full min-w-0 overflow-hidden">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Advanced Analytics Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground">
                Interactive data visualization with live API data
                {dashboardData?.comparison?.[timeRange === '7d' ? 'last7Days' : 'last30Days'] && (
                  <span className={`ml-2 text-xs font-semibold ${(dashboardData.comparison[timeRange === '7d' ? 'last7Days' : 'last30Days']?.revenueGrowth ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    ({(dashboardData.comparison[timeRange === '7d' ? 'last7Days' : 'last30Days']?.revenueGrowth ?? 0) >= 0 ? "+" : ""}
                    {dashboardData.comparison[timeRange === '7d' ? 'last7Days' : 'last30Days']?.revenueGrowth ?? 0}% vs prev. period)
                  </span>
                )}
              </p>
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
                <Button variant={selectedMetric === "revenue" ? "default" : "ghost"} size="sm" onClick={() => setSelectedMetric("revenue")}>Revenue</Button>
                <Button variant={selectedMetric === "orders" ? "default" : "ghost"} size="sm" onClick={() => setSelectedMetric("orders")}>Orders</Button>
                <Button variant={selectedMetric === "profit" ? "default" : "ghost"} size="sm" onClick={() => setSelectedMetric("profit")}>Profit</Button>
                <Button variant={selectedMetric === "customers" ? "default" : "ghost"} size="sm" onClick={() => setSelectedMetric("customers")}>Customers</Button>
              </div>

              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button variant={selectedChart === "line" ? "default" : "ghost"} size="sm" onClick={() => setSelectedChart("line")}><TrendingUp className="w-4 h-4" /></Button>
                <Button variant={selectedChart === "area" ? "default" : "ghost"} size="sm" onClick={() => setSelectedChart("area")}><Activity className="w-4 h-4" /></Button>
                <Button variant={selectedChart === "bar" ? "default" : "ghost"} size="sm" onClick={() => setSelectedChart("bar")}><BarChart3 className="w-4 h-4" /></Button>
                <Button variant={selectedChart === "composed" ? "default" : "ghost"} size="sm" onClick={() => setSelectedChart("composed")}><PieChartIcon className="w-4 h-4" /></Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => alert("Generating Monthly PDF Report...")}>
                  <Download className="w-4 h-4 mr-2" />
                  PDF Report
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Period Summary Metrics Row */}
          {periodMetrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Period Revenue</p>
                <p className="text-xl font-bold">₹{periodMetrics.revenue.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Total in selected period</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Avg. Order Value</p>
                <p className="text-xl font-bold">₹{periodMetrics.aov.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Based on {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : '1 year'}</p>
              </div>
              {isTaxEnabled && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Tax & GST Summary</p>
                  <p className="text-xl font-bold text-red-500">₹{periodMetrics.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{(taxSettings?.gstRate || 0) + (taxSettings?.taxRate || 0)}% Combined Tax (Included in sales)</p>
                </div>
              )}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Period Net Profit</p>
                <p className="text-xl font-bold text-emerald-500">₹{periodMetrics.netProfit.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-1">After Tax, COGS & Shipping</p>
              </div>
            </div>
          )}

          <div className="h-96 w-full min-w-0 bg-muted/20 rounded-xl p-2 sm:p-4 border border-border/50">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {renderChart() as any}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 w-full">
        {/* Category Performance (Grouped Bar Chart) */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Category Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Revenue vs Profit across categories</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                    <XAxis type="number" className="text-xs fill-muted-foreground" axisLine={false} tickLine={false} />
                    <YAxis dataKey="category" type="category" className="text-xs fill-muted-foreground" axisLine={false} tickLine={false} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    <Legend verticalAlign="top" height={30} />
                    <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="profit" fill="#10b981" name="Net Profit" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState />}
            </div>
          </CardContent>
        </Card>

        {/* Deductions Donut: Gross to Net */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Deductions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Where every ₹ from ₹{((dashboardData?.deductions?.grossSales || 0) / 1000).toFixed(1)}k goes
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              {deductionsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie data={deductionsData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                      {deductionsData.map((entry, index) => <Cell key={`ded-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No revenue data for breakdown" />}
            </div>
          </CardContent>
        </Card>

        {/* Funnel Chart: Abandoned Carts vs Success */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Conversion Funnel</CardTitle>
            <p className="text-sm text-muted-foreground">User flow from visits to successful purchase</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              {funnelData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <FunnelChart margin={{ top: 20, bottom: 20 }}>
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="right" fill="var(--color-foreground)" stroke="none" dataKey="name" className="text-xs font-semibold" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              ) : <EmptyState message="Connect Google Analytics to see funnel data" />}
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Customer Segments</CardTitle>
            <p className="text-sm text-muted-foreground">New vs Returning vs VIP (last 30 days)</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              {customerSegmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie data={customerSegmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {customerSegmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No customer data yet" />}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
            <p className="text-sm text-muted-foreground">COD vs Online Preferences</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              {paymentMethodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {paymentMethodData.map((entry: any, index: number) => <Cell key={`pm-cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} formatter={(value: any, name: string | undefined, props: any) => [`${value} Orders (₹${props?.payload?.amount?.toLocaleString() || 0})`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No payment data yet" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance Table */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Regional Performance & Shipping Efficiency</CardTitle>
          <p className="text-sm text-muted-foreground">Revenue, Shipping Costs, and Efficiency by region. <span className="text-red-500 font-medium">Red = Shipping &gt; 20% of Revenue</span></p>
        </CardHeader>
        <CardContent>
          {regionData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground">
                    <th className="text-left py-3 px-2 font-semibold">Region</th>
                    <th className="text-right py-3 px-2 font-semibold">Orders</th>
                    <th className="text-right py-3 px-2 font-semibold">Revenue</th>
                    <th className="text-right py-3 px-2 font-semibold">Shipping Cost</th>
                    <th className="text-right py-3 px-2 font-semibold">Shipping %</th>
                  </tr>
                </thead>
                <tbody>
                  {regionData.map((r, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 font-medium">{r.region}</td>
                      <td className="py-3 px-2 text-right">{r.orders}</td>
                      <td className="py-3 px-2 text-right font-semibold text-foreground">₹{r.revenue.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right text-muted-foreground">₹{r.shippingCost.toLocaleString()}</td>
                      <td className={`py-3 px-2 text-right font-bold ${r.shippingPct > 20 ? "text-red-600" : r.shippingPct > 10 ? "text-amber-600" : "text-emerald-600"}`}>
                        {r.shippingPct}%
                        {r.shippingPct > 20 && <span className="ml-1 text-red-500 text-xs">⚠</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="py-12"><EmptyState message="No regional data available" /></div>}
        </CardContent>
      </Card>
    </div>
  )
}
