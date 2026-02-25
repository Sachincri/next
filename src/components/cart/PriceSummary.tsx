'use client';
import React from 'react';
import { useGetCartSummaryQuery, useApplyCouponMutation, useRemoveCouponMutation, useToggleCoinsMutation } from '@/redux/api/cartApi';
import { useAppSelector } from '@/redux/hooks';
import { useGetAppSettingsQuery } from '@/redux/api/adminApi';
import { Coins, HelpCircle, Loader2, Tag, X } from 'lucide-react';
import { Switch } from '@/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { RootState } from '@/redux';

interface PriceSummaryProps {
  showCouponInput?: boolean;
  showCoinToggle?: boolean;
}

export default function PriceSummary({ showCouponInput = true, showCoinToggle = true }: PriceSummaryProps) {
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.user);
  const { data: summary, isLoading: isSummaryLoading } = useGetCartSummaryQuery();
  const { data: settings } = useGetAppSettingsQuery();

  const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();
  const [removeCoupon, { isLoading: isRemovingCoupon }] = useRemoveCouponMutation();
  const [toggleCoins, { isLoading: isTogglingCoins }] = useToggleCoinsMutation();

  const [couponCodeInput, setCouponCodeInput] = React.useState('');

  const priceDetails = summary?.priceDetails;

  if (isSummaryLoading || !priceDetails) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 dark:bg-slate-800/50 rounded"></div>
          <div className="h-4 bg-gray-100 dark:bg-slate-800/50 rounded"></div>
          <div className="h-4 bg-gray-100 dark:bg-slate-800/50 rounded"></div>
        </div>
      </div>
    );
  }

  const {
    totalMRP = 0,
    totalDiscount = 0,
    couponDiscount = 0,
    coinsDiscount = 0,
    shippingFees = 0,
    totalAmount = 0,
    couponCode = null,
    isCoinsRedeemed = false,
    items = 0
  } = priceDetails;

  const savings = totalMRP - (totalAmount - shippingFees - (settings?.platformFees || 0)); // Approx savings calculation needed?
  // Actually easier: totalMRP - (itemsPrice + tax) ...
  // Let's use backend provided numbers. 
  // Total Savings = (Total MRP - Total Amount) (roughly, excluding fees)
  // Or: Total Discount + Coupon Discount + Coins Discount
  const totalSavings = totalDiscount + couponDiscount + coinsDiscount;


  const handleApplyCoupon = async () => {
    if (!couponCodeInput) return;
    try {
      await applyCoupon({ code: couponCodeInput }).unwrap();
      toast.success("Coupon applied successfully!");
      setCouponCodeInput('');
    } catch (error: any) {
      toast.error(error?.data?.message || "Invalid coupon code");
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon().unwrap();
      toast.success("Coupon removed");
    } catch (error) {
      toast.error("Failed to remove coupon");
    }
  };

  const handleCoinsToggle = async (checked: boolean) => {
    try {
      await toggleCoins({ useCoins: checked }).unwrap();
      // toast.success(`Coins ${checked ? 'applied' : 'removed'}`);
    } catch (error) {
      toast.error("Failed to update coins");
    }
  };

  const availableCoins = (user as any)?.points || (user as any)?.rewardPoints || 0;
  const maxUsagePercentage = settings?.maxCoinUsagePercentage || 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800">
      <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
        <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Price Details <span className="text-gray-500 dark:text-slate-400 font-normal text-sm ml-1">({items} items)</span></h3>
      </div>

      <div className="p-6 space-y-5">
        {/* Market Price */}
        <div className="flex justify-between text-gray-600 dark:text-slate-400">
          <span>Total MRP</span>
          <span>₹{totalMRP.toLocaleString()}</span>
        </div>

        {/* Discount */}
        {totalDiscount > 0 && (
          <div className="flex justify-between items-center text-green-700 dark:text-green-400 font-medium">
            <span className="text-sm">Discount on MRP</span>
            <span className="text-sm">-₹{totalDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Coupons Section */}
        {showCouponInput && (
          <div className="space-y-3 pt-3 border-t border-dashed border-gray-200 dark:border-slate-800">
            {!couponCode ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Coupon Code"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="uppercase placeholder:normal-case h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCodeInput}
                  variant="outline"
                  className="w-24 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 h-10 font-semibold"
                >
                  {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "APPLY"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm">
                    <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">{couponCode}</div>
                    <div className="text-[10px] text-green-600 dark:text-green-500 font-medium">Saved ₹{couponDiscount}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-700 dark:text-green-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
                  onClick={handleRemoveCoupon}
                  disabled={isRemovingCoupon}
                >
                  {isRemovingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-4 h-4" />}
                </Button>
              </div>
            )}

            {couponCode && (
              <div className="flex justify-between text-green-700 dark:text-green-400 text-sm font-medium">
                <span>Coupon Discount</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
          </div>
        )}

        {/* If Not Showing Input but Coupon is Applied (e.g. Order Summary) */}
        {!showCouponInput && couponCode && (
          <div className="space-y-3 pt-3 border-t border-dashed border-gray-200 dark:border-slate-800">
            <div className="flex justify-between text-green-700 dark:text-green-400 text-sm font-medium">
              <span>Coupon ({couponCode})</span>
              <span>-₹{couponDiscount}</span>
            </div>
          </div>
        )}

        {/* Coins System Toggle - Only in Cart */}
        {isAuthenticated && availableCoins > 0 && showCoinToggle && (
          <div className="pb-3 border-b border-dashed border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm">
                  <Coins className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-500">Redeem Coins</div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-600 font-medium">Available: {availableCoins} coins</div>
                </div>
              </div>
              <Switch
                checked={isCoinsRedeemed}
                onCheckedChange={handleCoinsToggle}
                disabled={isTogglingCoins}
                className="data-[state=checked]:bg-amber-500 dark:data-[state=checked]:bg-amber-600"
              />
            </div>
            {isCoinsRedeemed && (
              <div className="mt-2 text-[10px] text-amber-600/80 dark:text-amber-500/80 italic px-1">
                * You can use up to {maxUsagePercentage}% of your total coin balance
              </div>
            )}
          </div>
        )}

        {/* Coins Discount Display - Shown in both Cart & Order Summary if applied and > 0 */}
        {isCoinsRedeemed && coinsDiscount > 0 && (
          <div className="flex justify-between text-sm text-amber-700 dark:text-amber-500 font-medium pt-1">
            <span>Coins Redeemed</span>
            <span>-₹{coinsDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Delivery */}
        <div className="flex justify-between text-gray-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Delivery Fee</span>
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
          </div>
          {shippingFees > 0 ? (
            <span className="text-gray-900 dark:text-slate-100 font-medium">₹{shippingFees}</span>
          ) : (
            <span className="text-green-600 dark:text-green-400 font-bold uppercase text-xs tracking-wider bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">Free</span>
          )}
        </div>

        {/* Platform Fees (if any) */}
        {priceDetails.platformFees > 0 && (
          <div className="flex justify-between text-gray-600 dark:text-slate-400">
            <span>Platform Fee</span>
            <span>₹{priceDetails.platformFees}</span>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
          <div className="flex justify-between items-center text-lg">
            <span className="font-bold text-gray-900 dark:text-slate-100">Total Amount</span>
            <span className="font-black text-gray-900 dark:text-slate-100">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {totalSavings > 0 && (
          <div className="bg-green-600/10 dark:bg-green-900/10 p-3 rounded-xl border border-green-600/20 dark:border-green-900/30">
            <p className="text-xs text-green-700 dark:text-green-400 font-bold text-center">
              You will save ₹{totalSavings.toLocaleString()} on this order
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
