'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAddToWishlistMutation } from "@/redux/api/wishlistApi";
import { useAddToRecentlyViewedMutation } from "@/redux/api/productApi";
// import { addToRecentlyViewedLocal } from "@/redux/reducer/productReducer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Heart, Star } from "lucide-react";
import { ProductCardProps } from "@/types/product";
import toast from "react-hot-toast";
import { RootState } from "@/redux/store";

import { cdn } from "@/lib/imageUrl";

const ProductCard: React.FC<ProductCardProps> = ({
  _id,
  name,
  images,
  thumbnail,
  ratings,
  numOfReviews,
  reviews,
  sellingPrice,
  maximumRetailPrice,
  discount,
  viewMode = 'grid'
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.user);

  const [addToWishlistServer] = useAddToWishlistMutation();
  const [addToRecentlyViewedServer] = useAddToRecentlyViewedMutation();

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      try {
        const res = await addToWishlistServer(_id).unwrap();
        toast.success(res?.message || "Added to wishlist");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to add to wishlist");
      }
    } else {
      toast.error("Please login to add to wishlist");
    }
  };

  const handleCardClick = async () => {
    if (isAuthenticated) {
      await addToRecentlyViewedServer(_id);
    } else {
      // dispatch(addToRecentlyViewedLocal({
      //   _id, name, price, images, ratings, numOfReviews, isLocal: true
      // } as any));
    }
  };

  const ratingValue = ratings?.average || 0;
  const reviewsCount = ratings?.count || numOfReviews || reviews?.length || 0;

  if (viewMode === 'list') {
    return (
      <Link
        href={`/product/${_id}`}
        onClick={handleCardClick}
        className="bg-white dark:bg-slate-900 p-4 hover:shadow-md transition-shadow block border-b border-gray-100 dark:border-slate-800 last:border-b-0 group"
      >
        <div className="flex flex-row sm:flex-row gap-3 sm:gap-6">
          {/* Image Container */}
          <div className="relative w-28 h-28 sm:w-48 sm:h-48 flex-shrink-0 bg-gray-50 dark:bg-slate-800 rounded-sm overflow-hidden">
            <Image
              src={
                thumbnail?.public_id
                  ? cdn(thumbnail.public_id, "ecom_thumb", 300)
                  : (images?.[0]?.public_id ? cdn(images[0].public_id, "ecom_thumb", 300) : (images?.[0]?.url || '/placeholder.png'))
              }
              alt={name}
              fill
              className="object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 112px, 192px"
            />
          </div>

          {/* Details Container */}
          <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
            <h3 className="text-sm sm:text-lg font-normal text-gray-800 dark:text-slate-200 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{name}</h3>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 sm:px-2 py-0.5 rounded-sm text-[10px] sm:text-xs font-semibold">
                <span>{ratingValue.toFixed(1)}</span>
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              </div>
              <span className="text-[10px] sm:text-sm text-gray-500 dark:text-slate-400 font-medium">({reviewsCount.toLocaleString()})</span>
            </div>

            <div className="flex items-baseline gap-2 sm:gap-3 pt-1 sm:pt-2">
              <span className="text-base sm:text-2xl font-bold dark:text-slate-100">₹{sellingPrice?.toLocaleString()}</span>
              {maximumRetailPrice && (
                <span className="text-gray-500 dark:text-slate-500 line-through text-[10px] sm:text-base">₹{maximumRetailPrice?.toLocaleString()}</span>
              )}
              {discount && (
                <span className="text-green-600 text-[10px] sm:text-base font-semibold">{discount}% off</span>
              )}
            </div>

            <div className="text-[10px] sm:text-sm text-gray-600 dark:text-slate-400 pt-1 sm:pt-2 hidden xs:block">
              <span className="text-green-700 dark:text-green-500 font-medium">Free delivery</span> and daily deals.
            </div>
          </div>

          {/* Actions Container */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
            <div
              onClick={handleWishlistClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              title="Add to wishlist"
            >
              <Heart className="w-5 h-5 text-gray-400 dark:text-slate-500 hover:text-red-500" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/product/${_id}`}
      onClick={handleCardClick}
      className="bg-white dark:bg-slate-900 rounded-sm shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col h-full overflow-hidden border border-transparent hover:border-gray-100 dark:hover:border-slate-800"
    >
      <div className="relative p-3 sm:p-4 flex flex-col h-full">
        {/* Wishlist Button - Top Right */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistClick}
            className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700"
            title="Add to wishlist"
          >
            <Heart className="w-4 h-4 text-gray-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-500" />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative aspect-square mb-3 bg-gray-50 dark:bg-slate-800/50 rounded-sm overflow-hidden">
          <Image
            src={
              thumbnail?.public_id
                ? cdn(thumbnail.public_id, "ecom_thumb", 300)
                : (images?.[0]?.public_id ? cdn(images[0].public_id, "ecom_thumb", 300) : (images?.[0]?.url || '/placeholder.png'))
            }
            alt={name}
            fill
            className="object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>

        {/* Title */}
        <h3 className="text-sm text-gray-800 dark:text-slate-200 mb-2 line-clamp-2 font-normal hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-h-[2.5rem]">
          {name}
        </h3>

        {/* Rating Row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded-sm text-xs font-semibold">
            <span>{ratingValue.toFixed(1)}</span>
            <Star className="w-2.5 h-2.5 fill-current" />
          </div>
          <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">({reviewsCount.toLocaleString()})</span>
        </div>

        {/* Price Row */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold dark:text-slate-100">₹{sellingPrice?.toLocaleString()}</span>
            {maximumRetailPrice && (
              <span className="text-gray-500 dark:text-slate-500 line-through text-xs">₹{maximumRetailPrice?.toLocaleString()}</span>
            )}
          </div>
          {discount && (
            <span className="text-green-600 text-xs font-bold">{discount}% off</span>
          )}
        </div>
      </div>
    </Link>
  );
};
export default ProductCard;