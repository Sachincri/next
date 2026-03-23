import DashboardLayout from "@/components/admin/dashboard-layout"
import OrdersHeader from "@/components/admin/orders/orders-header"
import OrdersFilters from "@/components/admin/orders/orders-filters"
import OrdersTable from "@/components/admin/orders/orders-table"

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <OrdersHeader />
        <OrdersFilters />
        <div className="overflow-x-auto pb-4">
          <OrdersTable />
        </div>
      </div>
    </DashboardLayout>
  )
}
