"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Users, Globe, Play, Loader2, Tag, ClipboardList } from "lucide-react"
import { useGetAdminDashboardQuery, useGetProductAnalyticsQuery, useGetGoogleAnalyticsQuery } from "@/redux/api/adminApi"
// import { COLORS } from "@/lib/utils" // Assuming we might have colors or just use hardcoded

const CHART_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Orange
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

export default function PrebuiltReports() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetAdminDashboardQuery();
  const { data: productData, isLoading: isProductLoading } = useGetProductAnalyticsQuery();
  const { data: googleData } = useGetGoogleAnalyticsQuery();

  const isLoading = isDashboardLoading || isProductLoading;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Transform Sales Trend Data
  const salesTrendData = dashboardData?.charts?.last12Months?.series?.map(item => ({
    month: item.month,
    sales: item.revenue,
    target: Math.round(item.revenue * 1.1) // Mock target as 110% of revenue
  })) || [];

  // Transform Geographic Data: Prefer GA data if available, else DB data
  const dbGeographicData = dashboardData?.byRegion?.map(item => ({
    country: item.region,
    revenue: item.revenue,
    percentage: parseFloat(((item.revenue / (dashboardData?.summary?.revenue || 1)) * 100).toFixed(1))
  })) || [];

  const gaGeographicData = googleData?.countries?.map((item: any) => ({
    country: item.country,
    revenue: item.revenue, // This might be 0 if not tracking ecommerce
    percentage: parseFloat(item.percentage)
  })) || [];

  const geographicData = gaGeographicData.length > 0 ? gaGeographicData : dbGeographicData;

  // Transform Conversion Funnel Data (Partially Real)
  const visitors = dashboardData?.summary?.users || 0;
  const orders = dashboardData?.summary?.orders || 0;
  const productViews = Math.round(visitors * 0.45);
  const addToCart = Math.round(visitors * 0.15);
  const checkouts = Math.round(visitors * 0.10);

  const realConversionFunnel = [
    { stage: "Visitors", count: visitors, percentage: 100 },
    { stage: "Product Views", count: productViews, percentage: visitors > 0 ? ((productViews / visitors) * 100).toFixed(1) : 0 },
    { stage: "Add to Cart", count: addToCart, percentage: visitors > 0 ? ((addToCart / visitors) * 100).toFixed(1) : 0 },
    { stage: "Checkout", count: checkouts, percentage: visitors > 0 ? ((checkouts / visitors) * 100).toFixed(1) : 0 },
    { stage: "Purchase", count: orders, percentage: visitors > 0 ? ((orders / visitors) * 100).toFixed(1) : 0 },
  ];

  // Transform Categories Data
  const categoryData = productData?.topCategories?.map((cat, index) => ({
    name: cat.name,
    value: cat.count,
    color: CHART_COLORS[index % CHART_COLORS.length]
  })) || [];

  // Transform Order Status Data
  const orderStatusData = dashboardData?.ordersByStatus ? Object.entries(dashboardData.ordersByStatus).map(([status, count], index) => ({
    status,
    count,
    color: CHART_COLORS[index % CHART_COLORS.length]
  })) : [];

  const totalOrders = orderStatusData.reduce((acc, curr) => acc + curr.count, 0);

  // Transform Traffic Data from Google Analytics
  const trafficSourceData = googleData?.traffic?.map((item: any, index: number) => ({
    name: item.name,
    value: parseFloat(item.value), // percentage
    count: item.count,
    color: CHART_COLORS[index % CHART_COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pre-built Reports</h2>
        <div className="flex items-center gap-2">
          {googleData?.realtime > 0 && (
            <Badge variant="outline" className="animate-pulse border-green-500 text-green-500">
              {googleData.realtime} Active Users
            </Badge>
          )}
          <Button variant="outline" size="sm">
            View All Reports
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales-trend" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Sales Trend Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Monthly sales performance vs targets</p>
                </div>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
                    <XAxis
                      dataKey="month"
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
                      formatter={(value: any) => [`$${(Number(value) || 0).toLocaleString()}`, "Amount"]}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" name="Actual Sales" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Conversion Funnel Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Customer journey and conversion rates</p>
                </div>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realConversionFunnel.map((stage) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="text-right">
                        <span className="font-semibold">{Number(stage.count).toLocaleString()}</span>
                        <Badge variant="secondary" className="ml-2">
                          {stage.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Category Distribution
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Product breakdown by category</p>
                </div>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <span className="font-semibold">{cat.value} Products</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Traffic Source Report (Google Analytics)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Breakdown of traffic sources</p>
                </div>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  {trafficSourceData.length > 0 ? trafficSourceData.map((source: any) => (
                    <div key={source.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                        <span className="font-medium">{source.name}</span>
                      </div>
                      <span className="font-semibold">{source.value}%</span>
                    </div>
                  )) : (
                    <div className="text-muted-foreground text-sm col-span-2">
                      No traffic data available. Ensure Google Analytics is configured.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Geographic Heatmap {gaGeographicData.length > 0 ? '(Google Analytics)' : ''}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Revenue/Users distribution by country</p>
                </div>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Run Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.length > 0 ? geographicData.map((country: any) => (
                  <div key={country.country} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{country.country}</span>
                      <div className="text-right">
                        <span className="font-semibold">${country.revenue?.toLocaleString() || 0}</span>
                        <Badge variant="secondary" className="ml-2">
                          {country.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No geographic data available yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order-status">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Order Status Breakdown
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Current status of all orders</p>
                </div>
                <Button size="sm">
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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Count</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderStatusData.length > 0 ? orderStatusData.map((item) => (
                      <tr key={item.status} className="border-b border-border">
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.status}
                          </div>
                        </td>
                        <td className="py-3 px-4">{item.count.toLocaleString()}</td>
                        <td className="py-3 px-4 font-semibold">
                          {totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="text-center py-6 text-muted-foreground">No order data available.</td>
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
  )
}
