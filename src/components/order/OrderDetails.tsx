"use client";

import React, { useEffect, useState } from "react";
import { ReportDisputeModal } from "./ReportDisputeModal";
import { useGetMyDisputesQuery } from "@/redux/api/disputeApi";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useGetOrderDetailsQuery, useGetOrderTrackingQuery } from "@/redux/api/orderApi";
import { Loader } from "@/components/layout/Loader";
import { ArrowLeft, Download, Phone, Star, Truck, Package, ShieldCheck, MapPin, ExternalLink, ShieldAlert, AlertTriangle, Clock } from "lucide-react";
import { OrderTracker } from "./TrackStepper";
import Link from "next/link";
import Image from "next/image";

const OrderDetails = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: order, isLoading: loading, error } = useGetOrderDetailsQuery(params?.id as string, { skip: !params?.id });

  const isAutomatedShipment = order?.shipment && order.shipment.provider !== "manual";
  const { data: trackingData } = useGetOrderTrackingQuery(params?.id as string, { 
    skip: !params?.id || !isAutomatedShipment 
  });
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const { data: disputesData } = useGetMyDisputesQuery(undefined, { skip: !params?.id });
  const activeDispute = disputesData?.data?.claims?.find((c: any) => String(c.order?._id || c.order) === String(params?.id));

  useEffect(() => {
    if (error) {
      toast.error("Failed to load order details");
    }
  }, [error]);

  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';
      case 'ordered': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50';
      case 'processing': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50';
      case 'shipped': return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50';
      case 'cancelled': return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50';
      case 'refunded': return 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50';
      default: return 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Top Navigation / Back Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/me?section=orders')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </button>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Order ID: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{order?._id}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Order Details</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ""}
                      </p>
                    </div>
                    <button
                      onClick={handlePrintInvoice}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Invoice
                    </button>
                  </div>

                  <div className={`flex items-center gap-3 p-3.5 rounded-xl ${getOrderStatusColor(order?.orderStatus || "")}`}>
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${['Delivered', 'Refunded'].includes(order?.orderStatus as string) ? 'bg-emerald-500' : 'bg-current'}`} />
                    <span className="font-semibold text-sm">Status: Your order is {order?.orderStatus}!</span>
                  </div>
                </div>

                {/* Products in Order */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500" />
                    Items in your order ({order?.orderItems?.length || 0})
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {order?.orderItems?.map((orderItem: any, idx: number) => {
                      const productId = orderItem.product?._id || orderItem.product || orderItem._id;
                      return (
                        <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                          <Link
                            href={`/product/${productId}`}
                            className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200/50 dark:border-slate-700 relative group"
                          >
                            {orderItem?.image ? (
                              <Image
                                src={orderItem.image}
                                alt={orderItem.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="80px"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-slate-400" />
                            )}
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/product/${productId}`}
                              className="font-semibold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                            >
                              {orderItem?.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 mb-2">
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${['Delivered', 'Refunded'].includes(orderItem.status) || (orderItem.status === 'Processing' && order?.orderStatus === 'Delivered') ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                {orderItem.status === 'Processing' && order?.orderStatus !== 'Processing' ? order?.orderStatus : (orderItem.status || order?.orderStatus)}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Qty: {orderItem?.quantity}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                ₹{(orderItem?.sellingPrice || orderItem?.price)?.toLocaleString()}
                              </span>
                              <Link
                                href={`/product/${productId}`}
                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                View Item <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking Stepper */}
                <OrderTracker
                  status={order?.orderStatus || 'Processing'}
                  orderOn={order?.createdAt || ''}
                  processingAt={order?.processingAt || order?.createdAt || ''}
                  shippedAt={order?.shippedAt}
                  deliveredAt={order?.deliveredAt}
                  trackingData={trackingData}
                />

                {/* Delivery Address */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    Delivery Address
                  </h3>
                  <div className="border-l-4 border-indigo-500 pl-4 py-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {order?.user?.name || (order?.shippingInfo?.firstName ? `${order.shippingInfo.firstName} ${order.shippingInfo?.lastName || ''}` : "Customer")}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">{order?.shippingInfo?.address}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {order?.shippingInfo?.city}{order?.shippingInfo?.state ? `, ${order?.shippingInfo?.state}` : ''} - {order?.shippingInfo?.pinCode}
                    </p>
                    {order?.shippingInfo?.phoneNo && (
                      <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order?.shippingInfo?.phoneNo}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipment Details */}
                {order?.shipment && order.shipment.provider !== "manual" && order.shipment.trackingUrl && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-tr from-indigo-50/20 to-transparent dark:from-indigo-950/20">
                    <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
                       <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                       Courier Shipment Details
                    </h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Courier Partner</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{order.shipment.courierName || "Assigning..."}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-slate-500 dark:text-slate-400">AWB Tracking Number</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{order.shipment.awbNumber || "Generating..."}</span>
                      </div>
                      <a 
                        href={order.shipment.trackingUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-3 block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-indigo-500/20"
                      >
                        Track Package Live on Courier Site →
                      </a>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Sidebar - Price & Info */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Price Summary</h3>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Items Price</span>
                      <span className="font-medium text-slate-900 dark:text-white">₹{order?.itemsPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Delivery Fee</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {(order?.shippingPrice || 0) === 0 ? "FREE" : `₹${order?.shippingPrice?.toLocaleString()}`}
                      </span>
                    </div>
                    {order?.redeemCoins && order.redeemCoins > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Coins Discount</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">-₹{order.redeemCoins.toLocaleString()}</span>
                      </div>
                    )}
                    {order?.coupon && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Coupon Discount</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">-₹{order?.coupon?.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-bold text-sm sm:text-base">
                      <span className="text-slate-900 dark:text-white">Total Paid</span>
                      <span className="text-indigo-600 dark:text-indigo-400">₹{order?.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Safe & Secure Delivery
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    All orders are verified and protected with our 100% genuine product guarantee and contactless delivery options.
                  </p>
                  {activeDispute ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4" />
                          Claim #{activeDispute.claimNumber}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                          {activeDispute.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">
                        Item: <strong className="text-slate-900 dark:text-white">{activeDispute.orderItem?.productName}</strong>
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {activeDispute.status === 'awaiting_admin_evidence' && 'Warehouse checking packing footage & dispatch weight.'}
                        {activeDispute.status === 'analyzing_by_ai' && 'AI Forensic engine is analyzing photos & seals.'}
                        {activeDispute.status === 'ai_reviewed' && 'AI verification complete. Admin finalizing resolution.'}
                        {activeDispute.status === 'approved_refund' && 'Refund credited to your Wallet!'}
                        {activeDispute.status === 'approved_replacement' && 'Replacement package approved for dispatch!'}
                        {activeDispute.status === 'rejected' && 'Claim reviewed and rejected.'}
                        {activeDispute.status === 'escalated_to_courier' && 'Escalated to courier partner for transit investigation.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <button
                        onClick={() => setIsDisputeOpen(true)}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold transition-all shadow-xs"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        Report Defective / Wrong Product
                      </button>
                      <button
                        onClick={() => router.push('/me?section=help')}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Need help with this order?
                      </button>
                      <button
                        onClick={() => router.push('/me?section=help')}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Request Return or Exchange
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {order && (
            <ReportDisputeModal
              isOpen={isDisputeOpen}
              onClose={() => setIsDisputeOpen(false)}
              order={order}
            />
          )}
        </div>
      )}
    </>
  );
};

export default OrderDetails;

