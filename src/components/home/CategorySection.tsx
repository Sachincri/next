"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGetAllCategoriesQuery } from '@/redux/api/productApi';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CategorySection: React.FC = () => {
    const { data: allCategories, isLoading } = useGetAllCategoriesQuery();

    // Filter to show only root categories (level 0)
    const rootCategories = React.useMemo(() => {
        if (!allCategories) return [];
        // Handle if API returns { categories: [] } nested or just []
        const cats = Array.isArray(allCategories) ? allCategories : (allCategories as any).categories || [];
        return cats.filter((cat: any) => !cat.parent || cat.level === 0 || cat.parent === null);
    }, [allCategories]);

    // Map of parent -> children for dropdowns
    const childrenMap = React.useMemo(() => {
        if (!allCategories) return {};
        const map: Record<string, any[]> = {};
        const cats = Array.isArray(allCategories) ? allCategories : (allCategories as any).categories || [];
        cats.forEach((cat: any) => {
            if (cat.parent) {
                const parentId = typeof cat.parent === 'string' ? cat.parent : cat.parent._id;
                if (parentId) {
                    if (!map[parentId]) map[parentId] = [];
                    map[parentId].push(cat);
                }
            }
        });
        return map;
    }, [allCategories]);

    const renderSubCategories = (subCategories: any[], depth: number = 0) => {
        // Safe fallback if depth exceeds supported levels
        const level = Math.min(depth, 4);

        const depthConfig = [
            {
                groupClass: 'group/d0',
                wrapperStyle: 'absolute left-1/2 -translate-x-1/2 top-full pt-3 w-64 opacity-0 invisible translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 z-[100] hidden sm:block',
                linkHoverStyle: 'group-hover/d0:bg-primary/5 dark:group-hover/d0:bg-slate-700 group-hover/d0:text-primary',
                chevronStyle: 'group-hover/d0:translate-x-1 group-hover/d0:text-primary'
            },
            {
                groupClass: 'group/d1',
                wrapperStyle: 'absolute left-full top-0 pl-2 w-64 opacity-0 invisible translate-x-3 transition-all duration-300 group-hover/d0:opacity-100 group-hover/d0:visible group-hover/d0:translate-x-0 z-[100] hidden sm:block',
                linkHoverStyle: 'group-hover/d1:bg-primary/5 dark:group-hover/d1:bg-slate-700 group-hover/d1:text-primary',
                chevronStyle: 'group-hover/d1:translate-x-1 group-hover/d1:text-primary'
            },
            {
                groupClass: 'group/d2',
                wrapperStyle: 'absolute left-full top-0 pl-2 w-64 opacity-0 invisible translate-x-3 transition-all duration-300 group-hover/d1:opacity-100 group-hover/d1:visible group-hover/d1:translate-x-0 z-[100] hidden sm:block',
                linkHoverStyle: 'group-hover/d2:bg-primary/5 dark:group-hover/d2:bg-slate-700 group-hover/d2:text-primary',
                chevronStyle: 'group-hover/d2:translate-x-1 group-hover/d2:text-primary'
            },
            {
                groupClass: 'group/d3',
                wrapperStyle: 'absolute left-full top-0 pl-2 w-64 opacity-0 invisible translate-x-3 transition-all duration-300 group-hover/d2:opacity-100 group-hover/d2:visible group-hover/d2:translate-x-0 z-[100] hidden sm:block',
                linkHoverStyle: 'group-hover/d3:bg-primary/5 dark:group-hover/d3:bg-slate-700 group-hover/d3:text-primary',
                chevronStyle: 'group-hover/d3:translate-x-1 group-hover/d3:text-primary'
            },
            {
                groupClass: 'group/d4',
                wrapperStyle: 'absolute left-full top-0 pl-2 w-64 opacity-0 invisible translate-x-3 transition-all duration-300 group-hover/d3:opacity-100 group-hover/d3:visible group-hover/d3:translate-x-0 z-[100] hidden sm:block',
                linkHoverStyle: 'group-hover/d4:bg-primary/5 dark:group-hover/d4:bg-slate-700 group-hover/d4:text-primary',
                chevronStyle: 'group-hover/d4:translate-x-1 group-hover/d4:text-primary'
            }
        ];

        const config = depthConfig[level];

        return (
            <div className={config.wrapperStyle}>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-slate-700 py-2 relative">
                    {subCategories.map((sub: any) => {
                        const subId = sub._id || sub;
                        const subChildren = childrenMap[subId] || [];
                        const hasChildren = subChildren.length > 0;

                        return (
                            <div key={subId} className={`relative block px-2 py-0.5 ${config.groupClass}`}>
                                <Link
                                    href={`/product?category=${subId}`}
                                    className={`flex items-center justify-between px-3 py-2 text-[14px] text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 font-medium ${config.linkHoverStyle} hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-primary`}
                                >
                                    <span className="truncate pr-2">{sub.name || sub}</span>
                                    {hasChildren && <ChevronRight size={16} className={`text-gray-400 transition-all duration-300 flex-shrink-0 ${config.chevronStyle}`} />}
                                </Link>
                                {hasChildren && renderSubCategories(subChildren, depth + 1)}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (isLoading || !rootCategories || rootCategories.length === 0) return null;

    return (
        <section className="w-full bg-white dark:bg-slate-800 shadow-sm border-b border-gray-100 dark:border-slate-700 z-[5] relative">
            <div className="container mx-auto px-2 sm:px-4">
                <div className="flex items-center sm:justify-center justify-start gap-2 sm:gap-8 overflow-x-auto sm:overflow-visible py-3 no-scrollbar relative">
                    {rootCategories.map((category: any) => {
                        const categoryName = typeof category === 'string' ? category : category.name;
                        const categoryId = typeof category === 'string' ? category : category._id;
                        const categoryImage = typeof category === 'object' && category.image?.url;
                        const subCategories = childrenMap[categoryId] || [];
                        const hasChildren = subCategories.length > 0;

                        return (
                            <div key={categoryId} className="group relative flex-shrink-0">
                                <Link
                                    href={`/product?category=${categoryId}`}
                                    className="flex flex-col items-center gap-1.5 px-2 min-w-[70px] sm:minw-[auto] cursor-pointer"
                                >
                                    {/* Image Container */}
                                    <div className="relative w-16 h-16 sm:w-16 sm:h-16 flex items-center justify-center mb-1 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:scale-105 shadow-sm group-hover:shadow-md">
                                        {categoryImage ? (
                                            <Image
                                                src={categoryImage}
                                                alt={categoryName}
                                                fill
                                                className="object-contain p-2"
                                                sizes="(max-width: 768px) 64px, 64px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary/60">
                                                {categoryName.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Name & Arrow */}
                                    <div className="flex items-center gap-0.5 sm:gap-1">
                                        <span className="text-[11px] sm:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap group-hover:text-primary transition-colors">
                                            {categoryName}
                                        </span>
                                        {hasChildren && (
                                            <ChevronDown
                                                size={12}
                                                className="text-gray-400 group-hover:text-primary transition-colors group-hover:rotate-180 duration-300 sm:w-3.5 sm:h-3.5 w-3 h-3"
                                            />
                                        )}
                                    </div>
                                </Link>

                                {/* Dropdown Menu (Desktop Hover) */}
                                {hasChildren && renderSubCategories(subCategories, 0)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;

