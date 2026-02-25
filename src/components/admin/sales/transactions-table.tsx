"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Badge } from "@/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { Search, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { useGetAllOrdersQuery } from "@/redux/api/adminApi"

export default function TransactionsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  const { data, isLoading } = useGetAllOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "processing":
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "refunded":
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const transactions = data?.orders ? data.orders.map((order: any) => ({
    id: order._id,
    displayId: order._id.substring(order._id.length - 8).toUpperCase(),
    date: new Date(order.createdAt).toISOString().split('T')[0],
    customer: order.user?.name || order.shippingInfo?.fullName || "Guest",
    email: order.user?.email || "N/A",
    product: order.orderItems?.length > 0
      ? `${order.orderItems[0].name}${order.orderItems.length > 1 ? ` +${order.orderItems.length - 1} more` : ''}`
      : "No Items",
    amount: order.totalPrice,
    status: order.orderStatus,
    paymentMethod: order.paymentInfo?.method || "Online",
  })) : [];

  const totalPages = data?.totalPages || 1;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
            <p className="text-sm text-muted-foreground">Detailed list of all sales transactions</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transaction ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: any) => (
                <tr key={transaction.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-primary">#{transaction.displayId}</span>
                  </td>
                  <td className="py-3 px-4 text-sm">{transaction.date}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-sm">{transaction.customer}</div>
                      <div className="text-xs text-muted-foreground">{transaction.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{transaction.product}</td>
                  <td className="py-3 px-4 font-semibold">{transaction.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">{getStatusBadge(transaction.status)}</td>
                  <td className="py-3 px-4 text-sm">{transaction.paymentMethod}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {transactions.length} results (Page {currentPage} of {totalPages})
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(c => c - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => setCurrentPage(c => c + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

