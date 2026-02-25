"use client"
import dynamic from "next/dynamic"
import DashboardLayout from "@/components/admin/dashboard-layout"
import ProductsHeader from "@/components/admin/products/products-header"

const ProductsSummary = dynamic(() => import("@/components/admin/products/products-summary"), { ssr: false })
const ProductsTable = dynamic(() => import("@/components/admin/products/products-table"), { ssr: false })

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProductsHeader />
        <ProductsSummary />
        <ProductsTable />
      </div>
    </DashboardLayout>
  )
}
