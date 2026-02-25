"use client"
import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { ProductSliderProps } from "@/types/product"
import Link from "next/link"
import { cdn } from "@/lib/imageUrl"

export const ProductSlider: React.FC<ProductSliderProps> = ({ heading, products }) => {
  const [productStartIndex, setProductStartIndex] = useState(0)

  const getItemsPerView = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 2.5
      if (window.innerWidth < 768) return 3
      if (window.innerWidth < 1024) return 4
      return 6
    }
    return 6
  }

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView())

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView())
      setProductStartIndex(0)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const nextProducts = () => {
    setProductStartIndex(prev => {
      const maxIndex = Math.max(0, (products?.length || 0) - Math.floor(itemsPerView))
      return Math.min(prev + Math.floor(itemsPerView), maxIndex)
    })
  }

  const prevProducts = () => {
    setProductStartIndex(prev => Math.max(0, prev - Math.floor(itemsPerView)))
  }

  const canGoPrev = productStartIndex > 0
  const canGoNext = productStartIndex + Math.floor(itemsPerView) < (products?.length || 0)

  if (!products?.length) return null

  return (
    <div className="w-full bg-white dark:bg-slate-950 md:px-4">
      {/* Heading */}
      {heading && (
        <div className="sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4 px-2 sm:px-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">{heading}</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm">
              VIEW ALL
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Mobile: Horizontal scroll container */}
        <div className="flex sm:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-4 mx-2 no-scrollbar">
          {products.map((product, index) => (
            <Link
              key={product._id || index}
              href={`/product/${product._id}`}
              className="flex-shrink-0 w-[160px] snap-start bg-white dark:bg-slate-900 transition-all duration-300 group"
            >
              <div className="relative overflow-hidden bg-gray-50 dark:bg-slate-800 rounded-md aspect-square mb-2">
                <img
                  src={
                    product.thumbnail?.public_id
                      ? cdn(product.thumbnail.public_id, "ecom_thumb", 300)
                      : (product.images?.[0]?.public_id ? cdn(product.images[0].public_id, "ecom_thumb", 300) : (product.images?.[0]?.url || "/placeholder.png"))
                  }
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xs text-gray-800 dark:text-gray-200 mb-1 line-clamp-2 h-8">{product.name}</h3>
              <div className="flex items-center gap-1 mb-1">
                <div className="flex items-center gap-0.5 bg-green-600 text-white px-1 py-0.5 rounded text-[10px]">
                  <span>{product.ratings?.average || 0}</span>
                  <Star className="w-2 h-2 fill-current" />
                </div>
                <span className="text-[10px] text-gray-500">
                  ({product.ratings?.count || product.numOfReviews || 0})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold dark:text-white">₹{(product.sellingPrice)?.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop: Grid with navigation */}
        <div className="hidden sm:block relative px-2 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {products
              .slice(productStartIndex, productStartIndex + Math.floor(itemsPerView))
              .map((product, index) => (
                <Link key={product._id || (productStartIndex + index)} href={`/product/${product._id}`} className="bg-white dark:bg-slate-900 transition-all duration-300 group cursor-pointer">
                  <div className="relative overflow-hidden bg-gray-50 dark:bg-slate-800 rounded-md">
                    <img
                      src={
                        product.thumbnail?.public_id
                          ? cdn(product.thumbnail.public_id, "ecom_thumb", 300)
                          : (product.images?.[0]?.public_id ? cdn(product.images[0].public_id, "ecom_thumb", 300) : (product.images?.[0]?.url || "/placeholder.png"))
                      }
                      alt={product.name}
                      className="w-full h-32 sm:h-36 md:h-40 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-sm text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs">
                      <span>{product.ratings?.average || 0}</span>
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </div>
                    <span className="text-xs text-gray-500">
                      ({product.ratings?.count?.toLocaleString() || product.numOfReviews?.toLocaleString() || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base font-medium dark:text-white">₹{(product.sellingPrice)?.toLocaleString()}</span>
                    {(product.maximumRetailPrice) && (
                      <span className="text-gray-500 line-through text-sm">
                        ₹{(product.maximumRetailPrice)?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {product.discount && (
                    <span className="text-green-600 text-sm font-medium">{product.discount}% off</span>
                  )}
                </Link>
              ))}
          </div>

          {/* Navigation */}
          {canGoPrev && (
            <button
              onClick={prevProducts}
              className="z-20 absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm w-8 sm:w-11 h-16 sm:h-24 flex items-center justify-center shadow-lg border dark:border-slate-700 rounded-r-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-200" />
            </button>
          )}
          {canGoNext && (
            <button
              onClick={nextProducts}
              className="z-20 absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm w-8 sm:w-11 h-16 sm:h-24 flex items-center justify-center shadow-lg border dark:border-slate-700 rounded-l-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-200" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
