"use client"
import KPICard from "@/components/admin/kpi-card"
import { Package, AlertTriangle, TrendingDown, BarChart3 } from "lucide-react"
import { RootState } from "@/redux/store"
import { useGetAdminProductsQuery } from "@/redux/api/adminApi"

export default function ProductsSummary() {
  const { data: productsData, isLoading } = useGetAdminProductsQuery()
  const products = productsData?.products || []

  const totalProducts = products.length
  const outOfStock = products.filter((p) => p.stock === 0).length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length
  const activeProducts = products.filter((p) => p.stock > 0).length

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-lg" />)}
    </div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Products"
        value={totalProducts?.toLocaleString()}
        change={`Total catalog size`}
        changeType="neutral"
        icon={<Package className="w-4 h-4" />}
      />
      <KPICard
        title="Out of Stock"
        value={outOfStock?.toLocaleString()}
        change={`${((outOfStock / totalProducts) * 100 || 0).toFixed(1)}% of total`}
        changeType={outOfStock > 0 ? "negative" : "positive"}
        icon={<AlertTriangle className="w-4 h-4" />}
      />
      <KPICard
        title="Low Stock"
        value={lowStock?.toLocaleString()}
        change="Requires attention"
        changeType={lowStock > 0 ? "negative" : "positive"}
        icon={<TrendingDown className="w-4 h-4" />}
      />
      <KPICard
        title="Active Products"
        value={activeProducts?.toLocaleString()}
        change={`${((activeProducts / totalProducts) * 100 || 0).toFixed(1)}% of total`}
        changeType="neutral"
        icon={<BarChart3 className="w-4 h-4" />}
      />
    </div>
  )
}
