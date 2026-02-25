"use client"
import dynamic from "next/dynamic"
import DashboardLayout from "@/components/admin/dashboard-layout"
import CustomersHeader from "@/components/admin/customers/customers-header"

const CustomersSegments = dynamic(() => import("@/components/admin/customers/customers-segments"), { ssr: false })
const CustomersTable = dynamic(() => import("@/components/admin/customers/customers-table"), { ssr: false })

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CustomersHeader />
        <CustomersSegments />
        <CustomersTable />
      </div>
    </DashboardLayout>
  )
}
