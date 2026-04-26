"use client"
import dynamic from "next/dynamic"
import ProductsHeader from "@/components/admin/products/products-header"

const ProductsSummary = dynamic(() => import("@/components/admin/products/products-summary"), { ssr: false })
const ProductsTable = dynamic(() => import("@/components/admin/products/products-table"), { ssr: false })

export default function ProductsPage() {
  return (
      <div className="space-y-6">
        <ProductsHeader />
        <ProductsSummary />
        <div className="overflow-x-auto pb-4">
          <ProductsTable />
        </div>
      </div>
  )
}
