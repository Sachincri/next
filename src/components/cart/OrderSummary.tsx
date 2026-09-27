'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCartSummaryQuery } from '@/redux/api/cartApi';
import { useGetAddressesQuery } from '@/redux/api/addressApi';
import { CheckoutSteps } from './CheckoutSteps';
import { MapPin, Truck, Package, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PriceSummary from './PriceSummary';
import { useGetAppSettingsQuery } from '@/redux/api/adminApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addShippingInfo } from '@/redux/reducer/cartReducer';

export function OrderSummary() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { shippingInfo } = useAppSelector((state) => state.cart);
  const { data: summary, isLoading, error } = useGetCartSummaryQuery();
  const { data: savedAddresses, isLoading: addressesLoading } = useGetAddressesQuery(undefined, { skip: !user });
  // const { data: settings } = useGetAppSettingsQuery();

  const products = summary?.products || [];

  // Robust address resolution: Redux shippingInfo -> Summary address -> Saved default address
  const address = useMemo(() => {
    if (shippingInfo && shippingInfo.address && shippingInfo.address.trim().length > 0) {
      return shippingInfo;
    }
    if (summary?.address && (summary.address.address || summary.address.streetAddress)) {
      return summary.address;
    }
    if (savedAddresses && savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0];
      return defaultAddr;
    }
    return null;
  }, [shippingInfo, summary?.address, savedAddresses]);

  // Sync resolved address back to Redux so Payment page has it immediately
  useEffect(() => {
    if (address && (!shippingInfo || !shippingInfo.address)) {
      dispatch(addShippingInfo(address));
    }
  }, [address, shippingInfo, dispatch]);

  const priceDetails = summary?.priceDetails;
  const totalAmount = priceDetails?.totalAmount || 0;

  useEffect(() => {
    if (!isLoading && !addressesLoading && summary) {
      if (!summary.products || summary.products.length === 0) {
        toast.error('Cart is empty');
        router.push('/cart');
      } else if (!address) {
        toast.error('Please add delivery address');
        router.push('/shipping');
      }
    }
  }, [summary, isLoading, addressesLoading, router, address]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const proceedToPayment = () => {
    if (!address) {
      toast.error('Please provide shipping address');
      router.push('/shipping');
      return;
    }
    router.push('/payment');
  };

  // Extract display values cleanly
  const displayName =
    address?.name ||
    [address?.firstName, address?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    'Customer';

  const displayPhone =
    address?.phoneNo ||
    address?.phone ||
    address?.phoneNumber ||
    user?.phone ||
    '';

  const streetAddress = address?.address || address?.streetAddress || '';
  const city = address?.city || '';
  const state = address?.state || '';
  const pinCode = address?.pinCode || address?.pincode || address?.postalCode || '';
  const country = address?.country || 'India';

  const fullAddress = [
    streetAddress,
    city,
    state ? `${state}${pinCode ? ` - ${pinCode}` : ''}` : pinCode,
    country && country !== 'India' ? country : ''
  ].filter(Boolean).join(', ');

  if (isLoading || addressesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load summary</h2>
        <button onClick={() => window.location.reload()} className="text-blue-600 underline">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <CheckoutSteps activeStep={1} />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <MapPin className="text-blue-600 dark:text-blue-400 w-5 h-5" /> Delivery Address
                </h2>
                <button
                  onClick={() => router.push('/shipping')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  {address ? 'Change' : 'Add Address'}
                </button>
              </div>

              {address ? (
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-base">{displayName}</p>
                    {address.addressType && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {address.addressType}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{fullAddress}</p>
                  {displayPhone && (
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 pt-1">
                      <span className="text-slate-500">Phone:</span> {displayPhone}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-300">No delivery address selected</p>
                  <button
                    onClick={() => router.push('/shipping')}
                    className="text-xs bg-blue-600 text-white font-bold px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Address
                  </button>
                </div>
              )}
            </div>

            {/* Order Items Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Package className="text-orange-600 w-5 h-5" /> Order Summary
                </h2>
                <button
                  onClick={() => router.push('/cart')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Edit Cart
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((item: any) => {
                  const deliveryDate = new Date();
                  deliveryDate.setDate(deliveryDate.getDate() + 5);
                  return (
                    <div key={item.product || item._id} className="py-4 flex gap-4">
                      <img
                        src={item.productImage || item.image}
                        alt={item.productName || item.name}
                        className="w-20 h-20 object-contain rounded bg-slate-50 dark:bg-slate-800 p-1"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{item.productName || item.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Qty: {item.quantity}</p>
                        <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                          {formatPrice(item.sellingPrice || item.price)}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          Expected Delivery by {deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Price Summary & Checkout Action */}
          <div className="lg:col-span-4 space-y-6">
            <PriceSummary showCouponInput={false} showCoinToggle={false} />
            <div>
              <button
                onClick={proceedToPayment}
                className="w-full bg-[#0d0e26] dark:bg-slate-100 dark:text-gray-900 cursor-pointer text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
              >
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
