"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useGetAllCategoriesQuery } from '@/redux/api/productApi';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const CategoryNav: React.FC = () => {
    const { data: allCategories, isLoading } = useGetAllCategoriesQuery();

    const categories = useMemo(() => {
        if (!allCategories) return [];
        const cats = Array.isArray(allCategories) ? allCategories : (allCategories as any).categories || [];
        return cats;
    }, [allCategories]);

    const rootCategories = useMemo(() => {
        return categories.filter((cat: any) => !cat.parent || cat.level === 0 || cat.parent === null);
    }, [categories]);

    const childrenMap = useMemo(() => {
        const map: Record<string, any[]> = {};
        categories.forEach((cat: any) => {
            if (cat.parent) {
                const parentId = typeof cat.parent === 'string' ? cat.parent : cat.parent._id;
                if (parentId) {
                    if (!map[parentId]) map[parentId] = [];
                    map[parentId].push(cat);
                }
            }
        });
        return map;
    }, [categories]);

    const renderDropdown = (parentId: string, depth: number = 0) => {
        const children = childrenMap[parentId] || [];
        if (children.length === 0) return null;

        return (
            <div className={`absolute ${depth === 0 ? 'top-full left-0 pt-2' : 'top-0 left-full pl-0.5'} min-w-[200px] z-[100] opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible group-hover/sublink:opacity-100 group-hover/sublink:visible transition-all duration-200`}>
                <div className="bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800 py-1.5 rounded-md">
                    {children.map((child: any) => (
                        <div key={child._id} className="relative group/sublink">
                            <Link
                                href={`/product?category=${child._id}`}
                                className="flex items-center justify-between px-4 py-2 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary transition-colors font-medium"
                            >
                                <span className="truncate">{child.name}</span>
                                {childrenMap[child._id] && <ChevronRight size={14} className="text-gray-400" />}
                            </Link>
                            {renderDropdown(child._id, depth + 1)}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 h-11 flex items-center">
                <div className="container-custom mx-auto flex gap-8">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <Skeleton key={i} className="h-3 w-20 rounded-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (rootCategories.length === 0) return null;

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm  z-40">
            <div className="container-custom mx-auto">
                <div className="flex items-center overflow-x-auto md:overflow-visible no-scrollbar py-0 gap-6 sm:gap-8 min-h-[44px]">
                    {rootCategories.map((category: any) => {
                        const hasChildren = (childrenMap[category._id]?.length || 0) > 0;
                        const categoryName = typeof category === 'string' ? category : category.name;
                        const categoryId = typeof category === 'string' ? category : category._id;

                        return (
                            <div key={categoryId} className="group/cat relative flex items-center h-full py-2.5">
                                <Link
                                    href={`/product?category=${categoryId}`}
                                    className="flex items-center gap-1 group/link cursor-pointer"
                                >
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover/cat:text-primary transition-colors capitalize whitespace-nowrap">
                                        {categoryName}
                                    </span>
                                    {hasChildren && (
                                        <ChevronDown
                                            size={14}
                                            className="text-gray-400 group-hover/cat:text-primary transition-transform duration-300 group-hover/cat:rotate-180"
                                        />
                                    )}
                                </Link>

                                {/* Dropdown logic */}
                                <div className="hidden md:block">
                                    {renderDropdown(categoryId)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default CategoryNav;
