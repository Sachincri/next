'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCartSummaryQuery } from '@/redux/api/cartApi';
import { CheckoutSteps } from './CheckoutSteps';
import { MapPin, ShieldCheck, Truck, Package, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PriceSummary from './PriceSummary';
import { useGetAppSettingsQuery } from '@/redux/api/adminApi';
import { useAppSelector } from '@/redux/hooks';

export function OrderSummary() {
  const router = useRouter();
  const { shippingInfo } = useAppSelector((state) => state.cart);
  const { data: summary, isLoading, error } = useGetCartSummaryQuery();
  const { data: settings } = useGetAppSettingsQuery();

  const products = summary?.products || [];
  const address = shippingInfo || summary?.address;
  const priceDetails = summary?.priceDetails;

  const totalAmount = priceDetails?.totalAmount || 0;

  useEffect(() => {
    if (!isLoading && summary) {
      if (!summary.products || summary.products.length === 0) {
        toast.error('Cart is empty'); router.push('/cart');
      } else if (!address) {
        toast.error('Please select address'); router.push('/shipping');
      }
    }
  }, [summary, isLoading, router, address]);

  const formatPrice = (p: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
  const proceedToPayment = () => router.push('/payment');
  const fullAddress = address ? `${address.address}, ${address.city}, ${address.state} - ${address.pinCode}` : '';

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error || !summary) return <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center"><AlertCircle className="w-12 h-12 text-red-500 mb-4" /><h2 className="text-xl font-bold mb-2">Failed to load summary</h2><button onClick={() => window.location.reload()} className="text-blue-600 underline">Try Again</button></div>;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <CheckoutSteps activeStep={1} />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100"><MapPin className="text-blue-600 dark:text-blue-400" /> Delivery Address</h2>
                <button onClick={() => router.push('/shipping')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Edit</button>
              </div>
              {address && <p className="text-gray-600 dark:text-slate-400">{(address as any).firstName} {(address as any).lastName}<br />{fullAddress}<br />Phone: {address.phoneNo}</p>}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100"><Package className="text-orange-600" /> Order Summary</h2>
                <button onClick={() => router.push('/cart')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Edit Cart</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((item: any) => {
                  const deliveryDate = new Date();
                  deliveryDate.setDate(deliveryDate.getDate() + 5);
                  return (
                    <div key={item.product || item._id} className="py-4 flex gap-4">
                      <img src={item.productImage || item.image} alt={item.productName || item.name} className="w-20 h-20 object-contain rounded bg-slate-50 dark:bg-slate-800" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{item.productName || item.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Qty: {item.quantity}</p>
                        <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">{formatPrice(item.sellingPrice || item.price)}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Expected Delivery by {deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <PriceSummary showCouponInput={false} showCoinToggle={false} />
            <div>
              <button onClick={proceedToPayment} className="w-full bg-[#0d0e26] dark:bg-slate-100 dark:text-gray-900 cursor-pointer text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity">
                Continue to Payment <ChevronRight className="w-5 h-5" />
              </button>
              <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
                <span role="img" aria-label="lock">🔒</span> Safe & Secure Payments
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
