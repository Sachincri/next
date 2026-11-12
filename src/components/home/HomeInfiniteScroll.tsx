"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "@/components/product/ProductCard";
import { useGetProductsQuery } from "@/redux/api/productApi";
import { Product } from "@/types";
import { Loader2, ArrowUpCircle, CheckCircle2 } from "lucide-react";

export const HomeInfiniteScroll: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<Product[]>([]);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isFetching } = useGetProductsQuery({
    currentPage,
    limit: 20,
  });

  const productsCount = data?.filteredProductsCount ?? data?.productsCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(productsCount / 20));
  const hasMore = currentPage < totalPages;

  // Append new products safely without duplicates
  useEffect(() => {
    if (data?.products && data.products.length > 0) {
      setItems((prev) => {
        if (currentPage === 1) {
          return data.products;
        }
        // Deduplicate by _id
        const existingIds = new Set(prev.map((p) => String(p._id)));
        const uniqueNew = data.products.filter((p) => !existingIds.has(String(p._id)));
        return [...prev, ...uniqueNew];
      });
    }
  }, [data?.products, currentPage]);

  // Load next page
  const loadNextPage = useCallback(() => {
    if (isFetching || isLoading || !hasMore) return;
    setCurrentPage((prev) => prev + 1);
  }, [isFetching, isLoading, hasMore]);

  // IntersectionObserver for infinite scrolling (NO LOOPING)
  useEffect(() => {
    if (!hasMore) return;

    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [loadNextPage, hasMore]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="w-full my-3 sm:my-4 rounded-none sm:rounded-2xl bg-white dark:bg-slate-900/60 p-2.5 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800" aria-label="Products Catalogue">
      {/* Product Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {items.map((product) => (
            <div
              key={product._id}
              className="transition-transform duration-200 hover:-translate-y-1"
            >
              <ProductCard {...product} viewMode="grid" />
            </div>
          ))}
        </div>
      ) : isLoading ? (
        /* Initial Loading Skeleton */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800 h-72 flex flex-col justify-between"
            >
              <div className="w-full h-40 bg-slate-200 dark:bg-slate-700/50 rounded-lg mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700/50 rounded w-1/2" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700/50 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 text-sm">
          No products found in catalogue.
        </div>
      )}

      {/* Bottom Loading / End of Catalogue Status */}
      <div className="w-full pt-6 pb-2 flex flex-col items-center justify-center min-h-[50px]">
        {hasMore ? (
          <div ref={observerRef} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 py-3">
            {isFetching && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                <span>Loading more products...</span>
              </>
            )}
          </div>
        ) : items.length > 0 ? (
          /* Clean End State */
          <div className="flex flex-col items-center gap-2 text-center py-4 border-t border-slate-100 dark:border-slate-800/60 w-full mt-4">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>You've reached the end! All {items.length} products loaded.</span>
            </div>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 font-medium transition-colors"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Back to top</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default HomeInfiniteScroll;
