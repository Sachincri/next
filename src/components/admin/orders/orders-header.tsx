"use client"

import { Button } from "@/ui/button"
import { Plus, Download, FileText } from "lucide-react"

export default function OrdersHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
        <p className="text-muted-foreground">Manage and track all customer orders</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Print Labels
        </Button>

        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Orders
        </Button>

        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Order
        </Button>
      </div>
    </div>
  )
}
