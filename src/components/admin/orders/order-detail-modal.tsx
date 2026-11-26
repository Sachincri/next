"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Separator } from "@/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { MapPin, CreditCard, Package, Truck, CheckCircle, Clock, RefreshCw, Mail, Share2, Printer, FileText } from "lucide-react"
import { useRefundOrderMutation, useUpdateOrderMutation, useSendOrderEmailMutation, useGetAppSettingsQuery } from "@/redux/api/adminApi"
import toast from "react-hot-toast"
import { createRoot } from "react-dom/client"
import InvoiceTemplate, { printInvoice } from "./invoice-template"
import { resolveOrderPaymentStatus } from "@/lib/order-utils"
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
  const { data: storeSettings } = useGetAppSettingsQuery();

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
    printInvoice(order, storeSettings);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-600" />
      case "ordered":
        return <Clock className="w-5 h-5 text-amber-600" />
      case "processing":
        return <Package className="w-5 h-5 text-orange-600" />
      case "refunded":
        return <RefreshCw className="w-5 h-5 text-gray-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const normStatus = (order.orderStatus || "").toLowerCase();
  const isCancelled = normStatus === "cancelled" || normStatus === "canceled";
  const isRefunded = normStatus === "refunded" || normStatus === "returned";

  const isProcessingReached = ["processing", "shipped", "delivered"].includes(normStatus);
  const isShippedReached = ["shipped", "delivered"].includes(normStatus);
  const isDeliveredReached = normStatus === "delivered";

  const orderTimeline = [
    {
      status: "Order Placed",
      date: order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A",
      completed: true,
    },
    {
      status: "Processing",
      date: order.processingAt
        ? new Date(order.processingAt).toLocaleString()
        : isProcessingReached
        ? (normStatus === "processing" ? "In Progress" : "Completed")
        : "Pending",
      completed: isProcessingReached,
    },
    {
      status: "Shipped",
      date: order.shippedAt
        ? new Date(order.shippedAt).toLocaleString()
        : isShippedReached
        ? (normStatus === "shipped" ? "In Transit" : "Completed")
        : "Pending",
      completed: isShippedReached,
    },
    {
      status: "Delivered",
      date: order.deliveredAt
        ? new Date(order.deliveredAt).toLocaleString()
        : isDeliveredReached
        ? "Delivered"
        : "Pending",
      completed: isDeliveredReached,
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] w-[95vw] lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1550px] h-[92vh] max-h-[94vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              Order Details - <span className="font-mono text-primary">#{order._id}</span>
              {getStatusIcon(order.orderStatus)}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    Order Items ({order.orderItems?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.orderItems?.map((product: any, index: number) => {
                      const itemPrice = Number(product.sellingPrice ?? product.price ?? 0);
                      const itemQty = Number(product.quantity || 1);
                      const itemTotal = itemPrice * itemQty;
                      return (
                        <div key={index} className="flex items-center justify-between py-2.5 gap-3 border-b border-border/50 last:border-0">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-contain bg-muted border shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>Quantity: {itemQty}</span>
                              {product.size && <span>• Size: {product.size}</span>}
                              {product.color && <span>• Color: {product.color}</span>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-sm">₹{itemTotal.toLocaleString()}</p>
                            {itemQty > 1 && (
                              <p className="text-[11px] text-muted-foreground">₹{itemPrice.toLocaleString()} each</p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-3 space-y-2 text-sm border-t">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Items Subtotal</span>
                        <span>₹{Number(order.itemsPrice ?? order.orderItems?.reduce((acc: number, item: any) => acc + (Number(item.sellingPrice ?? item.price ?? 0) * Number(item.quantity || 1)), 0) ?? 0).toLocaleString()}</span>
                      </div>
                      {Boolean(order.shippingPrice) && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Shipping Charges</span>
                          <span>₹{Number(order.shippingPrice).toLocaleString()}</span>
                        </div>
                      )}
                      {Boolean(order.coupon?.discount || order.couponDiscount) && (
                        <div className="flex items-center justify-between text-emerald-600 font-medium">
                          <span>Coupon Discount {order.coupon?.code ? `(${order.coupon.code})` : ''}</span>
                          <span>-₹{Number(order.coupon?.discount || order.couponDiscount).toLocaleString()}</span>
                        </div>
                      )}
                      {Boolean(order.redeemCoins) && (
                        <div className="flex items-center justify-between text-amber-600 font-medium">
                          <span>Coins Redeemed</span>
                          <span>-₹{Number(order.redeemCoins).toLocaleString()}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between font-bold text-base pt-1">
                        <span>Total Price</span>
                        <span className="text-primary text-lg">₹{Number(order.totalPrice ?? order.totalAmount ?? 0).toLocaleString()}</span>
                      </div>
                      {Boolean(order.gstAmount || order.taxableAmount) && (
                        <div className="text-[11px] text-muted-foreground flex justify-between pt-0.5">
                          <span>Inclusive of GST ({order.gstRate || 18}%)</span>
                          <span>₹{Number(order.gstAmount).toFixed(2)}</span>
                        </div>
                      )}
                      {Boolean(order.isPartialCod || order.paymentInfo?.method === "Partial COD") && (
                        <div className="pt-2 border-t border-dashed space-y-1">
                          <div className="flex items-center justify-between text-emerald-600 font-medium text-sm">
                            <span>Advance Paid (Online)</span>
                            <span>₹{Number(order.advancePayment ?? order.paymentInfo?.advanceAmount ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-indigo-600 font-bold text-sm">
                            <span>Balance Due on Delivery</span>
                            <span>₹{Number(order.remainingBalance ?? order.paymentInfo?.dueAmount ?? 0).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
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
                  {(() => {
                    const payment = resolveOrderPaymentStatus(order);
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span>Payment Status</span>
                          <Badge className={`${payment.tailwindBadgeClass} hover:${payment.tailwindBadgeClass}`}>
                            {payment.badgeText}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Payment Method</span>
                          <span className="text-sm font-medium">
                            {payment.method}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                  {Boolean(order.isPartialCod || order.paymentInfo?.method === "Partial COD") && (
                    <>
                      <div className="flex items-center justify-between text-emerald-600">
                        <span>Advance Deposit (Online)</span>
                        <span className="text-sm font-semibold">₹{Number(order.advancePayment ?? order.paymentInfo?.advanceAmount ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-indigo-600">
                        <span>Due on Delivery (Cash)</span>
                        <span className="text-sm font-bold">₹{Number(order.remainingBalance ?? order.paymentInfo?.dueAmount ?? 0).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Transaction ID</span>
                    <span className="text-sm font-mono">{order.paymentInfo?.id || order.paymentInfo?.razorpay_payment_id || "N/A"}</span>
                  </div>

                  {((order.paymentInfo?.status?.toLowerCase() === "succeeded" || order.paymentInfo?.status?.toLowerCase() === "success" || order.isPartialCod || order.paymentInfo?.status === "Partially Paid")
                    && order.orderStatus?.toLowerCase() !== "refunded"
                    && (order.paymentInfo?.id && order.paymentInfo?.id !== 'COD'))
                    && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setShowRefundConfirm(true)}
                        disabled={isRefunding}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefunding ? 'animate-spin' : ''}`} />
                        {isRefunding ? "Processing Refund..." : "Process Refund (Advance Payment)"}
                      </Button>
                    )}
                  {order.orderStatus?.toLowerCase() === "refunded" && (
                    <div className="p-2 bg-gray-100 rounded text-center text-sm text-gray-600">
                      Payment Refunded
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Referral / Affiliate Information */}
              {Boolean(order.referralCode || order.referredBy) && (
                <Card className="border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
                        <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Referral / Affiliate
                      </span>
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-300">
                        Referred Order
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Referral Code</span>
                      <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {order.referralCode || "N/A"}
                      </span>
                    </div>
                    {order.referredBy && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Referred By (Partner)</span>
                          <span className="text-sm font-semibold">
                            {order.referredBy.name || "Affiliate User"}
                          </span>
                        </div>
                        {order.referredBy.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Partner Email</span>
                            <span className="text-xs font-mono">{order.referredBy.email}</span>
                          </div>
                        )}
                        {order.referredBy.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Partner Phone</span>
                            <span className="text-xs">{order.referredBy.phone}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-sm text-muted-foreground">Commission Status</span>
                      <Badge
                        className={
                          order.referralCommissionPaid
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                        }
                      >
                        {order.referralCommissionPaid ? "Commission Credited" : "Pending Return Window"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Shipment Tracking Information */}
              {order.shipment && order.shipment.provider !== "manual" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Shipment & Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Provider</p>
                        <p className="font-medium capitalize">{order.shipment.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Courier Partner</p>
                        <p className="font-medium">{order.shipment.courierName || "Assigning..."}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">AWB Number</p>
                        <p className="font-mono text-sm">{order.shipment.awbNumber || "Generating..."}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                        <p className="font-medium">
                          {order.shipment.estimatedDelivery 
                            ? new Date(order.shipment.estimatedDelivery).toLocaleDateString() 
                            : "Calculating..."}
                        </p>
                      </div>
                    </div>
                    {order.shipment.trackingUrl && (
                       <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => window.open(order.shipment.trackingUrl, '_blank')}
                      >
                        Track Package
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
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
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${item.completed ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground/30"}`} />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${item.completed ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}
                          >
                            {item.status}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                    ))}
                    {isCancelled && (
                      <div className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 bg-red-500 ring-4 ring-red-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
                          <p className="text-xs text-muted-foreground">{order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : "Cancelled"}</p>
                        </div>
                      </div>
                    )}
                    {isRefunded && (
                      <div className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 bg-gray-500 ring-4 ring-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700">Refunded / Returned</p>
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
                      <SelectItem value="Ordered">Ordered</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full bg-transparent flex items-center justify-center gap-2"
                  onClick={handlePrintLabel}
                >
                  <Printer className="w-4 h-4" />
                  Print Tax Invoice / Label
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

