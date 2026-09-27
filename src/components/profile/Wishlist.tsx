'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '@/redux/api/wishlistApi';
import { Loader2, Trash2, ShoppingCart, Heart, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/redux/hooks';
import { addToCartSuccess } from '@/redux/reducer/cartReducer';
import toast from 'react-hot-toast';
import { cdn } from '@/lib/imageUrl';

export function Wishlist() {
  const { data: wishlist, isLoading } = useGetWishlistQuery();
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
  const dispatch = useAppDispatch();
  console.log(wishlist)
  const handleRemove = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFromWishlist(productId).unwrap();
      toast.success("Removed from wishlist");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove");
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    const sellingPrice = product.sellingPrice || product.price || product.actualPrice || 0;
    const imageUrl =
      product.thumbnail?.url ||
      product.images?.[0]?.url ||
      (product.images?.[0]?.public_id ? cdn(product.images[0].public_id, "ecom_thumb", 300) : "/placeholder.png");

    dispatch(addToCartSuccess({
      product: product._id,
      name: product.name,
      image: imageUrl,
      price: sellingPrice,
      quantity: 1,
      stock: product.stock !== undefined ? product.stock : 10,
    } as any));

    toast.success("Added to cart");
  };

  const products = wishlist?.products || [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 dark:text-pink-400">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                My Wishlist
              </h1>
              {products.length > 0 && (
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {products.length} {products.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 ml-11">
              Items you have saved to purchase later
            </p>
          </div>

          {products.length > 0 && (
            <Link
              href="/product"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 self-start sm:self-auto"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-500">Loading your wishlist...</p>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-800">
            <div className="w-20 h-20 mx-auto rounded-full bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center text-pink-500 mb-5">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Explore our wide range of products and save your favorite items to view them here anytime.
            </p>
            <Link href="/product">
              <Button className="bg-[#0d0e26] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all gap-2">
                <ShoppingCart className="w-4 h-4" /> Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product: any) => {
              const sellingPrice = product.sellingPrice || product.price || product.actualPrice || 0;
              const mrp = product.maximumRetailPrice || 0;
              const discount =
                product.discount ||
                (mrp > sellingPrice && mrp > 0
                  ? Math.round(((mrp - sellingPrice) / mrp) * 100)
                  : 0);

              const imageUrl =
                product.thumbnail?.url ||
                product.images?.[0]?.url ||
                (product.images?.[0]?.public_id
                  ? cdn(product.images[0].public_id, "ecom_thumb", 400)
                  : "/placeholder.png");

              const inStock = product.stock === undefined || product.stock > 0;
              const ratingAvg = product.ratings?.average || 0;
              const ratingCount = product.ratings?.count || product.numOfReviews || 0;

              return (
                <div
                  key={product._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs sm:shadow-sm hover:shadow-md border border-slate-200/70 dark:border-slate-800 transition-all duration-200 overflow-hidden flex flex-col justify-between group relative"
                >
                  {/* Top Image Box with Remove Button */}
                  <Link href={`/product/${product._id}`} className="block relative">
                    <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800/50 overflow-hidden p-3 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply dark:mix-blend-normal"
                      />

                      {/* Stock Status Badge */}
                      {!inStock && (
                        <span className="absolute bottom-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          Out of Stock
                        </span>
                      )}

                      {/* Remove from Wishlist Button */}
                      <button
                        onClick={(e) => handleRemove(e, product._id)}
                        aria-label="Remove from wishlist"
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 shadow-md flex items-center justify-center transition-all border border-slate-200/60 dark:border-slate-700 z-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>

                  {/* Card Details */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Product Name */}
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 leading-snug mb-1.5 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Ratings Badge */}
                      {ratingAvg > 0 && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            <span>{ratingAvg.toFixed(1)}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </div>
                          {ratingCount > 0 && (
                            <span className="text-[11px] text-slate-400">
                              ({ratingCount.toLocaleString()})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price Section */}
                      <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap mb-3">
                        <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          ₹{sellingPrice.toLocaleString()}
                        </span>
                        {mrp > sellingPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{mrp.toLocaleString()}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {discount}% off
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Move to Cart Action Button */}
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={!inStock}
                      className={`w-full py-2 sm:py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${inStock
                          ? 'bg-[#0d0e26] dark:bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{inStock ? "Move to Cart" : "Out of Stock"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
