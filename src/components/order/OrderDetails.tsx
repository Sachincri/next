"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useGetOrderDetailsQuery, useGetOrderTrackingQuery } from "@/redux/api/orderApi";
import { Loader } from "@/components/layout/Loader";
import { Header } from "@/components/layout/Header";
import { Download, Phone, Star, Truck } from "lucide-react";
import { OrderTracker } from "./TrackStepper";

const OrderDetails = () => {
  const params = useParams<{ id: string }>();
  const { data: order, isLoading: loading, error } = useGetOrderDetailsQuery(params?.id as string, { skip: !params?.id });

  const isAutomatedShipment = order?.shipment && order.shipment.provider !== "manual";
  const { data: trackingData } = useGetOrderTrackingQuery(params?.id as string, { 
    skip: !params?.id || !isAutomatedShipment 
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load order details");
    }
  }, [error]);

  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-50 text-green-700';
      case 'ordered': return 'bg-amber-50 text-amber-700';
      case 'processing': return 'bg-blue-50 text-blue-700';
      case 'shipped': return 'bg-indigo-50 text-indigo-700';
      case 'cancelled': return 'bg-red-50 text-red-700';
      case 'refunded': return 'bg-orange-50 text-orange-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                      <p className="text-sm text-gray-600">Order #{order?._id}</p>
                      <p className="text-sm text-gray-600">Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Invoice
                    </button>
                  </div>

                  <div className={`flex items-center gap-4 p-3 rounded-lg ${getOrderStatusColor(order?.orderStatus || "")}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${['Delivered', 'Refunded'].includes(order?.orderStatus as string) ? 'bg-green-500' : 'bg-current'}`}></div>
                    <span className="font-medium">Your order is {order?.orderStatus}!</span>
                  </div>
                </div>

                {/* Products */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Items in your order</h3>
                  <div className="space-y-4">
                    {order?.orderItems?.map((orderItem: any) => (
                      <div key={orderItem._id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                          <img src={orderItem?.image} alt={orderItem.name} className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{orderItem?.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-green-500 text-green-500" />
                              <span className="text-sm text-gray-600">4.5</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${['Delivered', 'Refunded'].includes(orderItem.status) || (orderItem.status === 'Processing' && order?.orderStatus === 'Delivered') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {orderItem.status === 'Processing' && order?.orderStatus !== 'Processing' ? order?.orderStatus : orderItem.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-gray-900">₹{(orderItem?.sellingPrice || orderItem?.price)?.toLocaleString()}</span>
                            <span className="text-sm text-gray-600 tracking-wide">Qty: {orderItem?.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <OrderTracker
                  status={order?.orderStatus || 'Processing'}
                  orderOn={order?.createdAt || ''}
                  processingAt={order?.processingAt || order?.createdAt || ''}
                  shippedAt={order?.shippedAt}
                  deliveredAt={order?.deliveredAt}
                  trackingData={trackingData}
                />

                {/* Delivery Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium text-gray-900">{order?.user?.name || order?.shippingInfo?.firstName + " " + (order?.shippingInfo?.lastName || "") || "Customer"}</p>
                    <p className="text-gray-600">{order?.shippingInfo?.address}</p>
                    <p className="text-gray-600">{order?.shippingInfo?.city} - {order?.shippingInfo?.pinCode}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{order?.shippingInfo?.phoneNo}</span>
                    </div>
                  </div>
                </div>

                {/* Shipment Details */}
                {order?.shipment && order.shipment.provider !== "manual" && order.shipment.trackingUrl && (
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-100 bg-blue-50/30">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                       <Truck className="w-5 h-5" />
                       Shipment Tracking
                    </h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Courier Partner</span>
                        <span className="font-medium text-gray-900">{order.shipment.courierName || "Assigning..."}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tracking Number</span>
                        <span className="font-mono text-gray-900">{order.shipment.awbNumber || "Generating..."}</span>
                      </div>
                      <a 
                        href={order.shipment.trackingUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-3 block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                      >
                        Track Package Live
                      </a>
                    </div>
                  </div>
                )}

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Price Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Price</span>
                      <span className="text-gray-900">₹{order?.itemsPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-green-600">{(order?.shippingPrice || 0) === 0 ? "Free" : `₹${order?.shippingPrice?.toLocaleString()}`}</span>
                    </div>
                    {order?.redeemCoins && order.redeemCoins > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coins Redeemed</span>
                        <span className="text-green-600">-₹{order.redeemCoins.toLocaleString()}</span>
                      </div>
                    )}
                    {order?.coupon && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coupon Discount</span>
                        <span className="text-green-600">-₹{order?.coupon?.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>₹{order?.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                  <div className="space-y-3 text-sm">
                    <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                      Order related issues
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                      Delivery related issues
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                      I want to return an item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetails;
