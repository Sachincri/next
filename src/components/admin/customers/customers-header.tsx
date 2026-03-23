"use client"

import { Button } from "@/ui/button"
import { Plus, Download, Target } from "lucide-react"

export default function CustomersHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Customer Management</h1>
        <p className="text-muted-foreground">Manage customer relationships and segments</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
          <Target className="w-4 h-4 mr-2" />
          Segment
        </Button>

        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>
    </div>
  )
}
