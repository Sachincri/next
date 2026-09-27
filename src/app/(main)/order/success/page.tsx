"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("id");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-500">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 dark:border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-in zoom-in-75 duration-700" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Order Confirmed!
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
          Thank you for your purchase. We have received your order and are preparing it for shipment.
        </p>

        {orderId && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 dark:text-zinc-400 block mb-1 uppercase tracking-wider font-semibold">
              Order ID
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-200 break-all select-all">
              {orderId}
            </span>
          </div>
        )}

        <div className="space-y-3">
          {orderId && (
            <Button
              asChild
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25"
            >
              <Link href={`/order/${orderId}`} className="flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                Track & View Order Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-zinc-200"
          >
            <Link href="/" className="flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-400">Loading order status...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
