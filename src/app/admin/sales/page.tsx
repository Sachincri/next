"use client"
import dynamic from "next/dynamic"
import DashboardLayout from "@/components/admin/dashboard-layout"
import SalesHeader from "@/components/admin/sales/sales-header"
import SalesSummaryCards from "@/components/admin/sales/sales-summary-cards"

const RevenueChart = dynamic(() => import("@/components/admin/sales/revenue-chart"), { ssr: false })
const SalesBreakdown = dynamic(() => import("@/components/admin/sales/sales-breakdown"), { ssr: false })
const TransactionsTable = dynamic(() => import("@/components/admin/sales/transactions-table"), { ssr: false })

export default function SalesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SalesHeader />
        <SalesSummaryCards />
        <RevenueChart />
        <SalesBreakdown />
        <TransactionsTable />
      </div>
    </DashboardLayout>
  )
}
