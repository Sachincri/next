"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { Calendar, Download, Filter, Loader2 } from "lucide-react"
import { useLazyGetAllOrdersQuery } from "@/redux/api/adminApi"
import { exportOrdersToCSV } from "@/utils/csvHelper"
import toast from "react-hot-toast"

const timePeriods = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "mtd", label: "Month to Date" },
  { value: "qtd", label: "Quarter to Date" },
  { value: "ytd", label: "Year to Date" },
]

function computeDateRange(period: string): { startDate?: string; endDate?: string } {
  const now = new Date()
  const fmt = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const todayStr = fmt(now)

  if (period === "all") return {}
  if (period === "today") return { startDate: todayStr, endDate: todayStr }
  if (period === "yesterday") {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    const yStr = fmt(y)
    return { startDate: yStr, endDate: yStr }
  }
  if (period === "last7days") {
    const s = new Date(now)
    s.setDate(s.getDate() - 7)
    return { startDate: fmt(s), endDate: todayStr }
  }
  if (period === "last30days") {
    const s = new Date(now)
    s.setDate(s.getDate() - 30)
    return { startDate: fmt(s), endDate: todayStr }
  }
  if (period === "mtd") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1)
    return { startDate: fmt(s), endDate: todayStr }
  }
  if (period === "qtd") {
    const qMonth = Math.floor(now.getMonth() / 3) * 3
    const s = new Date(now.getFullYear(), qMonth, 1)
    return { startDate: fmt(s), endDate: todayStr }
  }
  if (period === "ytd") {
    const s = new Date(now.getFullYear(), 0, 1)
    return { startDate: fmt(s), endDate: todayStr }
  }
  return {}
}

export default function SalesHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [triggerExport, { isFetching }] = useLazyGetAllOrdersQuery()

  const selectedPeriod = searchParams.get("period") || "all"

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (period === "all") {
      params.delete("period")
      params.delete("startDate")
      params.delete("endDate")
    } else {
      const range = computeDateRange(period)
      params.set("period", period)
      if (range.startDate) params.set("startDate", range.startDate)
      if (range.endDate) params.set("endDate", range.endDate)
    }
    params.delete("page")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleToggleFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get("showFilters") === "1"
    if (current) params.delete("showFilters")
    else params.set("showFilters", "1")
    router.push(`?${params.toString()}`, { scroll: false })

    const el = document.getElementById("transaction-history")
    if (el && !current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleExport = async () => {
    try {
      const status = searchParams.get("status")
      const payment = searchParams.get("payment")
      const paymentMethod = searchParams.get("paymentMethod")

      const res = await triggerExport({
        page: 1,
        limit: 10000,
        status: status && status !== "all" ? status : undefined,
        payment: payment && payment !== "all" ? payment : undefined,
        paymentMethod: paymentMethod && paymentMethod !== "all" ? paymentMethod : undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        minAmount: searchParams.get("minAmount") || undefined,
        maxAmount: searchParams.get("maxAmount") || undefined,
        sortBy: searchParams.get("sortBy") || undefined,
        search: searchParams.get("search") || undefined,
      }).unwrap()

      const orders = res?.orders || []
      if (orders.length === 0) {
        toast.error("No transactions matching current filters to export")
        return
      }
      exportOrdersToCSV(orders, `sales_transactions_${new Date().toISOString().slice(0, 10)}.csv`)
      toast.success(`Exported ${orders.length} transaction(s)!`)
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to export transactions")
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Sales &amp; Revenue</h1>
        <p className="text-muted-foreground">Comprehensive sales analytics and revenue insights</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-full sm:w-48">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timePeriods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={handleToggleFilters}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={handleExport}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isFetching ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>
    </div>
  )
}
