"use client"

import { useState } from "react"
import { Button } from "@/ui/button"
import { Plus, Download, Target, Loader2 } from "lucide-react"
import { useLazyGetAllUsersQuery } from "@/redux/api/adminApi"
import { exportCustomersToCSV } from "@/utils/csvHelper"
import toast from "react-hot-toast"

export default function CustomersHeader() {
  const [triggerExport, { isFetching }] = useLazyGetAllUsersQuery()

  const handleExportAll = async () => {
    try {
      const res = await triggerExport(undefined).unwrap()
      const users = res || []
      if (!users || users.length === 0) {
        toast.error("No customers found to export")
        return
      }
      exportCustomersToCSV(users)
      toast.success(`Exported ${users.length} customer(s) successfully!`)
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to export customers")
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Customer Management</h1>
        <p className="text-muted-foreground">Manage customer relationships and segments</p>
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

        <Button size="sm" className="w-full sm:w-auto" onClick={() => toast("Add customer manually coming soon", { icon: "ℹ️" })}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>
    </div>
  )
}
