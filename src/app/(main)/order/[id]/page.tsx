import React from "react";
import OrderDetails from "@/components/order/OrderDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Details & Tracking | E-Commerce Store",
  description: "View your order details, delivery address, item summary, and real-time shipment tracking.",
};

export default function OrderPage() {
  return <OrderDetails />;
}
