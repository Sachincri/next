"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Globe,
  Play,
  Loader2,
  Tag,
  ClipboardList,
  Inbox,
} from "lucide-react";
import toast from "react-hot-toast";
import { useGetGoogleAnalyticsQuery } from "@/redux/api/adminApi";
import type { AnalyticsOverviewData } from "@/types/admin";
import {
  AnalyticsDateRange,
  exportAnalyticsCsv,
  formatAxisDate,
  formatCompactINR,
  formatFullINR,
  formatTooltipValueWithDate,
  getDatesForPreset,
} from "@/lib/analytics-utils";

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

interface PrebuiltReportsProps {
  overview?: AnalyticsOverviewData;
  isLoading?: boolean;
  dateRange?: AnalyticsDateRange;
  onResetRange?: () => void;
}

function SalesTrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs space-y-1">
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color || "#3b82f6" }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {formatTooltipValueWithDate("sales", entry.value ?? 0, label)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PrebuiltReports({
  overview,
  isLoading = false,
  dateRange = getDatesForPreset("30d"),
  onResetRange,
}: PrebuiltReportsProps) {
  const [activeTab, setActiveTab] = useState("sales-trend");
  const { data: googleData } = useGetGoogleAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const salesTrendData =
    overview?.series?.map((item) => ({
      date: item.date,
      sales: item.sales ?? item.revenue,
      target: item.target ?? Math.round((item.revenue || 0) * 1.1),
    })) || [];

  const hasSalesActivity = salesTrendData.some(
    (d) => Number(d.sales || 0) > 0 || Number(d.target || 0) > 0
  );

  const dbGeographicData =
    overview?.byRegion?.map((item) => ({
      country: item.region,
      revenue: item.revenue,
      percentage: item.percentage,
    })) || [];

  const gaGeographicData =
    googleData?.countries?.map((item: any) => ({
      country: item.country,
      revenue: item.revenue,
      percentage: parseFloat(item.percentage),
    })) || [];

  const geographicData =
    gaGeographicData.length > 0 ? gaGeographicData : dbGeographicData;

  const conversionFunnel = overview?.conversionFunnel || [
    { stage: "Visitors", count: 0, percentage: "0.0" },
    { stage: "Product Views", count: 0, percentage: "0.0" },
    { stage: "Add to Cart", count: 0, percentage: "0.0" },
    { stage: "Checkout", count: 0, percentage: "0.0" },
    { stage: "Purchase", count: 0, percentage: "0.0" },
  ];

  const categoryData = (overview?.topCategories || []).map((cat, index) => ({
    name: cat.name,
    value: cat.value,
    revenue: cat.revenue,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));
  const nonZeroCategoryData = categoryData.filter((c) => c.value > 0);

  const orderStatusData = overview?.ordersByStatus
    ? Object.entries(overview.ordersByStatus).map(([status, count], index) => ({
        status,
        count,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
    : [];

  const totalOrders = orderStatusData.reduce((acc, curr) => acc + curr.count, 0);

  const trafficSourceData =
    googleData?.traffic?.map((item: any, index: number) => ({
      name: item.name,
      value: parseFloat(item.value),
      count: item.count,
      color: CHART_COLORS[index % CHART_COLORS.length],
    })) || [];

  const handleRunReport = (reportTitle: string) => {
    if (exportAnalyticsCsv(overview, dateRange)) {
      toast.success(`${reportTitle} exported`);
    } else {
      toast.error("No report data available to export");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Pre-built Reports</h2>
        <div className="flex items-center gap-2">
          {googleData?.realtime > 0 && (
            <Badge
              variant="outline"
              className="animate-pulse border-green-500 text-green-500"
            >
              {googleData.realtime} Active Users
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("sales-trend")}
          >
            View All Reports
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto gap-1 p-1">
          <TabsTrigger value="sales-trend">Sales Trend</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="order-status">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="sales-trend">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Sales Trend Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Actual sales vs target for the selected period
                  </p>
                </div>
                <Button size="sm" onClick={() => handleRunReport("Sales Trend Report")}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {!hasSalesActivity || salesTrendData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center border border-dashed border-border rounded-lg text-center px-4">
                    <Inbox className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      No sales data in this date range
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Adjust the global date filter to view sales performance trends.
                    </p>
                    {onResetRange && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={onResetRange}
                      >
                        Switch to Last 90 Days
                      </Button>
                    )}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesTrendData}
                      barCategoryGap={salesTrendData.length <= 3 ? "35%" : "20%"}
                      margin={{ top: 10, right: 24, left: 4, bottom: 16 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border opacity-50"
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatAxisDate}
                        minTickGap={24}
                        interval="preserveStartEnd"
                        className="text-[11px]"
                        tick={{ fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        tickFormatter={formatCompactINR}
                        width={66}
                        className="text-[11px]"
                        tick={{ fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<SalesTrendTooltip />}
                        cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                      />
                      <Bar
                        dataKey="sales"
                        fill="#3b82f6"
                        name="Actual Sales"
                        maxBarSize={42}
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="target"
                        fill="#94a3b8"
                        fillOpacity={0.35}
                        name="Target"
                        maxBarSize={42}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Conversion Funnel Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Customer journey and conversion rates
                  </p>
                </div>
                <Button size="sm" onClick={() => handleRunReport("Conversion Report")}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((stage) => {
                  const safePercent = Math.min(
                    100,
                    Math.max(0, parseFloat(String(stage.percentage)) || 0)
                  );
                  return (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{stage.stage}</span>
                        <div className="text-right flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {Number(stage.count).toLocaleString("en-IN")}
                          </span>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {stage.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted/60 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-primary h-3 rounded-full transition-all duration-300 max-w-full"
                          style={{ width: `${safePercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Category Distribution
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Sales and product breakdown by category
                  </p>
                </div>
                <Button size="sm" onClick={() => handleRunReport("Category Report")}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {nonZeroCategoryData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No category activity found for this period.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={nonZeroCategoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {nonZeroCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [
                            `${Number(value || 0).toLocaleString("en-IN")} Units`,
                            "Volume",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {nonZeroCategoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium text-sm">{cat.name}</span>
                        </div>
                        <div className="text-right text-sm">
                          <span className="font-semibold">
                            {cat.value.toLocaleString("en-IN")} units
                          </span>
                          {cat.revenue > 0 && (
                            <span className="text-muted-foreground ml-2">
                              ({formatFullINR(cat.revenue)})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Traffic Source Report (Google Analytics)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Breakdown of traffic sources
                  </p>
                </div>
                <Button size="sm" onClick={() => handleRunReport("Traffic Report")}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {trafficSourceData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg">
                  <Globe className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    No traffic data available
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect Google Analytics in Settings to track acquisition channels.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trafficSourceData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {trafficSourceData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {trafficSourceData.map((source: any) => (
                      <div key={source.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                          <span className="font-medium">{source.name}</span>
                        </div>
                        <span className="font-semibold">{source.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Geographic Heatmap{" "}
                    {gaGeographicData.length > 0 ? "(Google Analytics)" : ""}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Revenue and order distribution by region
                  </p>
                </div>
                <Button size="sm" onClick={() => handleRunReport("Geographic Report")}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.length > 0 ? (
                  geographicData.map((country: any) => {
                    const safeGeoPercent = Math.min(
                      100,
                      Math.max(0, parseFloat(String(country.percentage)) || 0)
                    );
                    return (
                      <div key={country.country} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{country.country}</span>
                          <div className="text-right flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {formatFullINR(country.revenue || 0)}
                            </span>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {country.percentage}%
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-300 max-w-full"
                            style={{ width: `${safeGeoPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No geographic data available for this date range.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order-status">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Order Status Breakdown
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Status breakdown of orders in the selected range
                  </p>
                </div>
                <Button size="sm" onClick={() => handleRunReport("Order Status Report")}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Count
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderStatusData.length > 0 ? (
                      orderStatusData.map((item) => (
                        <tr key={item.status} className="border-b border-border">
                          <td className="py-3 px-4 font-medium capitalize">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.status}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {item.count.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {totalOrders > 0
                              ? ((item.count / totalOrders) * 100).toFixed(1)
                              : 0}
                            %
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-8 text-muted-foreground text-sm"
                        >
                          No orders found for the selected date range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
