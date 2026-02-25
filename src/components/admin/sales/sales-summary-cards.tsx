"use client"

import KPICard from "@/components/admin/kpi-card"
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react"
import { useGetAdminDashboardQuery } from "@/redux/api/adminApi"

export default function SalesSummaryCards() {
  const { data: dashboardData, isLoading } = useGetAdminDashboardQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  const summary = dashboardData?.summary || {
    revenue: 0,
    orders: 0,
    profit: 0,
    avgOrderValue: 0,
  };

  const salesChange = dashboardData?.realTime?.today?.revenueGrowth || 0;
  const ordersChange = dashboardData?.realTime?.today?.ordersGrowth || 0;
  const profitChange = dashboardData?.realTime?.today?.profitGrowth || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Sales"
        value={`${summary.revenue.toLocaleString()}`}
        change={`${salesChange > 0 ? '+' : ''}${salesChange}% vs yesterday`}
        changeType={salesChange >= 0 ? "positive" : "negative"}
        icon={<DollarSign className="w-4 h-4" />}
      />
      <KPICard
        title="Net Profit"
        value={`${(summary.profit || 0).toLocaleString()}`}
        change={`${profitChange > 0 ? '+' : ''}${profitChange}% vs yesterday`}
        changeType={profitChange >= 0 ? "positive" : "negative"}
        icon={<TrendingUp className="w-4 h-4 font-bold text-green-600" />}
      />
      <KPICard
        title="Total Orders"
        value={summary.orders.toLocaleString()}
        change={`${ordersChange > 0 ? '+' : ''}${ordersChange}% vs yesterday`}
        changeType={ordersChange >= 0 ? "positive" : "negative"}
        icon={<ShoppingCart className="w-4 h-4" />}
      />
      <KPICard
        title="Avg Order Value"
        value={`${Math.round(summary.avgOrderValue).toLocaleString()}`}
        change="Based on all time"
        changeType="neutral"
        icon={<TrendingUp className="w-4 h-4" />}
      />
    </div>
  )
}

