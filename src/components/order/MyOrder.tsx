"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";
import toast from "react-hot-toast";
import { Loader } from "@/components/layout/Loader";;
import { AlertCircle, CheckCircle, Clock, Package, Truck } from "lucide-react";
import Link from "next/link";



const MyOrders: React.FC = () => {
  const [orderStatus, setOrderStatus] = useState<string>("");

  const { data: ordersData, isLoading: loading, error } = useGetMyOrdersQuery();
  const orders = ordersData || [];

  const handleCheckboxChange = (value: string, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setOrderStatus(value);
    } else {
      setOrderStatus("");
    }
  };
  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Out for Delivery': return <Truck className="w-4 h-4 text-blue-600" />;
      case 'Processing': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'Cancelled': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'Refunded': return <Package className="w-4 h-4 text-orange-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'Out for Delivery': return 'text-blue-600 bg-blue-50';
      case 'Processing': return 'text-orange-600 bg-orange-50';
      case 'Cancelled': return 'text-red-600 bg-red-50';
      case 'Refunded': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  useEffect(() => {
    if (error) {
      toast.error("Failed to load orders");
    }
  }, [error]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* <CategoryNav /> */}
          <main className="flex flex-col md:flex-row bg-gray-100 gap-6 px-4 py-6 max-w-7xl mx-auto">
            {/* Filters Sidebar */}

            {/* Orders List */}
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Order History</h2>
                <p className="text-gray-600 text-sm">Track and manage your orders</p>
              </div>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center w-full">
                  <Package className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No orders found.</p>
                  <Link href="/" className="mt-4 text-blue-600 hover:underline">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                orders.flatMap((order) =>
                  (order.orderItems || []).map((item, idx) => (
                    <Link
                      href={`/order/${order._id}`}
                      key={`${order._id}-${idx}`}
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 block"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name || "Product"}
                              className="w-16 h-16 object-contain"
                            />
                          ) : (
                            <Package className="text-gray-400" />
                          )}
                        </div>

                        {/* Order Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-sm sm:text-base font-semibold text-gray-800 mb-1 truncate max-w-[220px]">
                                {item.name || "Unknown Product"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Quantity: {item.quantity || 1}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg text-gray-800">
                                ₹{(item.sellingPrice || (item as any).price || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            {getOrderStatusIcon(order.orderStatus)}
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              Order Date:{" "}
                              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            {/* <div>Tracking ID: {item?.trackingId}</div> */}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                          {(order.orderStatus) === "Delivered" ? "Rate Product" : "Track Order"}
                        </button>
                        {(order.orderStatus) === "Delivered" && (
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                            Return/Exchange
                          </button>
                        )}
                        {(order.orderStatus) === "Processing" && (
                          <button className="px-4 py-2 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50 transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </Link>
                  ))
                )
              )}
            </div>
          </main>

        </>
      )}
    </>
  );
};

export default MyOrders;
