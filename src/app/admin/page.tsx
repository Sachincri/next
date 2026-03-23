"use client"

import { useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import DashboardLayout from "@/components/admin/dashboard-layout"
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, Star, Wifi, WifiOff, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const SalesChart = dynamic(() => import("@/components/admin/sales-chart"), { ssr: false })
const OrderStatusChart = dynamic(() => import("@/components/admin/order-status-chart"), { ssr: false })
const CategoryPerformanceChart = dynamic(() => import("@/components/admin/category-performance-chart"), { ssr: false })
const EnhancedAnalyticsDashboard = dynamic(() => import("@/components/admin/enhanced-analytics-dashboard"), { ssr: false })
import { useGetAdminDashboardQuery, useGetProductAnalyticsQuery } from "@/redux/api/adminApi"
import { useSocket } from "@/contexts/socket-context"
import toast from "react-hot-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const defaultKpis = {
  totalRevenue: { value: 0, change: 0 },
  totalOrders: { value: 0, change: 0 },
  averageOrderValue: { value: 0, change: 0 },
  conversionRate: { value: 0, change: 0 },
  customerSatisfaction: { value: 0, change: 0 },
  productsSold: { value: 0, change: 0 },
  activeUsers: { value: 0, change: 0 },
}

export default function HomePage() {
  const { data, isLoading: loading, error, refetch } = useGetAdminDashboardQuery()
  const { data: analyticsData } = useGetProductAnalyticsQuery()
  const { socket, isConnected, joinAdminRoom, leaveAdminRoom } = useSocket()

  // Join admin room on mount and listen for real-time updates
  useEffect(() => {
    if (isConnected) {
      joinAdminRoom()
    }

    return () => {
      if (isConnected) {
        leaveAdminRoom()
      }
    }
  }, [isConnected, joinAdminRoom, leaveAdminRoom])

  // Listen for dashboard update events
  useEffect(() => {
    if (!socket) return

    const handleDashboardUpdate = (data: any) => {
      console.log('Dashboard update received:', data)
      refetch() // Refresh dashboard data
    }

    const handleOrderCreated = (data: any) => {
      toast.success(`New order received: ₹${data.totalPrice}`)
      refetch()
    }

    const handleOrderUpdated = (data: any) => {
      toast(`${data.user?.name || 'User'} updated order ${data.orderId}`, { icon: 'ℹ️' })
      refetch()
    }

    const handleProductCreated = (data: any) => {
      toast.success(`New product added: ${data.name}`)
      refetch()
    }

    const handleProductUpdated = (data: any) => {
      refetch()
    }

    const handleStockLow = (data: any) => {
      toast.error(`Low stock alert: ${data.productName} (${data.stock} left)`)
    }

    const handleUserRegistered = (data: any) => {
      toast.success(`New user registered: ${data.name}`)
      refetch()
    }

    // Register event listeners
    socket.on('dashboard:update', handleDashboardUpdate)
    socket.on('order:created', handleOrderCreated)
    socket.on('order:updated', handleOrderUpdated)
    socket.on('product:created', handleProductCreated)
    socket.on('product:updated', handleProductUpdated)
    socket.on('stock:low', handleStockLow)
    socket.on('user:registered', handleUserRegistered)

    // Cleanup listeners on unmount
    return () => {
      socket.off('dashboard:update', handleDashboardUpdate)
      socket.off('order:created', handleOrderCreated)
      socket.off('order:updated', handleOrderUpdated)
      socket.off('product:created', handleProductCreated)
      socket.off('product:updated', handleProductUpdated)
      socket.off('stock:low', handleStockLow)
      socket.off('user:registered', handleUserRegistered)
    }
  }, [socket, refetch])

  const kpis = useMemo(() => {
    if (!data) return defaultKpis;

    const summary = data.summary;
    const realTime = data.realTime;

    return {
      totalRevenue: {
        value: summary?.revenue || 0,
        change: realTime?.today?.revenueGrowth || 0
      },
      totalOrders: {
        value: summary?.orders || 0,
        change: realTime?.today?.ordersGrowth || 0
      },
      averageOrderValue: {
        value: summary?.avgOrderValue || 0,
        change: 0
      },
      conversionRate: {
        value: summary?.conversionRate || 0,
        change: 0
      },
      customerSatisfaction: {
        value: summary?.customerSatisfaction || 0,
        change: 0
      },
      productsSold: {
        value: summary?.orders || 0,
        change: 0
      },
      activeUsers: {
        value: summary?.users || 0,
        change: 0
      },
    }
  }, [data])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  const formatChange = (change: number) => {
    const changeValue = change || 0
    const isPositive = changeValue >= 0
    return (
      <p className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? "+" : ""}
        {changeValue}% from last month
      </p>
    )
  }

  const safeGetKpi = (kpiName: keyof typeof defaultKpis) => {
    return kpis[kpiName] || defaultKpis[kpiName]
  }

  if (error) {
    console.error("[Admin Dashboard] Error fetching dashboard data:", error)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 ">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's what's happening with your business today.</p>
          </div>
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Revenue",
              value: loading ? "..." : formatCurrency(safeGetKpi("totalRevenue").value),
              change: safeGetKpi("totalRevenue").change,
              icon: DollarSign,
              iconColor: "text-green-600 bg-green-100 dark:bg-green-900/20",
            },
            {
              title: "Total Orders",
              value: loading ? "..." : safeGetKpi("totalOrders").value.toLocaleString(),
              change: safeGetKpi("totalOrders").change,
              icon: ShoppingCart,
              iconColor: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
            },
            {
              title: "Avg Order Value",
              value: loading ? "..." : formatCurrency(safeGetKpi("averageOrderValue").value),
              change: safeGetKpi("averageOrderValue").change,
              icon: TrendingUp,
              iconColor: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20",
            },
            {
              title: "Conversion Rate",
              value: loading ? "..." : `${safeGetKpi("conversionRate").value}%`,
              change: safeGetKpi("conversionRate").change,
              icon: Users,
              iconColor: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  {!loading && formatChange(stat.change)}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1: Primary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0 w-full">
          <div className="lg:col-span-2 min-w-0 overflow-hidden">
            <SalesChart allData={data?.charts} />
          </div>
          <div className="lg:col-span-1 min-w-0 overflow-hidden">
            <OrderStatusChart data={data?.ordersByStatus} />
          </div>
        </div>

        {/* Charts Row 2: Secondary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 w-full">
          <div className="min-w-0 overflow-hidden">
            <CategoryPerformanceChart data={analyticsData?.topCategories} />
          </div>
          <Card className="hover:shadow-md transition-shadow min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Real-time Insights</CardTitle>
              <p className="text-sm text-muted-foreground">Today's snapshot compared to average</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Today's Revenue", value: data?.realTime?.today?.revenue, growth: data?.realTime?.today?.revenueGrowth, icon: DollarSign, color: "text-green-600" },
                  { label: "Today's Orders", value: data?.realTime?.today?.orders, growth: data?.realTime?.today?.ordersGrowth, icon: ShoppingCart, color: "text-blue-600" },
                  { label: "Today's Users", value: data?.realTime?.today?.users, growth: 0, icon: Users, color: "text-orange-600" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-white dark:bg-zinc-900 border ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-bold">
                          {typeof item.value === 'number' && item.label.includes('Revenue') ? formatCurrency(item.value) : item.value || 0}
                        </p>
                      </div>
                    </div>
                    {item.growth !== undefined && item.growth !== 0 && (
                      <Badge variant={item.growth > 0 ? "default" : "destructive"} className={item.growth > 0 ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" : ""}>
                        {item.growth > 0 ? "+" : ""}{item.growth}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Customer Satisfaction",
              value: loading ? "..." : `${safeGetKpi("customerSatisfaction").value.toFixed(1)}/5.0`,
              change: safeGetKpi("customerSatisfaction").change,
              icon: Star,
              iconColor: "text-amber-600 bg-amber-100 dark:bg-amber-900/20",
            },
            {
              title: "Products Sold",
              value: loading ? "..." : safeGetKpi("productsSold").value.toLocaleString(),
              change: safeGetKpi("productsSold").change,
              icon: Package,
              iconColor: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
            },
            {
              title: "Total Users",
              value: loading ? "..." : safeGetKpi("activeUsers").value.toLocaleString(),
              change: safeGetKpi("activeUsers").change,
              icon: Users,
              iconColor: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  {!loading && formatChange(stat.change)}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity & Top Products */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0 w-full">
          {/* Recent Orders */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground">Latest transactions from your store</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading orders...</TableCell></TableRow>
                  ) : !data?.recentActivity?.orders?.length ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No recent orders</TableCell></TableRow>
                  ) : (
                    data.recentActivity.orders.slice(0, 4).map((order: any) => (
                      <TableRow key={order._id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs font-medium">{order._id.substring(order._id.length - 8).toUpperCase()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">{order.user?.name?.[0] || 'G'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{order.user?.name || 'Guest'}</span>
                              <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-medium ${order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                            order.orderStatus === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200 text-blue-800' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                            {order.orderStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">₹{order.totalPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground text-right">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Top Selling Products</CardTitle>
              <p className="text-sm text-muted-foreground">Highest performing items this month</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loading ? (
                  <p className="text-center py-10 text-muted-foreground">Loading products...</p>
                ) : !data?.topProducts?.length ? (
                  <p className="text-center py-10 text-muted-foreground">No product data available</p>
                ) : (
                  data.topProducts.slice(0, 4).map((product: any, index: number) => (
                    <div key={product._id} className="flex items-center gap-4 group">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden border group-hover:border-primary/50 transition-colors">
                          {product.image ? (
                            <img src={product.image} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-6 h-6 m-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="absolute -top-2 -left-2 bg-background border rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.totalSold} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">₹{(product.totalRevenue || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-green-600 font-medium">+12%</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0 w-full">
          {/* Low Stock Alerts */}
          <Card className="border-red-100 dark:border-red-900/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Low Stock Alerts
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Items requiring immediate attention</p>
              </div>
              <Badge variant="destructive" className="h-6 px-2">{data?.summary?.lowStockProducts || 0}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-6 text-muted-foreground">Loading alerts...</p>
                ) : !data?.summary?.lowStockDetails?.length ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
                    <p>No low stock items</p>
                  </div>
                ) : (
                  data.summary.lowStockDetails.map((product: any) => (
                    <div key={product._id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 group hover:border-red-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-white flex items-center justify-center border border-red-100">
                          <Package className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-red-700 transition-colors">{product.name}</p>
                          <p className="text-xs text-red-600 font-medium">{product.stock} units remaining</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700">
                        Refill
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* New Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">New Customers</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Recently registered users</p>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {loading ? (
                  <p className="text-center py-6 text-muted-foreground">Loading users...</p>
                ) : !data?.recentActivity?.users?.length ? (
                  <p className="text-center py-6 text-muted-foreground">No new users</p>
                ) : (
                  data.recentActivity.users.map((user: any) => (
                    <div key={user._id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:border-primary/20 transition-colors">
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 mb-1">New</Badge>
                        <p className="text-[10px] text-muted-foreground">{new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analytics Dashboard Section */}
        <div className="mt-8 min-w-0 w-full">
          <h2 className="text-2xl font-bold text-foreground mb-4">Advanced Analytics</h2>
          <div className="bg-card border rounded-lg p-2 sm:p-6 min-w-0 overflow-hidden">
            <EnhancedAnalyticsDashboard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
