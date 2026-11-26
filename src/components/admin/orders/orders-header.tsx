"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/ui/button"
import { Plus, Download, FileText, Loader2 } from "lucide-react"
import { useLazyGetAllOrdersQuery } from "@/redux/api/adminApi"
import { exportOrdersToCSV } from "@/utils/csvHelper"
import toast from "react-hot-toast"

export default function OrdersHeader() {
  const searchParams = useSearchParams()
  const [triggerExport, { isFetching }] = useLazyGetAllOrdersQuery()

  const handleExportAll = async () => {
    try {
      const statusParam = searchParams.get("status")
      const paymentParam = searchParams.get("payment")
      const methodParam = searchParams.get("paymentMethod")

      const res = await triggerExport({
        page: 1,
        limit: 10000,
        status: statusParam && statusParam !== "all" ? statusParam : undefined,
        payment: paymentParam && paymentParam !== "all" ? paymentParam : undefined,
        paymentMethod: methodParam && methodParam !== "all" ? methodParam : undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        minAmount: searchParams.get("minAmount") || undefined,
        maxAmount: searchParams.get("maxAmount") || undefined,
        search: searchParams.get("search") || undefined,
        sortBy: searchParams.get("sortBy") || undefined,
      }).unwrap()
      const orders = res?.orders || []
      if (orders.length === 0) {
        toast.error("No orders found to export")
        return
      }
      exportOrdersToCSV(orders)
      toast.success(`Exported ${orders.length} orders successfully!`)
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to export orders")
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
        <p className="text-muted-foreground">Manage and track all customer orders</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none"
          onClick={handleExportAll}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isFetching ? "Exporting..." : "Export"}
        </Button>

        <Button size="sm" className="w-full sm:w-auto" onClick={() => toast("Create order manually coming soon", { icon: "ℹ️" })}>
          <Plus className="w-4 h-4 mr-2" />
          Create Order
        </Button>
      </div>
    </div>
  )
}
