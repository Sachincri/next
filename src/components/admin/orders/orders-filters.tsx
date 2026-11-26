"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/ui/card"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { Badge } from "@/ui/badge"
import { Search, Filter, X, Calendar, ArrowUpDown, IndianRupee, RotateCcw, Check } from "lucide-react"

export default function OrdersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "")
  const lastPushedSearch = useRef(searchParams.get("search") || "")

  const statusFilter = searchParams.get("status") || "all"
  const paymentFilter = searchParams.get("payment") || "all"
  const paymentMethodFilter = searchParams.get("paymentMethod") || "all"
  const sortBy = searchParams.get("sortBy") || "newest"
  const startDate = searchParams.get("startDate") || ""
  const endDate = searchParams.get("endDate") || ""
  const minAmount = searchParams.get("minAmount") || ""
  const maxAmount = searchParams.get("maxAmount") || ""

  const hasAdvancedActive = Boolean(startDate || endDate || minAmount || maxAmount || (sortBy && sortBy !== "newest"))
  const [showAdvanced, setShowAdvanced] = useState(hasAdvancedActive)

  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)
  const [localMinAmount, setLocalMinAmount] = useState(minAmount)
  const [localMaxAmount, setLocalMaxAmount] = useState(maxAmount)

  // Keep local inputs in sync when URL changes
  useEffect(() => {
    setLocalStartDate(searchParams.get("startDate") || "")
    setLocalEndDate(searchParams.get("endDate") || "")
    setLocalMinAmount(searchParams.get("minAmount") || "")
    setLocalMaxAmount(searchParams.get("maxAmount") || "")
    setLocalSearch(searchParams.get("search") || "")
    lastPushedSearch.current = searchParams.get("search") || ""
  }, [searchParams])

  // Debounce search update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== lastPushedSearch.current) {
        lastPushedSearch.current = localSearch
        const params = new URLSearchParams(searchParams.toString())
        if (localSearch.trim()) params.set("search", localSearch.trim())
        else params.delete("search")
        params.delete("page")
        router.push(`?${params.toString()}`, { scroll: false })
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [localSearch, router, searchParams])

  const updateParam = (key: string, val: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== "all") params.set(key, val)
    else params.delete(key)
    params.delete("page")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const applyAdvancedFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (localStartDate) params.set("startDate", localStartDate)
    else params.delete("startDate")

    if (localEndDate) params.set("endDate", localEndDate)
    else params.delete("endDate")

    if (localMinAmount) params.set("minAmount", localMinAmount)
    else params.delete("minAmount")

    if (localMaxAmount) params.set("maxAmount", localMaxAmount)
    else params.delete("maxAmount")

    params.delete("page")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const setDatePreset = (preset: "today" | "last7" | "last30" | "thisMonth") => {
    const today = new Date()
    const formatDate = (d: Date) => d.toISOString().slice(0, 10)
    const todayStr = formatDate(today)

    let start = ""
    if (preset === "today") {
      start = todayStr
    } else if (preset === "last7") {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      start = formatDate(d)
    } else if (preset === "last30") {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      start = formatDate(d)
    } else if (preset === "thisMonth") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1)
      start = formatDate(d)
    }

    setLocalStartDate(start)
    setLocalEndDate(todayStr)

    const params = new URLSearchParams(searchParams.toString())
    params.set("startDate", start)
    params.set("endDate", todayStr)
    params.delete("page")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams()
    setLocalSearch("")
    lastPushedSearch.current = ""
    setLocalStartDate("")
    setLocalEndDate("")
    setLocalMinAmount("")
    setLocalMaxAmount("")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Active filter count for badge
  let activeAdvancedCount = 0
  if (startDate || endDate) activeAdvancedCount++
  if (minAmount || maxAmount) activeAdvancedCount++
  if (sortBy && sortBy !== "newest") activeAdvancedCount++

  // Chips list
  const activeChips: { key: string; label: string; onRemove: () => void }[] = []

  if (searchParams.get("search")) {
    activeChips.push({
      key: "search",
      label: `Search: "${searchParams.get("search")}"`,
      onRemove: () => {
        setLocalSearch("")
        lastPushedSearch.current = ""
        updateParam("search", null)
      },
    })
  }

  if (statusFilter !== "all") {
    activeChips.push({
      key: "status",
      label: `Status: ${statusFilter}`,
      onRemove: () => updateParam("status", null),
    })
  }

  if (paymentFilter !== "all") {
    activeChips.push({
      key: "payment",
      label: `Payment: ${paymentFilter}`,
      onRemove: () => updateParam("payment", null),
    })
  }

  if (paymentMethodFilter !== "all") {
    activeChips.push({
      key: "paymentMethod",
      label: `Method: ${paymentMethodFilter.toUpperCase()}`,
      onRemove: () => updateParam("paymentMethod", null),
    })
  }

  if (startDate || endDate) {
    activeChips.push({
      key: "date",
      label: `Date: ${startDate || "Any"} to ${endDate || "Any"}`,
      onRemove: () => {
        setLocalStartDate("")
        setLocalEndDate("")
        const params = new URLSearchParams(searchParams.toString())
        params.delete("startDate")
        params.delete("endDate")
        params.delete("page")
        router.push(`?${params.toString()}`, { scroll: false })
      },
    })
  }

  if (minAmount || maxAmount) {
    activeChips.push({
      key: "amount",
      label: `Amount: ₹${minAmount || "0"} - ₹${maxAmount || "Max"}`,
      onRemove: () => {
        setLocalMinAmount("")
        setLocalMaxAmount("")
        const params = new URLSearchParams(searchParams.toString())
        params.delete("minAmount")
        params.delete("maxAmount")
        params.delete("page")
        router.push(`?${params.toString()}`, { scroll: false })
      },
    })
  }

  if (sortBy && sortBy !== "newest") {
    const sortLabels: Record<string, string> = {
      oldest: "Oldest First",
      amount_high: "Amount: High to Low",
      amount_low: "Amount: Low to High",
    }
    activeChips.push({
      key: "sortBy",
      label: `Sort: ${sortLabels[sortBy] || sortBy}`,
      onRemove: () => updateParam("sortBy", null),
    })
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Main Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID, Name, Email, Phone, City, Product..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 h-10"
            />
            {localSearch && (
              <button
                onClick={() => {
                  setLocalSearch("")
                  lastPushedSearch.current = ""
                  updateParam("search", null)
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Order Status Select */}
          <div>
            <Select value={statusFilter} onValueChange={(val) => updateParam("status", val)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Ordered">Ordered</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Select */}
          <div>
            <Select value={paymentFilter} onValueChange={(val) => updateParam("payment", val)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid (Received)</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle More Filters */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex-1 h-10 justify-between ${showAdvanced ? "bg-muted font-medium border-primary/50" : ""}`}
            >
              <span className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </span>
              {activeAdvancedCount > 0 && (
                <Badge variant="default" className="ml-2 h-5 px-1.5 text-[10px]">
                  {activeAdvancedCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvanced && (
          <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Payment Method */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Payment Method
                </label>
                <Select
                  value={paymentMethodFilter}
                  onValueChange={(val) => updateParam("paymentMethod", val)}
                >
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Methods</SelectItem>
                    <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                    <SelectItem value="online">Online Payment (UPI/Cards)</SelectItem>
                    <SelectItem value="upi">UPI Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Sort Orders
                </label>
                <Select value={sortBy} onValueChange={(val) => updateParam("sortBy", val)}>
                  <SelectTrigger className="h-9 bg-background">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="amount_high">Total: High to Low</SelectItem>
                    <SelectItem value="amount_low">Total: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Amount Range */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Total Amount (₹)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min ₹"
                    value={localMinAmount}
                    onChange={(e) => setLocalMinAmount(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyAdvancedFilters()}
                    className="h-9 bg-background text-xs"
                  />
                  <span className="text-muted-foreground text-xs">-</span>
                  <Input
                    type="number"
                    placeholder="Max ₹"
                    value={localMaxAmount}
                    onChange={(e) => setLocalMaxAmount(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyAdvancedFilters()}
                    className="h-9 bg-background text-xs"
                  />
                </div>
              </div>

              {/* Custom Date Range */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    className="h-9 bg-background text-xs"
                  />
                  <span className="text-muted-foreground text-xs">to</span>
                  <Input
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    className="h-9 bg-background text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Quick Date Presets & Apply Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Quick Dates:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("today")}
                  className="h-7 text-xs bg-background"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("last7")}
                  className="h-7 text-xs bg-background"
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("last30")}
                  className="h-7 text-xs bg-background"
                >
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDatePreset("thisMonth")}
                  className="h-7 text-xs bg-background"
                >
                  This Month
                </Button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  size="sm"
                  onClick={applyAdvancedFilters}
                  className="h-8 text-xs px-3"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Chips Bar */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="gap-1.5 py-1 px-2.5 text-xs font-normal border border-border/80"
              >
                <span>{chip.label}</span>
                <button
                  onClick={chip.onRemove}
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
