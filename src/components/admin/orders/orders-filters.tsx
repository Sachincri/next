"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/ui/card"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { Badge } from "@/ui/badge"
import { Search, Filter, X, Calendar } from "lucide-react"

export default function OrdersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "")
  const lastPushedSearch = useRef(searchParams.get("search") || "")
  const statusFilter = searchParams.get("status") || "all"
  const paymentFilter = searchParams.get("payment") || "all"
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Debounce search update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only push if the search string actually changed
      if (localSearch !== lastPushedSearch.current) {
        lastPushedSearch.current = localSearch;
        const params = new URLSearchParams(searchParams.toString())
        if (localSearch) params.set("search", localSearch)
        else params.delete("search")

        // Reset page whenever search changes
        params.delete("page")
        router.push(`?${params.toString()}`, { scroll: false })
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [localSearch, router, searchParams])

  const setStatusFilter = (val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val !== "all") params.set("status", val)
    else params.delete("status")
    params.delete("page") // reset to first page
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const setPaymentFilter = (val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val !== "all") params.set("payment", val)
    else params.delete("payment")
    params.delete("page")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const activeFilters = []
  if (statusFilter !== "all") activeFilters.push({ key: "status", value: statusFilter })
  if (paymentFilter !== "all") activeFilters.push({ key: "payment", value: paymentFilter })

  const clearFilter = (key: string) => {
    if (key === "status") setStatusFilter("all")
    if (key === "payment") setPaymentFilter("all")
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("status")
    params.delete("payment")
    params.delete("search")
    params.delete("page")
    setLocalSearch("")
    lastPushedSearch.current = ""
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Main Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID, Customer Name, or Email..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full sm:w-auto ${showAdvanced ? "bg-muted" : ""}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Select dates
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Amount Range</label>
                <div className="flex gap-2">
                  <Input placeholder="Min" type="number" />
                  <Input placeholder="Max" type="number" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Product</label>
                <Input placeholder="Product name" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Region</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia Pacific</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge key={filter.key} variant="secondary" className="gap-1">
                  {filter.key}: {filter.value}
                  <button onClick={() => clearFilter(filter.key)} className="hover:bg-muted-foreground/20 rounded">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
