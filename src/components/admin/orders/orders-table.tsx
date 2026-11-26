"use client"


import { useState } from "react"
import { createRoot } from "react-dom/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { Checkbox } from "@/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu"
import { Eye, Edit, MoreHorizontal, ChevronLeft, ChevronRight, Package, Truck, Coins, Printer, Mail, Trash2, Download, X } from "lucide-react"
import OrderDetailModal from "./order-detail-modal"
import { useGetAllOrdersQuery, useUpdateOrderMutation, useDeleteOrderMutation, useSendOrderEmailMutation, useGetAppSettingsQuery, useBulkOrderActionMutation } from "@/redux/api/adminApi"
import { exportOrdersToCSV } from "@/utils/csvHelper"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog"
import toast from "react-hot-toast"
import InvoiceTemplate, { printInvoice } from "./invoice-template"
import { resolveOrderPaymentStatus } from "@/lib/order-utils"

export default function OrdersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const statusFilter = searchParams.get("status") || "all";
  const paymentFilter = searchParams.get("payment") || "all";
  const paymentMethodFilter = searchParams.get("paymentMethod") || "all";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const minAmount = searchParams.get("minAmount") || "";
  const maxAmount = searchParams.get("maxAmount") || "";
  const sortBy = searchParams.get("sortBy") || "newest";
  const debouncedSearch = searchParams.get("search") || "";
  const itemsPerPage = 10;

  const { data: serverOrdersData, isLoading, error } = useGetAllOrdersQuery({
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
    search: debouncedSearch || undefined,
  });
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [bulkOrderAction, { isLoading: isBulkLoading }] = useBulkOrderActionMutation();
  const [sendOrderEmail, { isLoading: isSendingEmail }] = useSendOrderEmailMutation();
  const { data: storeSettings } = useGetAppSettingsQuery();

  const orders = serverOrdersData?.orders || [];
  const totalOrders = serverOrdersData?.totalOrders || 0;
  const totalPages = serverOrdersData?.totalPages || 0;

  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders; // Server already paginated it

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ordered: { color: "bg-amber-100 text-amber-800", label: "Ordered" },
      placed: { color: "bg-blue-100 text-blue-800", label: "Placed" },
      new: { color: "bg-blue-100 text-blue-800", label: "New" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      processing: { color: "bg-orange-100 text-orange-800", label: "Processing" },
      shipped: { color: "bg-purple-100 text-purple-800", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      canceled: { color: "bg-red-100 text-red-800", label: "Canceled" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Canceled" },
      refunded: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
      returned: { color: "bg-gray-100 text-gray-800", label: "Returned" },
    }

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={`${config.color} hover:${config.color}`}>{config.label}</Badge>
  }

  const renderPaymentColumn = (order: any) => {
    const payment = resolveOrderPaymentStatus(order);
    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="text-xs font-medium text-muted-foreground">{payment.method}</span>
        <Badge className={`${payment.tailwindBadgeClass} hover:${payment.tailwindBadgeClass}`}>
          {payment.badgeText}
        </Badge>
      </div>
    );
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const handleSelectAll = () => {
    setSelectedOrders(selectedOrders.length === paginatedOrders.length ? [] : paginatedOrders.map((order: any) => order._id))
  }

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await updateOrder({ id: orderId, orderStatus: status }).unwrap();
      toast.success(res?.message || "Order status updated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const handlePrintLabel = (order: any) => {
    printInvoice(order, storeSettings);
  };

  const handleBulkPrint = () => {
    if (selectedOrders.length === 0) {
      toast.error("Select orders to print");
      return;
    }

    const ordersToPrint = orders.filter((o: any) => selectedOrders.includes(o._id));
    if (ordersToPrint.length > 0) {
      printInvoice(ordersToPrint, storeSettings);
      toast.success(`Printing ${ordersToPrint.length} invoice(s)...`);
    }
  };

  const handleSendEmail = async (orderId: string) => {
    try {
      const res = await sendOrderEmail(orderId).unwrap();
      toast.success(res?.message || "Email sent successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send email");
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedOrders.length === 0) return;
    try {
      const res = await bulkOrderAction({ orderIds: selectedOrders, action: "status", status }).unwrap();
      toast.success(res?.message || `Updated ${selectedOrders.length} order(s)`);
      setSelectedOrders([]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update orders");
    }
  };

  const handleExecuteBulkDelete = async () => {
    try {
      const res = await bulkOrderAction({ orderIds: selectedOrders, action: "delete" }).unwrap();
      toast.success(res?.message || `Deleted ${selectedOrders.length} order(s)`);
      setSelectedOrders([]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete orders");
    } finally {
      setDeleteAlertOpen(false);
    }
  };

  const handleExportCurrentView = () => {
    if (!orders || orders.length === 0) {
      toast.error("No orders to export in current view");
      return;
    }
    exportOrdersToCSV(orders, `orders_view_page_${currentPage}.csv`);
    toast.success(`Exported ${orders.length} order(s) from current view`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold">Orders ({totalOrders})</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleExportCurrentView}
                title="Export current page orders to CSV"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export View
              </Button>
            </div>

            {selectedOrders.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 bg-muted/60 p-1.5 rounded-lg border border-border">
                <span className="text-xs font-medium text-foreground px-2">
                  {selectedOrders.length} selected
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs" disabled={isBulkLoading}>
                      <Package className="w-3.5 h-3.5 mr-1.5" />
                      Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("Processing")}>
                      Mark as Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("Shipped")}>
                      Mark as Shipped
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("Delivered")}>
                      Mark as Delivered
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate("Cancelled")}>
                      Mark as Cancelled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleBulkPrint}>
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => setDeleteAlertOpen(true)}
                  disabled={isBulkLoading}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs px-2 text-muted-foreground"
                  onClick={() => setSelectedOrders([])}
                  title="Clear selection"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">Loading orders...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">
                      <Checkbox checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0} onCheckedChange={handleSelectAll} />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order: any) => (
                    <tr key={order._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedOrders.includes(order._id)}
                          onCheckedChange={() => handleSelectOrder(order._id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={order.orderItems?.[0]?.image || "/placeholder.svg"}
                            alt="product"
                            className="w-10 h-10 rounded object-contain bg-muted"
                          />
                          <div className="text-xs text-muted-foreground">
                            {order.orderItems?.length > 1
                              ? `${order.orderItems[0]?.name?.substring(0, 15)}... +${order.orderItems.length - 1} more`
                              : order.orderItems[0]?.name?.substring(0, 20)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          #{order._id.substring(order._id.length - 8)}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-sm">{order.user?.name}</div>
                          <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                          {Boolean(order.referralCode || order.referredBy) && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                                🔗 Ref: {order.referredBy?.name || order.referralCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">₹{order.totalPrice}</td>
                      <td className="py-3 px-4">
                        {renderPaymentColumn(order)}
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          defaultValue={order.orderStatus}
                          onValueChange={(val) => handleUpdateStatus(order._id, val)}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ordered">Ordered</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            <SelectItem value="Returned">Returned</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.error("Not implemented yet")}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintLabel(order)}>
                              <Printer className="w-4 h-4 mr-2" />
                              Print Tax Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(order._id)}>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {paginatedOrders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-muted-foreground">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {totalOrders === 0 ? 0 : startIndex + 1} to {startIndex + orders.length} of {totalOrders} orders
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && <span className="mx-1">...</span>}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <OrderDetailModal order={selectedOrder} open={showOrderDetail} onOpenChange={setShowOrderDetail} />

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Orders</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedOrders.length} selected order(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecuteBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
