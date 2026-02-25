import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ProductCard {
  id: string
  image: string
  title: string
  subtitle: string

  redirectLink: string
}

interface ProductItem {
  heading: string
  items: ProductCard[]
}

interface ProductSliderProps {
  products?: ProductItem
}

export const HomeProducts: React.FC<ProductSliderProps> = ({ products }) => {
  const [productStartIndex, setProductStartIndex] = useState(0)

  // Responsive items per view
  const getItemsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 2.5 // Mobile: show 2.5 items
      if (window.innerWidth < 768) return 3   // Small tablet: show 3 items
      if (window.innerWidth < 1024) return 4  // Tablet: show 4 items
      return 6 // Desktop: show 6 items
    }
    return 6
  }

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView())

  React.useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView())
      setProductStartIndex(0) // Reset to start when screen size changes
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const nextProducts = () => {
    setProductStartIndex(prev => {
      const maxIndex = Math.max(0, (products?.items?.length || 0) - Math.floor(itemsPerView))
      return Math.min(prev + Math.floor(itemsPerView), maxIndex)
    })
  }

  const prevProducts = () => {
    setProductStartIndex(prev => Math.max(0, prev - Math.floor(itemsPerView)))
  }

  const canGoPrev = productStartIndex > 0
  const canGoNext = productStartIndex + Math.floor(itemsPerView) < (products?.items?.length || 0)

  if (!products?.items?.length) {
    return null
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Heading */}
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-slate-100">
            {products.heading}
          </h2>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm">
            VIEW ALL
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Mobile: Horizontal scroll container */}
        <div className="block sm:hidden">
          <div className="flex gap-3 px-4 pb-6 overflow-x-auto snap-x snap-mandatory">
            {products.items.map(product => (
              <Link href={product.redirectLink}
                key={product.id}
                className="bg-white dark:bg-slate-800 text-center flex-shrink-0 w-32 transition-all duration-300 group cursor-pointer snap-start"
              >
                <div className="relative overflow-hidden bg-gray-100 dark:bg-slate-700 rounded-md h-32">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="128px"
                  />
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-gray-800 dark:text-slate-200 mb-1 text-xs line-clamp-2 leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400 text-xs line-clamp-1">{product.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop: Grid with navigation */}
        <div className="hidden sm:block relative px-2 pb-6">
          {/* Product Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {products.items
              .slice(productStartIndex, productStartIndex + Math.floor(itemsPerView))
              .map(product => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-slate-800 text-center transition-all duration-300 group cursor-pointer"
                >
                  <div className="relative overflow-hidden bg-gray-100 dark:bg-slate-700 rounded-md h-32 sm:h-36 md:h-60">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain group-hover:scale-102 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  </div>
                  <div className="p-2 sm:p-3">
                    <h3 className="font-medium text-gray-800 dark:text-slate-200 mb-1 sm:mb-2 text-xs sm:text-sm line-clamp-2 leading-tight">
                      {product.title}
                    </h3>
                    <p className="text-gray-500 dark:text-slate-400 text-xs line-clamp-1">{product.subtitle}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Navigation Buttons - Only on larger screens */}
          {canGoPrev && (
            <button
              onClick={prevProducts}
              className="absolute rounded-r-sm left-1 top-1/2 transform -translate-y-1/2 -translate-x-1 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 w-8 sm:w-11 h-16 sm:h-24 flex items-center justify-center shadow-md dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 transition-all z-10"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-slate-400" />
            </button>
          )}

          {canGoNext && (
            <button
              onClick={nextProducts}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 translate-x-1 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 w-8 sm:w-11 h-16 sm:h-24 flex items-center rounded-l-sm justify-center shadow-md dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 transition-all z-10"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}