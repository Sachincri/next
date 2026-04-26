"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { QuadCard } from "@/types/home";

interface QuadGridProps {
    quads: QuadCard[];
    mobileColumns?: 1 | 2;
}

const QuadGrid: React.FC<QuadGridProps> = ({ quads, mobileColumns }) => {
    // Carousel state: track which image is active per carousel column
    const [carouselIndices, setCarouselIndices] = React.useState<Record<number, number>>({});

    // Auto-advance carousels
    React.useEffect(() => {
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

    // Enforce max 4 columns
    const displayQuads = quads.slice(0, 4);

    // Helper to extract image URL
    const getImgUrl = (img: string | { url: string; public_id: string }) =>
        typeof img === 'string' ? img : img.url;

    // Responsive grid classes based on column count
    const gridCols =
        displayQuads.length === 1 ? '' :
            displayQuads.length === 2 ? 'md:grid-cols-2' :
                displayQuads.length === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
                    'md:grid-cols-2 lg:grid-cols-4';

    const isAllCarousel = displayQuads.length > 0 && displayQuads.every(q => q.layout === 'carousel');
    const colsOnMobile = mobileColumns !== undefined ? mobileColumns : (isAllCarousel ? 1 : 2);

    return (
        <div className="w-full px-0 sm:px-2 lg:px-4 py-0 sm:py-4">
            <div className={`grid ${colsOnMobile === 1 ? 'grid-cols-1 sm:grid-cols-2 gap-2' : 'grid-cols-2 gap-0'} ${gridCols} sm:gap-4 lg:gap-5`}>
                {displayQuads.map((quad, idx) => {
                    const activeIndex = carouselIndices[idx] || 0;
                    const validItems = (quad.items || []).filter(it => {
                        const img = it.image;
                        if (!img) return false;
                        return typeof img === 'string' ? img !== "" : (img.url && img.url !== "");
                    });

                    if (validItems.length === 0) return null;

                    return (
                        <div key={quad._id || idx} className="bg-white dark:bg-slate-800 p-2 lg:p-3 flex flex-col h-full shadow-sm rounded-sm sm:rounded-none transition-shadow">
                            {/* Column Title */}
                            <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-2 leading-snug h-[2.5rem] overflow-hidden">
                                {quad.title}
                            </h2>

                            {/* ─── TYPE 3: CAROUSEL ─── */}
                            {/* Main image from first index, all images as thumbnails below */}
                            {/* Only added through Product Table → Move to Home */}
                            {quad.layout === 'carousel' ? (
                                <div className="flex flex-col flex-1">
                                    {/* Main Image */}
                                    <Link
                                        href={validItems[activeIndex % validItems.length]?.redirectLink || "#"}
                                        className="relative aspect-[3/4] lg:aspect-square overflow-hidden mb-2 group cursor-pointer"
                                    >
                                        {validItems.map((item, iIdx) => (
                                            <div
                                                key={item._id || iIdx}
                                                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${iIdx === (activeIndex % validItems.length)
                                                    ? "opacity-100 z-10"
                                                    : "opacity-0 z-0"
                                                    }`}
                                            >
                                                {item.image && (
                                                    <Image
                                                        src={getImgUrl(item.image)}
                                                        alt={item.title || `Product image ${iIdx + 1}`}
                                                        fill
                                                        className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-500"
                                                        sizes="(max-width: 768px) 100vw, 25vw"
                                                        priority={iIdx === 0}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </Link>

                                    {/* Thumbnail Strip — all product images */}
                                    {validItems.length > 1 && (
                                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                                            {validItems.slice(0, 8).map((item, iIdx) => (
                                                <button
                                                    key={item._id || iIdx}
                                                    onClick={() => setCarouselIndices(p => ({ ...p, [idx]: iIdx }))}
                                                    onMouseEnter={() => setCarouselIndices(p => ({ ...p, [idx]: iIdx }))}
                                                    className={`relative aspect-square overflow-hidden border-2 transition-all duration-200 ${iIdx === (activeIndex % validItems.length)
                                                        ? "border-orange-500"
                                                        : "border-gray-100 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                                                        }`}
                                                >
                                                    {item.image && (
                                                        <Image
                                                            src={getImgUrl(item.image)}
                                                            alt={`Thumbnail ${iIdx + 1}`}
                                                            fill
                                                            className="object-contain p-0.5 bg-gray-50 dark:bg-slate-900/40"
                                                            sizes="50px"
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Product title */}
                                    <div className="text-center mt-auto">
                                        <span className="text-xs lg:text-sm text-gray-900 dark:text-white font-bold block line-clamp-1">
                                            {validItems[activeIndex % validItems.length]?.title}
                                        </span>
                                    </div>
                                </div>

                                /* ─── TYPE 2: SINGLE PRODUCT ─── */
                            ) : quad.layout === 'single' ? (
                                <div className="flex flex-col flex-1">
                                    <Link
                                        href={validItems[0]?.redirectLink || "#"}
                                        className="relative aspect-[3/4] lg:aspect-square overflow-hidden mb-2 group flex-1"
                                    >
                                        {validItems[0]?.image && (
                                            <Image
                                                src={getImgUrl(validItems[0].image)}
                                                alt={validItems[0].title}
                                                fill
                                                className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 25vw"
                                            />
                                        )}
                                    </Link>
                                    <div className="text-center mt-auto">
                                        <span className="text-xs lg:text-sm text-gray-900 dark:text-white font-bold block line-clamp-1">
                                            {validItems[0]?.title}
                                        </span>
                                    </div>
                                </div>

                                /* ─── TYPE 1: FOUR PRODUCT GRID (2×2) ─── */
                            ) : (
                                <div className={`grid ${validItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4 flex-1`}>
                                    {validItems.slice(0, 4).map((item, iIdx) => (
                                        <Link
                                            key={item._id || iIdx}
                                            href={item.redirectLink || "#"}
                                            className="group flex flex-col text-center"
                                        >
                                            <div className="relative aspect-[3/4] lg:aspect-square overflow-hidden mb-1">
                                                {item.image && (
                                                    <Image
                                                        src={getImgUrl(item.image)}
                                                        alt={item.title}
                                                        fill
                                                        className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
                                                    />
                                                )}
                                            </div>
                                            <span className="text-[10px] lg:text-[11px] text-gray-700 dark:text-slate-300 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {item.title}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* See More link */}
                            <div className="mt-3 pt-1 flex justify-end">
                                <Link
                                    href={quad.redirectLink || "#"}
                                    className="text-blue-600 hover:text-orange-600 dark:text-blue-400 dark:hover:text-orange-400 text-xs font-medium transition-colors"
                                >
                                    {quad.redirectText || "See more"}
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
