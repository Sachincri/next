'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';
import { useCreateOrderMutation, useVerifyPaymentMutation, useGetRazorpayKeyQuery, useCreateRazorpayOrderMutation, useCreateStripePaymentIntentMutation, useVerifyStripePaymentMutation } from '@/redux/api/orderApi';
import { useGetCartSummaryQuery } from '@/redux/api/cartApi';
import { useGetAppSettingsQuery } from '@/redux/api/adminApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { CreditCard, Banknote, Loader2, Lock, ShieldCheck, Info } from 'lucide-react';
import { emptyState } from '@/redux/reducer/cartReducer';
import { CheckoutSteps } from './CheckoutSteps';
import { StripePaymentModal } from './StripePaymentModal';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function Payment() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.user);
  const { data: settings, isLoading: settingsLoading } = useGetAppSettingsQuery();
  const { data: summary, isLoading: summaryLoading } = useGetCartSummaryQuery(undefined, { skip: !isAuthenticated });

  const [createOrderServer, { isLoading: creatingOrder }] = useCreateOrderMutation();
  const [verifyPaymentServer, { isLoading: verifyingPayment }] = useVerifyPaymentMutation();
  const { data: razorpayKeyData } = useGetRazorpayKeyQuery();
  const [createRazorpayOrder, { isLoading: creatingRazorpayOrder }] = useCreateRazorpayOrderMutation();

  const [paymentMethod, setPaymentMethod] = useState('');
  const [disableBtn, setDisableBtn] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  const [createStripeIntent, { isLoading: creatingStripeIntent }] = useCreateStripePaymentIntentMutation();
  const [verifyStripePayment, { isLoading: verifyingStripePayment }] = useVerifyStripePaymentMutation();
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState("");

  const loading = creatingOrder || verifyingPayment || creatingRazorpayOrder || summaryLoading || settingsLoading || creatingStripeIntent || verifyingStripePayment;

  const products = summary?.products || [];
  const address = summary?.address;
  const priceDetails = summary?.priceDetails;

  const isCodAllowed = settings?.codEnabled && (priceDetails?.totalAmount || 0) >= (settings?.codMinimumAmount || 0);
  const codRequirementMessage = settings?.codEnabled && (priceDetails?.totalAmount || 0) < (settings?.codMinimumAmount || 0)
    ? `COD available for orders above ₹${settings.codMinimumAmount}`
    : "Only online payments currently available";

  useEffect(() => {
    if (hasRedirected) return;
    if (!summaryLoading && summary) {
      if (!products.length) { setHasRedirected(true); router.push('/cart'); }
      else if (!address) { setHasRedirected(true); router.push('/shipping'); }
    }
  }, [summaryLoading, summary, hasRedirected, router, products.length, address]);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) { toast.error('Please select a payment method'); return; }
    if (!summary || !products.length || !address || !priceDetails) { toast.error("Order details missing"); return; }
    setDisableBtn(true);
    const commonOrderData = {
      shippingInfo: {
        address: address.address, city: address.city, state: address.state, country: address.country, pinCode: Number(address.pinCode), phoneNo: String(address.phoneNo),
        firstName: address.name.split(' ')[0], lastName: address.name.split(' ').slice(1).join(' ') || '', email: user?.email
      },
      orderItems: [], itemsPrice: priceDetails.totalMRP, shippingPrice: priceDetails.shippingFees, taxPrice: 0, totalPrice: priceDetails.totalAmount, redeemCoins: 0,
    };

    try {
      if (paymentMethod === 'COD') {
        if (!isCodAllowed) { toast.error("COD not available"); setDisableBtn(false); return; }
        const res = await createOrderServer({ ...commonOrderData, paymentMethod, paymentInfo: { id: 'COD', status: 'Pending', method: 'COD' } } as any).unwrap();
        toast.success(res?.message || "Order placed"); dispatch(emptyState()); router.push('/order/success');
      } else if (paymentMethod === 'Online') {
        if (!razorpayKeyData?.key) {
          toast.error("Razorpay key not found");
          setDisableBtn(false);
          return;
        }
        const { key } = razorpayKeyData;
        const { order } = await createRazorpayOrder({ amount: 0, currency: 'INR' }).unwrap();
        const options = {
          key, amount: order.amount, currency: 'INR', name: "Store", order_id: order.id,
          handler: async function (response: any) {
            try {
              const res = await verifyPaymentServer({ razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature, orderOptions: { ...commonOrderData, paymentInfo: { id: response.razorpay_payment_id, status: "Succeeded", method: "Online" } } }).unwrap();
              toast.success(res?.message || "Order placed"); dispatch(emptyState()); router.push('/order/success');
            } catch (error: any) { toast.error("Verification failed"); }
          },
          prefill: { name: address.name || user?.name || '', email: user?.email || '', contact: address.phoneNo || '' },
          theme: { color: '#2563eb' },
          modal: { ondismiss: () => setDisableBtn(false) }
        };
        new window.Razorpay(options).open();
      } else if (paymentMethod === 'Stripe') {
        const { clientSecret, paymentIntentId } = await createStripeIntent(commonOrderData).unwrap();
        setStripeClientSecret(clientSecret); setStripePaymentIntentId(paymentIntentId); setShowStripeModal(true); setDisableBtn(false);
      }
    } catch (error: any) { toast.error(error?.data?.message || 'Payment failed'); setDisableBtn(false); }
  };

  const handleStripeSuccess = async (pid: string) => {
    try {
      setShowStripeModal(false);
      await verifyStripePayment({ paymentIntentId: pid, orderOptions: { shippingInfo: { ...address, pinCode: Number(address.pinCode), phoneNo: String(address.phoneNo), firstName: address.name.split(' ')[0], lastName: address.name.split(' ').slice(1).join(' ') || '', email: user?.email } } } as any).unwrap();
      dispatch(emptyState()); router.push('/order/success');
    } catch (error) { toast.error("Stripe verification failed"); }
  };

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.async = true; document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors duration-300">
      <CheckoutSteps activeStep={2} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-[#0d0e26] dark:bg-slate-800 text-white p-6">
              <h1 className="text-2xl font-bold flex items-center"><CreditCard className="mr-3" />Payment Method</h1>
            </div>
            <form onSubmit={submitHandler} className="p-6">
              <div className="space-y-4">
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500'} ${!isCodAllowed ? 'opacity-50' : ''}`} onClick={() => isCodAllowed && setPaymentMethod('COD')}>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" checked={paymentMethod === 'COD'} readOnly className="w-4 h-4 text-blue-600" />
                    <div className="ml-4 flex-1 text-slate-900 dark:text-slate-100 font-medium"><Banknote className="inline mr-2 text-green-600 dark:text-green-400" />Cash on Delivery</div>
                  </label>
                </div>
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'Online' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500'}`} onClick={() => setPaymentMethod('Online')}>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" checked={paymentMethod === 'Online'} readOnly className="w-4 h-4 text-blue-600" />
                    <div className="ml-4 flex-1 text-slate-900 dark:text-slate-100 font-medium"><CreditCard className="inline mr-2 text-blue-600 dark:text-blue-400" />Razorpay / UPI</div>
                  </label>
                </div>
                {settings?.stripeEnabled && (
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'Stripe' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500'}`} onClick={() => setPaymentMethod('Stripe')}>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" checked={paymentMethod === 'Stripe'} readOnly className="w-4 h-4 text-blue-600" />
                      <div className="ml-4 flex-1 text-slate-900 dark:text-slate-100 font-medium"><CreditCard className="inline mr-2 text-indigo-600 dark:text-indigo-400" />Stripe</div>
                    </label>
                  </div>
                )}
              </div>
              <button type="submit" disabled={disableBtn || !paymentMethod || loading} className="w-full mt-8 bg-[#0d0e26] dark:bg-slate-100 dark:text-gray-900 cursor-pointer text-white font-bold py-4 rounded-lg flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Place Order Securely"}
              </button>
            </form>
          </div>
        </div>
      </div>
      {showStripeModal && (
        <StripePaymentModal isOpen={showStripeModal} onClose={() => setShowStripeModal(false)} clientSecret={stripeClientSecret} publishableKey={settings?.stripePublishableKey || ""} onSuccess={handleStripeSuccess} />
      )}
    </div>
  );
}
