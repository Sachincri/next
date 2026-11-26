'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useRecordConsentMutation } from '@/redux/api/privacyApi';
import { useCookieConsent } from '@/components/privacy/CookieConsentContext';
import { getStoredReferralCode } from '@/components/common/ReferralTracker';
import {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetRazorpayKeyQuery,
  useCreateRazorpayOrderMutation,
  useCreateStripePaymentIntentMutation,
  useVerifyStripePaymentMutation,
} from '@/redux/api/orderApi';
import { useGetCartSummaryQuery } from '@/redux/api/cartApi';
import { useGetPublicSettingsQuery } from '@/redux/api/homeApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { CreditCard, Banknote, Loader2, Lock, ShieldCheck, Info } from 'lucide-react';
import { emptyState } from '@/redux/reducer/cartReducer';
import { CheckoutSteps } from './CheckoutSteps';
import { StripePaymentModal } from './StripePaymentModal';
import PriceSummary from './PriceSummary';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function Payment() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.user);
  const { data: settings, isLoading: settingsLoading } = useGetPublicSettingsQuery();
  const { data: summary, isLoading: summaryLoading } = useGetCartSummaryQuery(undefined, { skip: !isAuthenticated });

  const [createOrderServer, { isLoading: creatingOrder }] = useCreateOrderMutation();
  const [verifyPaymentServer, { isLoading: verifyingPayment }] = useVerifyPaymentMutation();
  const { data: razorpayKeyData } = useGetRazorpayKeyQuery();
  const [createRazorpayOrder, { isLoading: creatingRazorpayOrder }] = useCreateRazorpayOrderMutation();

  const [paymentMethod, setPaymentMethod] = useState('');
  const [disableBtn, setDisableBtn] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [recordConsent] = useRecordConsentMutation();
  const { anonymousId } = useCookieConsent();

  const [createStripeIntent, { isLoading: creatingStripeIntent }] = useCreateStripePaymentIntentMutation();
  const [verifyStripePayment, { isLoading: verifyingStripePayment }] = useVerifyStripePaymentMutation();
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState('');

  const loading =
    creatingOrder ||
    verifyingPayment ||
    creatingRazorpayOrder ||
    summaryLoading ||
    settingsLoading ||
    creatingStripeIntent ||
    verifyingStripePayment;

  const products = summary?.products || [];
  const { shippingInfo } = useAppSelector((state: RootState) => state.cart);
  const validShippingInfo =
    shippingInfo && shippingInfo.address && shippingInfo.address.trim().length >= 5 ? shippingInfo : null;
  const validSummaryAddress =
    summary?.address && (summary.address.address || summary.address.streetAddress) ? summary.address : null;
  const address = validShippingInfo || validSummaryAddress;
  const priceDetails = summary?.priceDetails;

  const totalAmount = priceDetails?.totalAmount || 0;
  const isCodAllowed = Boolean(
    settings?.codEnabled && totalAmount >= (settings?.codMinimumAmount || 0)
  );

  // If partialCodEnabled is ON, COD is Advance COD; otherwise normal Full COD
  const isPartialCod = Boolean(settings?.codEnabled && settings?.partialCodEnabled);

  let partialCodAdvance = 0;
  if (isPartialCod && isCodAllowed) {
    if (settings?.partialCodType === 'percentage') {
      partialCodAdvance = Math.round((totalAmount * (settings?.partialCodAmount || 0)) / 100);
    } else {
      partialCodAdvance = Math.round(settings?.partialCodAmount || 0);
    }
    if (partialCodAdvance >= totalAmount) {
      partialCodAdvance = totalAmount;
    }
    if (partialCodAdvance <= 0) {
      partialCodAdvance = Math.min(50, totalAmount);
    }
  }
  const partialCodRemaining = Math.max(0, totalAmount - partialCodAdvance);

  useEffect(() => {
    if (hasRedirected) return;
    if (!summaryLoading && summary) {
      if (!products.length) {
        setHasRedirected(true);
        router.push('/cart');
      } else if (!address || !address.address || address.address.trim().length < 5) {
        setHasRedirected(true);
        toast.error('Please add delivery address');
        router.push('/shipping');
      }
    }
  }, [summaryLoading, summary, hasRedirected, router, products.length, address]);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAccepted) {
      toast.error('Please read and accept the Privacy Notice before placing your order');
      return;
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (!summary || !products.length || !address || !address.address || !priceDetails) {
      toast.error('Order details or address missing');
      router.push('/shipping');
      return;
    }
    recordConsent({
      anonymousId,
      email: address.email || user?.email,
      source: 'checkout',
      privacyNoticeAccepted: true,
      ...(marketingOptIn ? { emailMarketing: true, whatsappMarketing: true } : {}),
    }).catch(() => {});
    setDisableBtn(true);

    const getCommonOrderData = () => {
      if (!address || !priceDetails) return null;
      const fullName =
        address.name || [address.firstName, address.lastName].filter(Boolean).join(' ') || user?.name || 'Customer';
      return {
        shippingInfo: {
          address: address.address || address.streetAddress || '',
          city: address.city || '',
          state: address.state || '',
          country: address.country || 'India',
          pinCode: Number(address.pinCode || address.pincode || 0),
          phoneNo: String(address.phoneNo || address.phone || user?.phone || ''),
          firstName: (address.firstName || fullName).split(' ')[0] || 'Customer',
          lastName: address.lastName || fullName.split(' ').slice(1).join(' ') || '',
          email: address.email || user?.email || '',
        },
        orderItems: products.map((item: any) => ({
          product: item.product?._id || item.product,
          name: item.name || item.productName,
          price: item.sellingPrice || item.price,
          image: item.image || item.productImage || '',
          quantity: item.quantity,
          variant: item.variant || { size: item.size, color: item.color },
        })),
        itemsPrice: priceDetails.totalMRP,
        shippingPrice: priceDetails.shippingFees ?? 0,
        taxPrice: 0,
        totalPrice: priceDetails.totalAmount,
        redeemCoins: 0,
        referralCode: getStoredReferralCode() || undefined,
      };
    };

    const commonOrderData = getCommonOrderData();
    if (!commonOrderData) {
      toast.error('Order details missing');
      setDisableBtn(false);
      return;
    }

    try {
      // 1. Partial COD (Advance Paid Online, Remaining on Delivery)
      if (paymentMethod === 'Partial COD') {
        if (!isCodAllowed) {
          toast.error('Cash on Delivery is not available for this amount');
          setDisableBtn(false);
          return;
        }
        if (!razorpayKeyData?.key) {
          toast.error('Razorpay key not found');
          setDisableBtn(false);
          return;
        }

        const { key } = razorpayKeyData;
        const resOrder = await createRazorpayOrder({
          amount: partialCodAdvance,
          currency: 'INR',
          isPartialCod: true,
        }).unwrap();

        const razorpayOrder = resOrder.order;
        const actualAdvance = resOrder.advanceAmount ?? partialCodAdvance;
        const actualRemaining = resOrder.remainingAmount ?? partialCodRemaining;

        const options = {
          key,
          amount: razorpayOrder.amount,
          currency: 'INR',
          name: 'Store',
          description: `Advance Deposit for COD: ₹${actualAdvance}`,
          order_id: razorpayOrder.id,
          handler: async function (response: any) {
            try {
              const res = await verifyPaymentServer({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                isPartialCod: true,
                orderOptions: {
                  ...commonOrderData,
                  isPartialCod: true,
                  advancePayment: actualAdvance,
                  remainingBalance: actualRemaining,
                  paymentInfo: {
                    id: response.razorpay_payment_id,
                    status: 'Partially Paid',
                    method: 'Partial COD',
                    advanceAmount: actualAdvance,
                    dueAmount: actualRemaining,
                  },
                },
              }).unwrap();
              const orderId = (res as any)?.order?._id || '';
              toast.success(res?.message || 'Partial COD order placed successfully!');
              dispatch(emptyState());
              router.push(`/order/success?id=${orderId}`);
            } catch (error: any) {
              toast.error(error?.data?.message || 'Verification failed');
              setDisableBtn(false);
            }
          },
          prefill: {
            name: address.name || address.firstName || user?.name || '',
            email: address.email || user?.email || '',
            contact: String(address.phoneNo || user?.phone || ''),
          },
          theme: { color: '#2563eb' },
          modal: { ondismiss: () => setDisableBtn(false) },
        };
        new window.Razorpay(options).open();
      }
      // 2. Normal Full Cash On Delivery (100% Cash at Doorstep)
      else if (paymentMethod === 'COD') {
        if (!isCodAllowed) {
          toast.error('COD not available');
          setDisableBtn(false);
          return;
        }
        const res = await createOrderServer({
          ...commonOrderData,
          paymentMethod: 'COD',
          paymentInfo: { id: 'COD', status: 'Pending', method: 'COD' },
        } as any).unwrap();
        const orderId = (res as any)?.order?._id || '';
        toast.success(res?.message || 'Order placed');
        dispatch(emptyState());
        router.push(`/order/success?id=${orderId}`);
      }
      // 3. Full Online Payment (Cards, UPI, Netbanking)
      else if (paymentMethod === 'Online') {
        if (!razorpayKeyData?.key) {
          toast.error('Razorpay key not found');
          setDisableBtn(false);
          return;
        }
        const { key } = razorpayKeyData;
        const { order } = await createRazorpayOrder({ amount: 0, currency: 'INR' }).unwrap();
        const options = {
          key,
          amount: order.amount,
          currency: 'INR',
          name: 'Store',
          order_id: order.id,
          handler: async function (response: any) {
            try {
              const res = await verifyPaymentServer({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderOptions: {
                  ...commonOrderData,
                  paymentInfo: { id: response.razorpay_payment_id, status: 'Succeeded', method: 'Online' },
                },
              }).unwrap();
              const orderId = (res as any)?.order?._id || '';
              toast.success(res?.message || 'Order placed');
              dispatch(emptyState());
              router.push(`/order/success?id=${orderId}`);
            } catch (error: any) {
              toast.error('Verification failed');
              setDisableBtn(false);
            }
          },
          prefill: {
            name: address.name || address.firstName || user?.name || '',
            email: address.email || user?.email || '',
            contact: String(address.phoneNo || user?.phone || ''),
          },
          theme: { color: '#2563eb' },
          modal: { ondismiss: () => setDisableBtn(false) },
        };
        new window.Razorpay(options).open();
      }
      // 4. Stripe (International Cards)
      else if (paymentMethod === 'Stripe') {
        const { clientSecret, paymentIntentId } = await createStripeIntent(commonOrderData).unwrap();
        setStripeClientSecret(clientSecret);
        setStripePaymentIntentId(paymentIntentId);
        setShowStripeModal(true);
        setDisableBtn(false);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Payment failed');
      setDisableBtn(false);
    }
  };

  const handleStripeSuccess = async (pid: string) => {
    try {
      setShowStripeModal(false);
      const commonOrderData = {
        shippingInfo: {
          address: address?.address || '',
          city: address?.city || '',
          state: address?.state || '',
          country: address?.country || '',
          pinCode: Number(address?.pinCode || 0),
          phoneNo: String(address?.phoneNo || ''),
          firstName: (address?.firstName || '').split(' ')[0] || '',
          lastName: (address?.firstName || '').split(' ').slice(1).join(' ') || '',
          email: address?.email || user?.email || '',
        },
        orderItems: [],
        itemsPrice: priceDetails?.totalMRP || 0,
        shippingPrice: priceDetails?.shippingFees || 0,
        taxPrice: 0,
        totalPrice: priceDetails?.totalAmount || 0,
        redeemCoins: 0,
      };

      const res = await verifyStripePayment({
        paymentIntentId: pid,
        orderOptions: {
          ...commonOrderData,
          paymentInfo: { id: pid, status: 'Succeeded', method: 'Stripe' },
        },
      } as any).unwrap();
      const orderId = (res as any)?.order?._id || '';
      dispatch(emptyState());
      router.push(`/order/success?id=${orderId}`);
    } catch (error) {
      toast.error('Stripe verification failed');
    }
  };

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors duration-300">
      <CheckoutSteps activeStep={2} />
      <div className="w-full max-w-[1550px] mx-auto px-4 py-8">
        <div className="max-w-7xl 2xl:max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white p-6">
                <h1 className="text-xl font-bold flex items-center">
                  <Lock className="mr-2 w-5 h-5 text-green-600" />
                  Secure Payment
                </h1>
              </div>
              <form onSubmit={submitHandler} className="p-6">
                <div className="space-y-4">
                  {/* COD OPTION: Either Partial COD OR Full COD (Sirf ek hi dikhega) */}
                  {settings?.codEnabled && (
                    isPartialCod ? (
                      /* Option 1: Partial COD (Advance Online + Remaining on Delivery) */
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === 'Partial COD'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/25 ring-1 ring-indigo-500'
                            : 'border-gray-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                        } ${!isCodAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => isCodAllowed && setPaymentMethod('Partial COD')}
                      >
                        <label className="flex items-start cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'Partial COD'}
                            disabled={!isCodAllowed}
                            onChange={() => setPaymentMethod('Partial COD')}
                            className="w-4 h-4 text-indigo-600 mt-0.5"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                                Cash on Delivery (Pay ₹{partialCodAdvance} Advance)
                              </span>
                              <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                                Advance COD
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              Pay <strong className="text-indigo-600 dark:text-indigo-400">₹{partialCodAdvance}</strong> online now to book order &amp; pay remaining <strong className="text-slate-900 dark:text-slate-200">₹{partialCodRemaining}</strong> in cash at delivery.
                            </p>

                            {!isCodAllowed && settings?.codMinimumAmount && (
                              <p className="text-xs text-red-500 mt-1 font-medium">
                                Minimum order of ₹{settings.codMinimumAmount} required for COD.
                              </p>
                            )}

                            {settings?.termsAndConditions && (
                              <div className="mt-3 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-start gap-2">
                                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                <div className="space-y-0.5">
                                  <span className="font-semibold block text-[11px] uppercase tracking-wide text-amber-900 dark:text-amber-200">
                                    Notice &amp; Policy:
                                  </span>
                                  <p className="text-[11px] leading-relaxed whitespace-pre-line">
                                    {settings.termsAndConditions}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <Banknote className="w-6 h-6 text-indigo-600 dark:text-indigo-400 opacity-90" />
                        </label>
                      </div>
                    ) : (
                      /* Option 2: Standard Full Cash on Delivery */
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === 'COD'
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                            : 'border-gray-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                        } ${!isCodAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => isCodAllowed && setPaymentMethod('COD')}
                      >
                        <label className="flex items-start cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'COD'}
                            disabled={!isCodAllowed}
                            onChange={() => setPaymentMethod('COD')}
                            className="w-4 h-4 text-green-600 mt-0.5"
                          />
                          <div className="ml-4 flex-1">
                            <div className="text-slate-900 dark:text-slate-100 font-medium">Cash on Delivery (Full COD)</div>
                            <div className="text-xs text-gray-500 mt-1">Pay complete amount (₹{totalAmount}) at your doorstep</div>

                            {!isCodAllowed && settings?.codMinimumAmount && (
                              <p className="text-xs text-red-500 mt-1 font-medium">
                                Minimum order of ₹{settings.codMinimumAmount} required for COD.
                              </p>
                            )}

                            {settings?.termsAndConditions && (
                              <div className="mt-3 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-start gap-2">
                                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                <div className="space-y-0.5">
                                  <span className="font-semibold block text-[11px] uppercase tracking-wide text-amber-900 dark:text-amber-200">
                                    Notice &amp; Terms:
                                  </span>
                                  <p className="text-[11px] leading-relaxed whitespace-pre-line">
                                    {settings.termsAndConditions}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <Banknote className="w-6 h-6 text-green-600 dark:text-green-400 opacity-80" />
                        </label>
                      </div>
                    )
                  )}

                  {/* Online Payment (100% Online) */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'Online'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                    onClick={() => setPaymentMethod('Online')}
                  >
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'Online'}
                        onChange={() => setPaymentMethod('Online')}
                        className="w-4 h-4 text-green-600 mt-0.5"
                      />
                      <div className="ml-4 flex-1">
                        <div className="text-slate-900 dark:text-slate-100 font-medium">
                          Credit/Debit Card, UPI &amp; More (Full Online Payment)
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Pay 100% online (₹{totalAmount})</div>
                        <div className="flex gap-2 mt-2">
                          <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            UPI
                          </div>
                          <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            VISA
                          </div>
                          <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            MasterCard
                          </div>
                        </div>
                      </div>
                      <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400 opacity-80" />
                    </label>
                  </div>

                  {/* Stripe (International) */}
                  {settings?.stripeEnabled && (
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        paymentMethod === 'Stripe'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                      onClick={() => setPaymentMethod('Stripe')}
                    >
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'Stripe'}
                          onChange={() => setPaymentMethod('Stripe')}
                          className="w-4 h-4 text-green-600 mt-0.5"
                        />
                        <div className="ml-4 flex-1">
                          <div className="text-slate-900 dark:text-slate-100 font-medium">International Cards (Stripe)</div>
                          <div className="text-xs text-gray-500 mt-1">Pay with non-Indian credit cards</div>
                        </div>
                        <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400 opacity-80" />
                      </label>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <PriceSummary showCouponInput={false} showCoinToggle={false} />
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300 cursor-pointer">
                <Checkbox
                  checked={privacyAccepted}
                  onCheckedChange={(checked) => setPrivacyAccepted(Boolean(checked))}
                  className="mt-0.5"
                />
                <span>
                  I have read and agree to the{' '}
                  <Link href="/privacy-policy" target="_blank" className="text-indigo-600 dark:text-indigo-400 underline font-medium">
                    Privacy Notice
                  </Link>{' '}
                  for processing my order/account data. <span className="text-red-500">*</span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300 cursor-pointer">
                <Checkbox
                  checked={marketingOptIn}
                  onCheckedChange={(checked) => setMarketingOptIn(Boolean(checked))}
                  className="mt-0.5"
                />
                <span>
                  I agree to receive promotional offers and updates via WhatsApp &amp; Email (you can opt out anytime).
                </span>
              </label>
            </div>
            <button
              onClick={submitHandler}
              disabled={disableBtn || !paymentMethod || !privacyAccepted || loading}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                !paymentMethod || !privacyAccepted || disableBtn
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg cursor-pointer'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : paymentMethod === 'Partial COD' ? (
                `Pay ₹${partialCodAdvance} Advance & Book COD`
              ) : paymentMethod === 'Online' ? (
                `Pay ₹${totalAmount} Online`
              ) : paymentMethod === 'COD' ? (
                `Confirm COD Order (₹${totalAmount})`
              ) : (
                'Place Order Securely'
              )}
            </button>
            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Safe &amp; Secure Payments
            </p>
          </div>
        </div>
      </div>
      {showStripeModal && (
        <StripePaymentModal
          isOpen={showStripeModal}
          onClose={() => setShowStripeModal(false)}
          clientSecret={stripeClientSecret}
          publishableKey={settings?.stripePublishableKey || ''}
          onSuccess={handleStripeSuccess}
        />
      )}
    </div>
  );
}
