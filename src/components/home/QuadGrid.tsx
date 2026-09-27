"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuadCard } from "@/types/home";

interface QuadGridProps {
    quads: QuadCard[];
    mobileColumns?: 1 | 2;
}

const QuadGrid: React.FC<QuadGridProps> = ({ quads, mobileColumns = 1 }) => {
    // Carousel state: track active image per quad card
    const [carouselIndices, setCarouselIndices] = useState<Record<number, number>>({});
    const [rowStartIndex, setRowStartIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-advance thumbnails for carousel layout quads
    useEffect(() => {
        const carouselQuads = quads.filter(q => q.layout === 'carousel');
        if (carouselQuads.length === 0) return;

        const interval = setInterval(() => {
            setCarouselIndices(prev => {
                const next = { ...prev };
                quads.forEach((quad, idx) => {
                    if (quad.layout === 'carousel' && quad.items.length > 0) {
                        next[idx] = ((prev[idx] || 0) + 1) % quad.items.length;
                    }
                });
                return next;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [quads]);

    if (!quads || quads.length === 0) return null;

    // Helper to extract image URL
    const getImgUrl = (img: string | { url: string; public_id: string }) =>
        typeof img === 'string' ? img : img?.url || '';

    // Max 4 cards in view on desktop
    const itemsPerViewDesktop = 4;
    const maxStartIndex = Math.max(0, quads.length - itemsPerViewDesktop);

    const nextRow = () => {
        setRowStartIndex(prev => Math.min(prev + 1, maxStartIndex));
    };

    const prevRow = () => {
        setRowStartIndex(prev => Math.max(prev - 1, 0));
    };

    const canGoPrev = rowStartIndex > 0;
    const canGoNext = rowStartIndex < maxStartIndex;

    // Dynamic mobile columns configuration with minimal gap on mobile
    const mobileGridClass = mobileColumns === 2 ? 'grid-cols-2 gap-1.5 sm:gap-4' : 'grid-cols-1 gap-2 sm:gap-4';

    return (
        <div className="w-full relative px-2 sm:px-4 py-1 sm:py-2 group/quads">
            {/* Desktop Navigation Arrows (When quads > 4) */}
            {quads.length > itemsPerViewDesktop && (
                <>
                    {canGoPrev && (
                        <button
                            onClick={prevRow}
                            aria-label="Previous quads"
                            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-16 bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 shadow-md hover:shadow-xl rounded-r-lg border border-slate-200 dark:border-slate-700 items-center justify-center transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}

                    {canGoNext && (
                        <button
                            onClick={nextRow}
                            aria-label="Next quads"
                            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-16 bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 shadow-md hover:shadow-xl rounded-l-lg border border-slate-200 dark:border-slate-700 items-center justify-center transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </>
            )}

            {/* Dynamic Mobile & Desktop Grid */}
            <div
                ref={scrollContainerRef}
                className={`grid ${mobileGridClass} sm:grid-cols-2 lg:grid-cols-4`}
            >
                {(quads.length > itemsPerViewDesktop ? quads.slice(rowStartIndex, rowStartIndex + itemsPerViewDesktop) : quads).map((quad, idx) => {
                    const actualIdx = rowStartIndex + idx;
                    const activeIndex = carouselIndices[actualIdx] || 0;
                    const validItems = (quad.items || []).filter(it => {
                        const img = it.image;
                        if (!img) return false;
                        return typeof img === 'string' ? img !== "" : (img.url && img.url !== "");
                    });

                    if (validItems.length === 0) return null;

                    return (
                        <div
                            key={quad._id || actualIdx}
                            className={`bg-white dark:bg-slate-800 ${
                                mobileColumns === 2 
                                    ? 'p-1.5 sm:p-4 min-h-[240px] sm:min-h-[440px]' 
                                    : 'p-2.5 sm:p-4 min-h-[300px] sm:min-h-[440px]'
                            } flex flex-col justify-between h-full rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm border border-slate-200/60 dark:border-slate-700/60 transition-all`}
                        >
                            {/* Card Header Title */}
                            <div>
                                <h2 className={`${mobileColumns === 2 ? 'text-xs sm:text-base lg:text-lg' : 'text-sm sm:text-lg'} font-bold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1`}>
                                    {quad.title}
                                </h2>
                            </div>

                            {/* Card Body by Layout Type */}
                            <div className="flex-1 flex flex-col justify-center my-0.5">
                                {/* ─── TYPE 1: CAROUSEL WITH THUMBNAILS ─── */}
                                {quad.layout === 'carousel' ? (
                                    <div className="flex flex-col flex-1 justify-between">
                                        {/* Main Preview Image */}
                                        <Link
                                            href={validItems[activeIndex % validItems.length]?.redirectLink || "#"}
                                            className="relative w-full aspect-square overflow-hidden rounded-md bg-slate-50 dark:bg-slate-900/40 mb-1 block group"
                                        >
                                            {validItems.map((item, iIdx) => (
                                                <div
                                                    key={item._id || iIdx}
                                                    className={`absolute inset-0 transition-opacity duration-300 ${
                                                        iIdx === (activeIndex % validItems.length)
                                                            ? "opacity-100 z-10"
                                                            : "opacity-0 z-0"
                                                    }`}
                                                >
                                                    {item.image && (
                                                        <Image
                                                            src={getImgUrl(item.image)}
                                                            alt={item.title || `Product ${iIdx + 1}`}
                                                            fill
                                                            className="object-contain p-1"
                                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                                            priority={iIdx === 0}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </Link>

                                        {/* Thumbnail Navigation Strip */}
                                        {validItems.length > 1 && (
                                            <div className="grid grid-cols-4 gap-0.5 sm:gap-1 mb-1">
                                                {validItems.slice(0, 4).map((item, iIdx) => (
                                                    <button
                                                        key={item._id || iIdx}
                                                        onClick={() => setCarouselIndices(p => ({ ...p, [actualIdx]: iIdx }))}
                                                        onMouseEnter={() => setCarouselIndices(p => ({ ...p, [actualIdx]: iIdx }))}
                                                        className={`relative aspect-square overflow-hidden rounded border transition-all ${
                                                            iIdx === (activeIndex % validItems.length)
                                                                ? "border-orange-500 shadow-xs"
                                                                : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                                                        }`}
                                                    >
                                                        {item.image && (
                                                            <Image
                                                                src={getImgUrl(item.image)}
                                                                alt={`Thumb ${iIdx + 1}`}
                                                                fill
                                                                className="object-contain p-0.5 bg-slate-50 dark:bg-slate-900/40"
                                                                sizes="40px"
                                                            />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Active Product Title */}
                                        <div className="text-center">
                                            <span className={`${mobileColumns === 2 ? 'text-[10px] sm:text-sm' : 'text-xs sm:text-sm'} font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 block leading-tight`}>
                                                {validItems[activeIndex % validItems.length]?.title}
                                            </span>
                                        </div>
                                    </div>

                                /* ─── TYPE 2: SINGLE HERO PRODUCT ─── */
                                ) : quad.layout === 'single' ? (
                                    <div className="flex flex-col flex-1 justify-between">
                                        <Link
                                            href={validItems[0]?.redirectLink || "#"}
                                            className="relative w-full aspect-square overflow-hidden rounded-md bg-slate-50 dark:bg-slate-900/40 mb-1 block group"
                                        >
                                            {validItems[0]?.image && (
                                                <Image
                                                    src={getImgUrl(validItems[0].image)}
                                                    alt={validItems[0].title}
                                                    fill
                                                    className="object-contain p-1.5"
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                                />
                                            )}
                                        </Link>
                                        <div className="text-center mt-auto">
                                            <span className={`${mobileColumns === 2 ? 'text-[10px] sm:text-sm' : 'text-xs sm:text-sm'} font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 block leading-tight`}>
                                                {validItems[0]?.title}
                                            </span>
                                        </div>
                                    </div>

                                /* ─── TYPE 3: 2×2 FOUR PRODUCT GRID ─── */
                                ) : (
                                    <div className="grid grid-cols-2 gap-1 sm:gap-3 flex-1">
                                        {validItems.slice(0, 4).map((item, iIdx) => (
                                            <Link
                                                key={item._id || iIdx}
                                                href={item.redirectLink || "#"}
                                                className="group flex flex-col text-center p-0.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                                            >
                                                <div className="relative aspect-square overflow-hidden rounded bg-slate-50 dark:bg-slate-900/40 mb-0.5">
                                                    {item.image && (
                                                        <Image
                                                            src={getImgUrl(item.image)}
                                                            alt={item.title}
                                                            fill
                                                            className="object-contain p-0.5"
                                                            sizes="(max-width: 640px) 25vw, 15vw"
                                                        />
                                                    )}
                                                </div>
                                                <span className={`${mobileColumns === 2 ? 'text-[9px] sm:text-[11px]' : 'text-[10px] sm:text-[11px]'} text-slate-700 dark:text-slate-300 font-medium line-clamp-1 group-hover:text-blue-600 transition-colors`}>
                                                    {item.title}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Card Footer: Shop All / See More Link */}
                            <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/40 flex justify-end">
                                <Link
                                    href={quad.redirectLink || "#"}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold text-[11px] sm:text-xs transition-colors"
                                >
                                    {quad.redirectText || "Shop all"}
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuadGrid;
