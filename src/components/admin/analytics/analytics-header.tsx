"use client"

import { Button } from "../../ui/button"
import { Plus, Download, Share } from "lucide-react"

export default function AnalyticsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Insights</h1>
        <p className="text-muted-foreground">Advanced analytics and custom reporting tools</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <Share className="w-4 h-4 mr-2" />
          Share Report
        </Button>

        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>

        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Button>
      </div>
    </div>
  )
}
