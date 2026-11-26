"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Badge } from "@/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Check,
  Loader2,
  ArrowUpDown,
} from "lucide-react"
import { useGetAllOrdersQuery, useLazyGetAllOrdersQuery } from "@/redux/api/adminApi"
import { resolveOrderPaymentStatus } from "@/lib/order-utils"
import { exportOrdersToCSV } from "@/utils/csvHelper"
import toast from "react-hot-toast"

export default function TransactionsTable() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentPage = Number(searchParams.get("page")) || 1
  const statusFilter = searchParams.get("status") || "all"
  const paymentFilter = searchParams.get("payment") || "all"
  const paymentMethodFilter = searchParams.get("paymentMethod") || "all"
  const startDate = searchParams.get("startDate") || ""
  const endDate = searchParams.get("endDate") || ""
  const minAmount = searchParams.get("minAmount") || ""
  const maxAmount = searchParams.get("maxAmount") || ""
  const sortBy = searchParams.get("sortBy") || "newest"
  const urlSearch = searchParams.get("search") || ""
  const urlShowFilters = searchParams.get("showFilters") === "1"

  const [searchTerm, setSearchTerm] = useState(urlSearch)
  const lastPushedSearch = useRef(urlSearch)

  const [showAdvanced, setShowAdvanced] = useState(
    urlShowFilters || Boolean(paymentFilter !== "all" || paymentMethodFilter !== "all" || startDate || endDate || minAmount || maxAmount || (sortBy && sortBy !== "newest"))
  )

  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)
  const [localMinAmount, setLocalMinAmount] = useState(minAmount)
  const [localMaxAmount, setLocalMaxAmount] = useState(maxAmount)

  const itemsPerPage = 10

  // Sync local inputs when URL changes externally (e.g. from SalesHeader)
  useEffect(() => {
    setLocalStartDate(startDate)
    setLocalEndDate(endDate)
    setLocalMinAmount(minAmount)
    setLocalMaxAmount(maxAmount)
    setSearchTerm(urlSearch)
    lastPushedSearch.current = urlSearch
    if (urlShowFilters) setShowAdvanced(true)
  }, [startDate, endDate, minAmount, maxAmount, urlSearch, urlShowFilters])

  // Debounced search push to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== lastPushedSearch.current) {
        lastPushedSearch.current = searchTerm
        const params = new URLSearchParams(searchParams.toString())
        if (searchTerm.trim()) params.set("search", searchTerm.trim())
        else params.delete("search")
        params.delete("page")
        router.push(`?${params.toString()}`, { scroll: false })
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm, router, searchParams])

  const { data, isLoading, isFetching } = useGetAllOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter === "all" ? undefined : statusFilter,
    payment: paymentFilter === "all" ? undefined : paymentFilter,
    paymentMethod: paymentMethodFilter === "all" ? undefined : paymentMethodFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    minAmount: minAmount || undefined,
    maxAmount: maxAmount || undefined,
    sortBy: sortBy || undefined,
    search: urlSearch || undefined,
  })

  const [triggerExport, { isFetching: isExporting }] = useLazyGetAllOrdersQuery()

  const updateParam = (key: string, val: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== "all") params.set(key, val)
    else params.delete(key)
    if (key !== "page") params.delete("page")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const applyAdvancedFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("period")
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

  const clearAllFilters = () => {
    setSearchTerm("")
    lastPushedSearch.current = ""
    setLocalStartDate("")
    setLocalEndDate("")
    setLocalMinAmount("")
    setLocalMaxAmount("")
    router.push("?", { scroll: false })
  }

  const handleExportCSV = async () => {
    try {
      const res = await triggerExport({
        page: 1,
        limit: 10000,
        status: statusFilter === "all" ? undefined : statusFilter,
        payment: paymentFilter === "all" ? undefined : paymentFilter,
        paymentMethod: paymentMethodFilter === "all" ? undefined : paymentMethodFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
        sortBy: sortBy || undefined,
        search: urlSearch || undefined,
      }).unwrap()

      const ordersToExport = res?.orders || []
      if (ordersToExport.length === 0) {
        toast.error("No transactions found to export")
        return
      }
      exportOrdersToCSV(
        ordersToExport,
        `transactions_${new Date().toISOString().slice(0, 10)}.csv`
      )
      toast.success(`Exported ${ordersToExport.length} transaction(s)!`)
    } catch (err: any) {
      toast.error(err?.data?.message || "Export failed")
    }
  }

  const getStatusBadge = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>
      case "processing":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Processing</Badge>
      case "shipped":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shipped</Badge>
      case "ordered":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ordered</Badge>
      case "cancelled":
      case "canceled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      case "returned":
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Returned</Badge>
      default:
        return <Badge variant="secondary">{status || "Ordered"}</Badge>
    }
  }

  // Build active filter chips
  const activeChips: { key: string; label: string; onRemove: () => void }[] = []
  if (urlSearch) {
    activeChips.push({
      key: "search",
      label: `Search: "${urlSearch}"`,
      onRemove: () => {
        setSearchTerm("")
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
        params.delete("period")
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
    activeChips.push({
      key: "sortBy",
      label: `Sort: ${sortBy}`,
      onRemove: () => updateParam("sortBy", null),
    })
  }

  const transactions = data?.orders
    ? data.orders.map((order: any) => {
        const resolvedPayment = resolveOrderPaymentStatus(order)
        return {
          id: order._id,
          displayId: order._id.substring(order._id.length - 8).toUpperCase(),
          date: new Date(order.createdAt).toLocaleDateString("en-IN"),
          customer: order.user?.name || order.shippingInfo?.fullName || "Guest",
          email: order.user?.email || "N/A",
          product:
            order.orderItems?.length > 0
              ? `${order.orderItems[0].name}${
                  order.orderItems.length > 1 ? ` +${order.orderItems.length - 1} more` : ""
                }`
              : "No Items",
          amount: Number(order.totalPrice || 0),
          status: order.orderStatus || "Ordered",
          paymentMethod: resolvedPayment.method,
          paymentBadgeText: resolvedPayment.badgeText,
          paymentBadgeClass: resolvedPayment.tailwindBadgeClass,
        }
      })
    : []

  const totalOrders = data?.totalOrders || 0
  const totalPages = data?.totalPages || 1

  return (
    <Card id="transaction-history">
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Transaction History ({totalOrders})
              {isFetching && !isLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Detailed list of all sales transactions</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showAdvanced ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export CSV
            </Button>
          </div>
        </div>

        {/* Main Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, customer, email, product, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  lastPushedSearch.current = ""
                  updateParam("search", null)
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Select value={statusFilter} onValueChange={(val) => updateParam("status", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Order Status</SelectItem>
              <SelectItem value="Ordered">Ordered</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={(val) => updateParam("payment", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvanced && (
          <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
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
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                    <SelectItem value="online">Online (UPI/Cards)</SelectItem>
                    <SelectItem value="upi">UPI Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={(val) => updateParam("sortBy", val)}>
                  <SelectTrigger className="h-9 bg-background">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="amount_high">Amount: High to Low</SelectItem>
                    <SelectItem value="amount_low">Amount: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                  Amount Range (₹)
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
                  <span className="text-xs text-muted-foreground">-</span>
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

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    className="h-9 bg-background text-xs"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    className="h-9 bg-background text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-xs">
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset All
              </Button>
              <Button size="sm" onClick={applyAdvancedFilters} className="h-8 text-xs">
                <Check className="w-3.5 h-3.5 mr-1" /> Apply Range
              </Button>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
            {activeChips.map((chip) => (
              <Badge key={chip.key} variant="secondary" className="gap-1.5 text-xs font-normal">
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 text-xs px-2">
              Clear all
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction: any) => (
                  <tr key={transaction.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-primary">#{transaction.displayId}</span>
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">{transaction.date}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-sm">{transaction.customer}</div>
                        <div className="text-xs text-muted-foreground">{transaction.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{transaction.product}</td>
                    <td className="py-3 px-4 font-semibold whitespace-nowrap">
                      ₹{transaction.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(transaction.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-xs text-muted-foreground">{transaction.paymentMethod}</span>
                        <Badge className={`${transaction.paymentBadgeClass} text-[10px]`}>
                          {transaction.paymentBadgeText}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      No transactions match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {transactions.length} of {totalOrders} results (Page {currentPage} of {totalPages || 1})
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateParam("page", String(currentPage - 1))}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => updateParam("page", String(currentPage + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
