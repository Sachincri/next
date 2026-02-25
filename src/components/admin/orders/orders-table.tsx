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
import { Eye, Edit, MoreHorizontal, ChevronLeft, ChevronRight, Package, Truck, Coins, Printer, Mail } from "lucide-react"
import OrderDetailModal from "./order-detail-modal"
import { useGetAllOrdersQuery, useUpdateOrderMutation, useDeleteOrderMutation, useSendOrderEmailMutation } from "@/redux/api/adminApi"
import toast from "react-hot-toast"
import InvoiceTemplate from "./invoice-template"

export default function OrdersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const statusFilter = searchParams.get("status") || "all";
  const debouncedSearch = searchParams.get("search") || "";
  const itemsPerPage = 10;

  const { data: serverOrdersData, isLoading, error } = useGetAllOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearch
  });
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [sendOrderEmail, { isLoading: isSendingEmail }] = useSendOrderEmailMutation();

  const orders = serverOrdersData?.orders || [];
  const totalOrders = serverOrdersData?.totalOrders || 0;
  const totalPages = serverOrdersData?.totalPages || 0;

  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders; // Server already paginated it

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      placed: { color: "bg-blue-100 text-blue-800", label: "Placed" },
      new: { color: "bg-blue-100 text-blue-800", label: "New" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      processing: { color: "bg-orange-100 text-orange-800", label: "Processing" },
      shipped: { color: "bg-purple-100 text-purple-800", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      canceled: { color: "bg-red-100 text-red-800", label: "Canceled" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Canceled" },
      refunded: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
    }

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={`${config.color} hover:${config.color}`}>{config.label}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const statusConfig = {
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      success: { color: "bg-green-100 text-green-800", label: "Paid" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
      refunded: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
    }

    const config = statusConfig[status?.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={`${config.color} hover:${config.color}`}>{config.label}</Badge>
  }

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
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Invoice</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            <div id="print-root"></div>
          </body>
        </html>
      `);
      printWindow.document.close();

      setTimeout(() => {
        const rootEl = printWindow.document.getElementById('print-root');
        if (rootEl) {
          const root = createRoot(rootEl);
          root.render(<InvoiceTemplate order={order} />);

          let checkCount = 0;
          const checkTailwind = setInterval(() => {
            const hasStyle = printWindow.document.querySelector('style');
            if (hasStyle || checkCount > 30) {
              clearInterval(checkTailwind);
              setTimeout(() => {
                printWindow.print();
              }, 500);
            }
            checkCount++;
          }, 100);
        }
      }, 50);
    } else {
      toast.error("Popup blocked. Please allow popups for this site.");
    }
  };

  const handleBulkPrint = () => {
    if (selectedOrders.length === 0) {
      toast.error("Select orders to print");
      return;
    }

    // For bulk types, we could iterate or show a combined view. For now, let's print the first selected or all in sequence.
    // Printing multiple windows might be blocked. A better approach for bulk is a single page with page breaks.

    // Let's implement a bulk view logic later if requested, or just print the last selected for now as a demo, 
    // or loop through effectively.
    // A better approach for bulk is to pass an array of orders to InvoiceTemplate or wrapped component.

    // For simplicity in this iteration, I'll just toast functionality or print the first selected.
    const orderToPrint = orders.find((o: any) => o._id === selectedOrders[0]);
    if (orderToPrint) {
      handlePrintLabel(orderToPrint);
      if (selectedOrders.length > 1) {
        toast("Printed first selected order. Bulk print logic to be enhanced.", { icon: 'ℹ️' });
      }
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Orders ({totalOrders})</CardTitle>

            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedOrders.length} selected</span>
                <Button variant="outline" size="sm">
                  <Package className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkPrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Labels
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
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">₹{order.totalPrice}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium uppercase text-muted-foreground">{order.paymentInfo?.method || "Online"}</span>
                          {getPaymentBadge(order.paymentInfo?.status)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          defaultValue={order.orderStatus?.toLowerCase()}
                          onValueChange={(val) => handleUpdateStatus(order._id, val)}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placed">Placed</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="canceled">Canceled</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
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
                              Print Label
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
    </>
  )
}
