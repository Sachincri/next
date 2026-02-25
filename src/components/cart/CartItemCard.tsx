"use client";

import React, { useState } from "react";
import { Truck, AlertCircle, Minus, Plus, Heart, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCartSuccess, removeFromCart as removeFromCartLocal } from "@/redux/reducer/cartReducer";
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/redux/api/cartApi";
import toast from "react-hot-toast";
import { CartItem } from "@/types/cart";
import { RootState } from "@/redux/store";

interface CartItemCardProps {
  item: CartItem;
  showMoveToSaved?: boolean;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  showMoveToSaved = true,
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.user);

  const [updateCartItemServer] = useUpdateCartItemMutation();
  const [removeFromCartServer] = useRemoveFromCartMutation();

  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);

  // Helper functions
  const updateQuantity = async (id: string | number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id.toString());
      return;
    }

    if (isAuthenticated) {
      await updateCartItemServer({ itemId: id.toString(), quantity: newQuantity });
    } else {
      dispatch(addToCartSuccess({ ...item, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      if (isAuthenticated) {
        const res = await removeFromCartServer(id).unwrap();
        toast.success(res?.message || "Item removed from cart");
      } else {
        dispatch(removeFromCartLocal(id));
        toast.success("Item removed from cart");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove item");
    }
  };

  const moveToSaved = (id: string | number) => {
    // Basic implementation for now
    toast.success("Feature coming soon!");
  };

  const moveToCart = (id: string | number) => {
    toast.success("Feature coming soon!");
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 border-b border-gray-100 dark:border-slate-800 transition-colors hover:bg-gray-50/10 dark:hover:bg-slate-800/30">
      <div className="flex flex-row gap-3 sm:gap-6">
        {/* Left: Product Image & Quantity */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 dark:bg-slate-800 rounded-md overflow-hidden border border-gray-100 dark:border-slate-700 flex items-center justify-center">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
            />
          </div>

          {/* Quantity Controls */}
          {showMoveToSaved && (
            <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 shadow-sm overflow-hidden w-fit h-8">
              <button
                onClick={() => updateQuantity(item.product, item.quantity - 1)}
                className="w-8 h-full flex items-center justify-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 disabled:opacity-50 transition-colors active:bg-gray-200 dark:active:bg-slate-600"
                aria-label="Decrease quantity"
              >
                {item.quantity <= 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
              </button>
              <div className="w-10 h-full flex items-center justify-center text-sm font-semibold border-x border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                {item.quantity}
              </div>
              <button
                onClick={() => updateQuantity(item.product, item.quantity + 1)}
                className="w-8 h-full flex items-center justify-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 disabled:opacity-50 transition-colors active:bg-gray-200 dark:active:bg-slate-600"
                disabled={item.quantity >= item.stock}
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="flex-1 min-w-0 flex flex-col pt-0.5">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="text-[13px] sm:text-[15px] font-normal text-gray-800 dark:text-slate-200 line-clamp-2 leading-snug">
              {item.name}
            </h3>
          </div>

          {/* Variant Info */}
          <div className="flex flex-col gap-0.5 mb-2">
            {(item.size || item.color) && (
              <div className="flex gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 uppercase">
                {item.size && <span>Size: <span className="text-gray-900 dark:text-slate-200 font-medium">{item.size}</span></span>}
                {item.color && <span>Color: <span className="text-gray-900 dark:text-slate-200 font-medium">{item.color}</span></span>}
              </div>
            )}
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base sm:text-xl font-bold text-gray-900 dark:text-slate-100">
              ₹{item?.price?.toLocaleString()}
            </span>
            <span className="text-[11px] sm:text-sm text-gray-400 dark:text-slate-500 line-through">₹{(item.price * 1.5).toLocaleString()}</span>
            <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-500 font-bold whitespace-nowrap">50% Off</span>
          </div>

          {/* Mobile Actions at Bottom Right */}
          <div className="mt-auto flex gap-4 sm:gap-6 pt-2">
            {showMoveToSaved ? (
              <>
                <button
                  onClick={() => moveToSaved(item.product)}
                  className="text-gray-800 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors text-[11px] sm:text-[13px] font-bold uppercase tracking-tight"
                >
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-slate-500" />
                  SAVE
                </button>
                <button
                  onClick={() => handleRemoveItem(item.product)}
                  className="text-gray-800 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1.5 transition-colors text-[11px] sm:text-[13px] font-bold uppercase tracking-tight"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-slate-500" />
                  REMOVE
                </button>
              </>
            ) : (
              <button
                onClick={() => moveToCart(item.product)}
                className="text-blue-600 hover:text-blue-800 font-bold uppercase text-[11px] sm:text-[13px]"
              >
                MOVE TO CART
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
