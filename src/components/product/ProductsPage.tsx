'use client';

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { useGetProductsQuery, useGetAllBrandsQuery, useGetAllCategoriesQuery } from "@/redux/api/productApi";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, ChevronUp, Grid3X3, List, MoreHorizontal, X, SlidersHorizontal } from "lucide-react";
import Sidebar from "./Sidebar";
import Breadcrumb from "../layout/Breadcrumb";
import { useAppSelector, RootState } from "@/redux";
import { useProductFilters } from "@/hooks/useProductFilters";
import { Product } from "@/types";
import CategoryNav from "../layout/CategoryNav";

interface ProductsPageProps {
  params?: {
    keyword?: string;
  };
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ params = {} }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    keyword,
    page: currentPage,
    price,
    category,
    brand,
    ratings,
    discount,
  } = useProductFilters();

  const { data: allBrands = [] } = useGetAllBrandsQuery();
  const { data: allCategories = [] } = useGetAllCategoriesQuery();

  const { data: serverProductsData, isLoading: loading, error: productsError } = useGetProductsQuery({
    keyword,
    currentPage,
    price: price as [number, number],
    category,
    brand,
    ratings,
    discount,
  });

  const {
    products,
    resultPerPage,
    filteredProductsCount,
    productsCount
  } = serverProductsData || { products: [], resultPerPage: 20, filteredProductsCount: 0, productsCount: 0 };

  const { error: profileError, message } = useAppSelector((state: RootState) => state.user);
  const error = productsError || profileError;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Generic URL param updater
  const updateParams = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  // Handlers
  const handlePriceChange = useCallback((_: Event | null, newPrice: number | number[]) => {
    const [min, max] = Array.isArray(newPrice) ? newPrice : [newPrice, 100000];
    updateParams({ minPrice: min, maxPrice: max, page: 1 });
  }, [updateParams]);

  const handleBrandClick = useCallback((brandId: string) => {
    updateParams({ brand: brandId || null, page: 1 });
  }, [updateParams]);

  const handlePageChange = useCallback((newPage: number) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateParams]);

  const handleRatingChange = useCallback((value: number, event: React.ChangeEvent<HTMLInputElement>) => {
    updateParams({ ratings: event.target.checked ? value : null, page: 1 });
  }, [updateParams]);

  const handleDiscountChange = useCallback((value: number, event: React.ChangeEvent<HTMLInputElement>) => {
    updateParams({ discount: event.target.checked ? value : null, page: 1 });
  }, [updateParams]);

  const handlePriceCheckbox = useCallback((value: number[], event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      updateParams({ minPrice: value[0], maxPrice: value[1], page: 1 });
    } else {
      updateParams({ minPrice: null, maxPrice: null, page: 1 });
    }
  }, [updateParams]);

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    router.push(`?${params.toString()}`);
  }, [router, keyword]);

  const clearPriceFilters = useCallback(() => {
    updateParams({ minPrice: null, maxPrice: null, page: 1 });
  }, [updateParams]);

  const clearRatingFilters = useCallback(() => {
    updateParams({ ratings: null, page: 1 });
  }, [updateParams]);

  const clearDiscountFilters = useCallback(() => {
    updateParams({ discount: null, page: 1 });
  }, [updateParams]);

  const clearBrandFilters = useCallback(() => {
    updateParams({ brand: null, page: 1 });
  }, [updateParams]);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  // ── Active filter chips ────────────────────────────────────────────
  const activeFilters = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];

    if (keyword) {
      chips.push({ id: 'keyword', label: `"${keyword}"`, onRemove: () => updateParams({ keyword: null, page: 1 }) });
    }
    if (brand) {
      const brandName = allBrands.find((b: any) => b._id === brand)?.name || brand;
      chips.push({ id: 'brand', label: `Brand: ${brandName}`, onRemove: clearBrandFilters });
    }
    if (category) {
      const categoryObj = (allCategories as any)?.categories?.find((c: any) => c._id === category) ||
        (Array.isArray(allCategories) ? allCategories.find((c: any) => c._id === category) : null);
      const categoryName = categoryObj?.name || category;
      chips.push({ id: 'category', label: `Category: ${categoryName}`, onRemove: () => updateParams({ category: null, page: 1 }) });
    }
    if (ratings > 0) {
      chips.push({ id: 'ratings', label: `${ratings}★ & above`, onRemove: clearRatingFilters });
    }
    if (discount > 0) {
      chips.push({ id: 'discount', label: `${discount}%+ Off`, onRemove: clearDiscountFilters });
    }
    if (price[0] > 0 || price[1] < 100000) {
      chips.push({
        id: 'price',
        label: `₹${price[0].toLocaleString()} – ₹${price[1].toLocaleString()}`,
        onRemove: clearPriceFilters,
      });
    }
    return chips;
  }, [keyword, brand, category, ratings, discount, price, allBrands, allCategories, updateParams, clearBrandFilters, clearRatingFilters, clearDiscountFilters, clearPriceFilters]);

  // Pagination
  const totalPages = useMemo(() =>
    Math.ceil((filteredProductsCount || productsCount || products?.length || 0) / (resultPerPage || 20)),
    [filteredProductsCount, productsCount, products, resultPerPage]
  );
  const startResult = useMemo(() => (currentPage - 1) * (resultPerPage || 20) + 1, [currentPage, resultPerPage]);
  const endResult = useMemo(() =>
    Math.min(currentPage * (resultPerPage || 20), filteredProductsCount || productsCount || products?.length || 0),
    [currentPage, resultPerPage, filteredProductsCount, productsCount, products]
  );

  useEffect(() => {
    if (error) {
      const err = error as any;
      toast.error(err?.data?.message || "Failed to load products");
    }
    if (message) {
      toast.success(message as string);
    }
  }, [error, message]);

  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) pages.push(1, 2, 3, 4, 5);
        else if (currentPage >= totalPages - 2) pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        else pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
      return pages;
    };
    const pageNumbers = getPageNumbers();
    if (totalPages <= 1) return null;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm p-3 sm:p-4 mt-4 sm:mt-6 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="hidden sm:block text-sm text-gray-600 dark:text-slate-400">
            Showing {startResult}–{endResult} of {filteredProductsCount || productsCount || 0} results
          </div>
          <div className="sm:hidden text-xs text-gray-600 dark:text-slate-400">Page {currentPage} of {totalPages}</div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              className="p-1.5 sm:p-2 border border-gray-300 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            {currentPage > 3 && totalPages > 5 && (
              <div className="flex items-center">
                <button onClick={() => handlePageChange(1)} className="hidden sm:block px-2 sm:px-3 py-1 border border-gray-300 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 text-sm">1</button>
                <span className="hidden sm:block px-1 text-gray-400">•••</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            {currentPage < totalPages - 2 && totalPages > 5 && (
              <div className="flex items-center">
                <span className="hidden sm:block px-1 text-gray-400">•••</span>
                <button onClick={() => handlePageChange(totalPages)} className="hidden sm:block px-2 sm:px-3 py-1 border border-gray-300 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 text-sm">{totalPages}</button>
              </div>
            )}
            <button
              className="p-1.5 sm:p-2 border border-gray-300 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <h2 className="text-lg font-medium">Loading...</h2>
          </div>
        </div>
      ) : (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <CategoryNav />
          {products?.length === 0 && activeFilters.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
              <img
                draggable="false"
                src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/error-no-search-results_2353c5.png"
                alt="Not Found"
                className="max-w-xs w-full mb-6"
              />
              <h1 className="text-xl sm:text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Sorry, no results found!</h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">Please check the spelling or try searching for something else</p>
            </div>
          ) : (
            <section className="flex">
              {/* Sidebar */}
              <div className="lg:mt-4 lg:ml-2">
                <Sidebar
                  price={price}
                  ratings={ratings}
                  discount={discount}
                  brand={brand}
                  priceHandler={handlePriceChange}
                  handleCheckboxChange={handleRatingChange}
                  handleCheckboxPrice={handlePriceCheckbox}
                  handleCheckboxChangeDis={handleDiscountChange}
                  handleBrandClick={handleBrandClick}
                  clearAllFilters={clearAllFilters}
                  clearPriceFilters={clearPriceFilters}
                  clearRatingFilters={clearRatingFilters}
                  clearDiscountFilters={clearDiscountFilters}
                  clearBrandFilters={clearBrandFilters}
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0 p-2 sm:p-4">
                {/* Top Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-sm shadow-sm p-3 sm:p-4 mb-3 border border-slate-100 dark:border-slate-800">
                  <Breadcrumb />
                  <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                      Showing {startResult}–{endResult} of {filteredProductsCount || productsCount || products?.length || 0}+ results
                      {keyword && <span className="font-semibold text-gray-800 dark:text-slate-200"> for "{keyword}"</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* View toggle */}
                      <div className="hidden sm:flex items-center gap-0.5 border border-gray-300 dark:border-slate-700 rounded overflow-hidden">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                          aria-label="Grid view"
                        >
                          <Grid3X3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                          aria-label="List view"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Sort */}
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => handleSortChange(e.target.value)}
                          className="appearance-none bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-200 rounded px-3 py-1.5 pr-7 text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="relevance">Relevance</option>
                          <option value="popularity">Popularity</option>
                          <option value="price-low-to-high">Price: Low to High</option>
                          <option value="price-high-to-low">Price: High to Low</option>
                          <option value="newest">Newest First</option>
                        </select>
                        <ChevronLeft className="absolute right-1.5 top-2 w-3 h-3 text-gray-400 pointer-events-none rotate-[-90deg]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Active Filter Chips ── */}
                {activeFilters.length > 0 && (
                  <div className="flex flex-nowrap items-center gap-2 mb-3 bg-white dark:bg-slate-900 rounded-sm shadow-sm px-3 py-2.5 overflow-x-auto scrollbar-hide border border-slate-100 dark:border-slate-800">
                    <div className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 font-medium">
                      <SlidersHorizontal size={12} />
                      Applied:
                    </div>
                    {activeFilters.map((f) => (
                      <span
                        key={f.id}
                        className="shrink-0 inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {f.label}
                        <button
                          onClick={f.onRemove}
                          className="ml-0.5 rounded-full text-blue-500 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                          aria-label={`Remove ${f.label} filter`}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                    {activeFilters.length > 1 && (
                      <button
                        onClick={clearAllFilters}
                        className="shrink-0 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium ml-1 underline-offset-2 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                )}

                {/* No results with filters applied */}
                {products?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <img
                      draggable="false"
                      src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/error-no-search-results_2353c5.png"
                      alt="No products found"
                      className="max-w-[200px] w-full mb-4 opacity-60"
                    />
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-1">No products match your filters</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Try removing some filters to see more results</p>
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3'
                        : 'space-y-0'
                    }>
                      {products?.map((product: Product) => (
                        <ProductCard key={product._id} viewMode={viewMode} {...product} />
                      ))}
                    </div>
                    <Pagination />
                  </>
                )}

                {/* Mobile scroll-to-top */}
                <div className="md:hidden fixed bottom-20 right-4 z-40">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
                    aria-label="Scroll to top"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      )}
    </>
  );
};
