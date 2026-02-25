"use client"
import { useAppDispatch, useAppSelector } from '@/redux';
import { useGetCartQuery, useSyncCartMutation, } from '@/redux/api/cartApi';
import { useGetAddressesQuery } from '@/redux/api/addressApi';
import { emptyState } from '@/redux/reducer/cartReducer';
import { RootState } from '@/redux/store';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartItemCard } from './CartItemCard';
import PriceSummary from './PriceSummary';
import { Shield, MapPin, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/ui/button';


const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.user);
  const { cartItems: localCartItems } = useAppSelector((state: RootState) => state.cart);

  // RTK Query hooks
  const { data: serverCartItems, isLoading: loadingServerCart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [syncCart] = useSyncCartMutation();
  const { data: addresses } = useGetAddressesQuery(undefined, { skip: !isAuthenticated });

  const defaultAddress = addresses?.find((addr: any) => addr.isDefault) || addresses?.[0];

  const cartItems = isAuthenticated ? (serverCartItems || []) : localCartItems;


  // Sync logic
  useEffect(() => {
    const syncLocalCartToContext = async () => {
      if (isAuthenticated && localCartItems.length > 0) {
        try {
          await syncCart({ items: localCartItems }).unwrap();
          dispatch(emptyState()); // Clear local cart after successful sync
          // toast.success("Cart synced with account"); // Commented out as toast import is not provided
        } catch (error) {
          console.error("Failed to sync cart", error);
        }
      }
    };
    syncLocalCartToContext();
  }, [isAuthenticated, localCartItems, syncCart, dispatch]);

  const checkoutHandler = () => {
    if (addresses && addresses.length > 0) {
      router.push('/order-summary');
    } else {
      router.push('/shipping');
    }
  };

  // const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-6 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-6">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-2">
            {/* Delivery Address */}
            {cartItems.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-slate-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {defaultAddress ? 'Deliver to:' : 'Delivery Address'}
                  </h3>
                  <button
                    onClick={() => router.push('/shipping')}
                    className="text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-600 dark:border-blue-500 px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {defaultAddress ? 'CHANGE' : 'ADD ADDRESS'}
                  </button>
                </div>
                {defaultAddress && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                        {defaultAddress.name}
                      </span>
                      <span className="text-gray-600 dark:text-slate-400 text-sm">
                        {defaultAddress.phoneNo}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400 truncate max-w-lg">
                      {defaultAddress.address}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pinCode}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-medium text-gray-800 dark:text-slate-200">
                  My Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                </h3>
              </div>
              <div>
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-4">
                      <ShoppingBag className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Your cart is empty!</h3>
                    <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-sm text-center">
                      Explore our wide range of products and find something you love.
                    </p>
                    <Link
                      href="/"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-10 rounded-sm transition-colors uppercase text-sm tracking-wide"
                    >
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <>
                    <div>
                      {cartItems.map((item) => (
                        <CartItemCard key={item.product} item={item} />
                      ))}
                    </div>

                    {/* Place Order Button */}
                    <div className="fixed bottom-0 left-0 right-0 lg:static lg:mt-4 p-3 sm:p-4 flex justify-between lg:justify-end items-center border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.1)] lg:shadow-none">
                      <div className="lg:hidden flex flex-col justify-center">
                        <span className="text-gray-400 dark:text-slate-500 line-through text-xs">
                          ₹{cartItems.reduce((total, item) => total + (item.price * 1.5) * item.quantity, 0)?.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[17px] font-black leading-none text-slate-900 dark:text-slate-100">
                            ₹{cartItems.reduce((total, item) => total + item.price * item.quantity, 0)?.toLocaleString()}
                          </span>
                          <button className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-tight leading-none pt-0.5">Details</button>
                        </div>
                      </div>
                      <button
                        onClick={checkoutHandler}
                        className="w-[50%] xs:w-48 lg:w-60 bg-[#0d0e26] text-white py-3 sm:py-3.5 px-6 font-bold text-sm sm:text-base uppercase tracking-tight rounded-sm transition-all shadow-md active:scale-[0.98]"
                      >
                        Place Order
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Saved for Later */}
            {/* {savedForLater.length > 0 && (
              <div className="bg-white rounded-sm shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-base font-medium text-gray-800">
                    Saved for Later ({savedForLater.length})
                  </h3>
                </div>
                <div>
                  {savedForLater.map((item) => (
                    <CartItemCard key={item.id} item={item} showMoveToSaved={false} />
                  ))}
                </div>
              </div>
            )} */}
          </div>

          {/* Right Column - Price Summary */}
          {cartItems.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-3 sticky top-18">
                {/* Price Summary */}
                <PriceSummary showCouponInput={true} showCoinToggle={true} />
                {/* Safe & Secure */}
                <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-slate-400 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;

