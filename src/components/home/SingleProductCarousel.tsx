"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SingleProductCarouselProps {
    products: {
        heading: string;
        items: {
            image: string | { url: string; public_id: string };
            title: string;
            subtitle: string;
            redirectLink: string;
        }[];
    };
}

const SingleProductCarousel: React.FC<SingleProductCarouselProps> = ({ products }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const items = products.items;

    const getImageUrl = (image: string | { url: string; public_id: string }) =>
        typeof image === "string" ? image : image.url;

    const goTo = useCallback((idx: number) => {
        setActiveIndex(idx);
    }, []);

    const next = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const prev = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);

    // Auto-advance
    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [items.length, next]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [next, prev]);

    if (!items || items.length === 0) return null;

    const current = items[activeIndex];

    return (
        <div className="w-full px-2 lg:px-4 py-4">
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden rounded-lg md:rounded-none">
                {/* Section Header */}
                {products.heading && (
                    <div className="px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">
                            {products.heading}
                        </h2>
                        {items.length > 1 && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mr-2 hidden sm:inline">
                                    {activeIndex + 1} / {items.length}
                                </span>
                                <button
                                    onClick={prev}
                                    aria-label="Previous image"
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={next}
                                    aria-label="Next image"
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col md:flex-row">
                    {/* Left: Gallery */}
                    <div className="flex-1 flex flex-col-reverse sm:flex-row">
                        {/* Thumbnail Strip — vertical on sm+, horizontal on mobile */}
                        {items.length > 1 && (
                            <div className="flex sm:flex-col gap-1 p-2 sm:p-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[480px] no-scrollbar shrink-0">
                                {items.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => goTo(idx)}
                                        onMouseEnter={() => goTo(idx)}
                                        className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${idx === activeIndex
                                                ? "border-orange-500 shadow-sm"
                                                : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                                            }`}
                                        aria-label={`View image ${idx + 1}`}
                                    >
                                        <Image
                                            src={getImageUrl(item.image)}
                                            alt={item.title || `Image ${idx + 1}`}
                                            fill
                                            className="object-contain p-1 bg-gray-50 dark:bg-slate-900/40"
                                            sizes="64px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Image */}
                        <div className="relative flex-1">
                            <Link
                                href={current.redirectLink || "#"}
                                className="block relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-slate-900/40 group/img cursor-pointer"
                            >
                                {items.map((item, iIdx) => (
                                    <div
                                        key={iIdx}
                                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${iIdx === activeIndex
                                                ? "opacity-100 z-10"
                                                : "opacity-0 z-0"
                                            }`}
                                    >
                                        <Image
                                            src={getImageUrl(item.image)}
                                            alt={item.title}
                                            fill
                                            className="object-contain p-6 sm:p-10 group-hover/img:scale-105 transition-transform duration-700"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            priority={iIdx === 0}
                                        />
                                    </div>
                                ))}

                                {/* Hover navigation overlays */}
                                {items.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.preventDefault(); prev(); }}
                                            className="absolute left-0 top-0 bottom-0 w-12 z-20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-gradient-to-r from-black/5 to-transparent"
                                            aria-label="Previous"
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md">
                                                <ChevronLeft size={16} className="text-slate-700 dark:text-slate-200" />
                                            </div>
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); next(); }}
                                            className="absolute right-0 top-0 bottom-0 w-12 z-20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-gradient-to-l from-black/5 to-transparent"
                                            aria-label="Next"
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md">
                                                <ChevronRight size={16} className="text-slate-700 dark:text-slate-200" />
                                            </div>
                                        </button>
                                    </>
                                )}
                            </Link>

                            {/* Progress dots (mobile fallback when < 2 items don't show thumbnails) */}
                            {items.length > 1 && (
                                <div className="flex sm:hidden justify-center gap-1.5 py-3">
                                    {items.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => goTo(idx)}
                                            className={`rounded-full transition-all duration-300 ${idx === activeIndex
                                                    ? "w-5 h-1.5 bg-orange-500"
                                                    : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600"
                                                }`}
                                            aria-label={`Go to image ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="md:w-[340px] lg:w-[400px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700/50 p-5 sm:p-6 flex flex-col justify-between">
                        <div>
                            <Link href={current.redirectLink || "#"} className="group block">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-3">
                                    {current.title}
                                </h3>
                            </Link>

                            {current.subtitle && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3">
                                    {current.subtitle}
                                </p>
                            )}

                            {/* Quick Features */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="w-4 h-4 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    </div>
                                    <span>In Stock &amp; Ready to Ship</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    </div>
                                    <span>Premium Quality Guaranteed</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="w-4 h-4 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    </div>
                                    <span>Fast &amp; Free Delivery</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="space-y-3">
                            <Link
                                href={current.redirectLink || "#"}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors shadow-sm hover:shadow-md"
                            >
                                Shop Now
                                <ChevronRight size={16} />
                            </Link>
                            <Link
                                href={current.redirectLink || "#"}
                                className="block text-center w-full py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleProductCarousel;
