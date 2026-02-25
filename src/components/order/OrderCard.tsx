"use client";

import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { OrderCardProps } from "@/types";


const OrderCard: React.FC<OrderCardProps> = ({ id, name, ratings, cutedPrice, quantity, price, discount }) => {
  return (
    <div key={id}>
      {/* <Link href={`/order/${id}`} className="bg-white rounded-lg shadow-sm p-6 mb-4"> */}
      <div className="flex gap-4">
        <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded"></div>
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-2">{name}</h3>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-green-500 text-green-500" />
              <span className="text-sm text-gray-600">{ratings}</span>
            </div>
            <span className="text-sm text-gray-400">•</span>
            {/* <span className="text-sm text-gray-600">Seller: {product.seller}</span> */}
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-semibold text-gray-900">₹{price.toLocaleString()}</span>
            <span className="text-sm text-gray-500 line-through">₹{cutedPrice.toLocaleString()}</span>
            <span className="text-sm text-green-600 font-medium">{discount}% off</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Qty: {quantity}</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Rate & Review
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Need Help?
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* </Link> */}
    </div>
  );
};

export default OrderCard;

