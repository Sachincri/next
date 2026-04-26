"use client"
import dynamic from "next/dynamic"
import CustomersHeader from "@/components/admin/customers/customers-header"

const CustomersSegments = dynamic(() => import("@/components/admin/customers/customers-segments"), { ssr: false })
const CustomersTable = dynamic(() => import("@/components/admin/customers/customers-table"), { ssr: false })

export default function CustomersPage() {
  return (
      <div className="space-y-6">
        <CustomersHeader />
        <CustomersSegments />
        <div className="overflow-x-auto pb-4">
          <CustomersTable />
        </div>
      </div>
  )
}
