"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Separator } from "@/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { MapPin, CreditCard, Package, Truck, CheckCircle, Clock, RefreshCw, Mail } from "lucide-react"
import { useRefundOrderMutation, useUpdateOrderMutation, useSendOrderEmailMutation } from "@/redux/api/adminApi"
import toast from "react-hot-toast"
import { createRoot } from "react-dom/client"
import InvoiceTemplate from "./invoice-template"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { useState } from "react"
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

interface OrderDetailModalProps {
  order: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OrderDetailModal({ order, open, onOpenChange }: OrderDetailModalProps) {
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [sendOrderEmail, { isLoading: isSendingEmail }] = useSendOrderEmailMutation();

  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  if (!order) return null

  const handleRefund = async () => {
    setShowRefundConfirm(false);

    try {
      await refundOrder({
        paymentId: order.paymentInfo?.id || order.paymentInfo?._id,
        reason: "Admin initiated refund"
      }).unwrap();
      toast.success("Refund processed successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Refund failed");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await updateOrder({ id: order._id, orderStatus: status }).unwrap();
      toast.success(res?.message || "Order status updated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleSendEmail = async () => {
    try {
      const res = await sendOrderEmail(order._id).unwrap();
      toast.success(res?.message || "Email sent successfully");
      setShowEmailConfirm(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send email");
    }
  };

  const handlePrintLabel = () => {
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-600" />
      case "placed":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "processing":
        return <Package className="w-5 h-5 text-orange-600" />
      case "refunded":
        return <RefreshCw className="w-5 h-5 text-gray-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const orderTimeline = [
    { status: "Order Placed", date: new Date(order.createdAt).toLocaleString(), completed: true },
    { status: "Processing", date: order.orderStatus === "processing" || order.orderStatus === "shipped" || order.orderStatus === "delivered" ? "Completed" : "Pending", completed: order.orderStatus !== "placed" },
    { status: "Shipped", date: order.orderStatus === "shipped" || order.orderStatus === "delivered" ? "Completed" : "Pending", completed: order.orderStatus === "shipped" || order.orderStatus === "delivered" },
    { status: "Delivered", date: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : "Pending", completed: order.orderStatus === "delivered" },
  ]

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              Order Details - <span className="font-mono text-primary">#{order._id}</span>
              {getStatusIcon(order.orderStatus)}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">

            {/* Order Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer & Shipping */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Customer & Shipping
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Customer Information</h4>
                    <p className="text-sm text-muted-foreground">{order.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium">Shipping Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingInfo?.address}, {order.shippingInfo?.city}, {order.shippingInfo?.state}, {order.shippingInfo?.country} - {order.shippingInfo?.pinCode}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.orderItems?.map((product: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {product.quantity}</p>
                        </div>
                        <p className="font-semibold">₹{product.price}</p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{order.totalPrice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Payment Status</span>
                    <Badge
                      className={
                        order.paymentInfo?.status?.toLowerCase() === "succeeded" || order.paymentInfo?.status?.toLowerCase() === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {order.paymentInfo?.status || "pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment Method</span>
                    <span className="text-sm">{order.paymentInfo?.method || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transaction ID</span>
                    <span className="text-sm font-mono">{order.paymentInfo?.id || order.paymentInfo?.razorpay_payment_id || "N/A"}</span>
                  </div>

                  {(order.paymentInfo?.status?.toLowerCase() === "succeeded" || order.paymentInfo?.status?.toLowerCase() === "success")
                    && order.orderStatus?.toLowerCase() !== "refunded"
                    && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setShowRefundConfirm(true)}
                        disabled={isRefunding}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefunding ? 'animate-spin' : ''}`} />
                        {isRefunding ? "Processing Refund..." : "Process Refund"}
                      </Button>
                    )}
                  {order.orderStatus?.toLowerCase() === "refunded" && (
                    <div className="p-2 bg-gray-100 rounded text-center text-sm text-gray-600">
                      Payment Refunded
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Timeline & Actions */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderTimeline.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${item.completed ? "bg-primary" : "bg-muted"}`} />
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${item.completed ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {item.status}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                    ))}
                    {order.orderStatus?.toLowerCase() === "refunded" && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2 bg-red-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Refunded</p>
                          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select
                    defaultValue={order.orderStatus}
                    onValueChange={handleUpdateStatus}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placed">Placed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handlePrintLabel}
                >
                  Print Shipping Label
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => setShowEmailConfirm(true)}
                  disabled={isSendingEmail}
                >
                  {isSendingEmail ? "Sending..." : "Send Email Notification"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showEmailConfirm} onOpenChange={setShowEmailConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Order Confirmation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send an email to <strong>{order.user?.email}</strong> containing the order details and invoice.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendEmail} disabled={isSendingEmail}>
              {isSendingEmail ? "Sending..." : "Send Email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showRefundConfirm} onOpenChange={setShowRefundConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to refund this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The amount will be credited back to the customer's original payment method.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Refund Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

