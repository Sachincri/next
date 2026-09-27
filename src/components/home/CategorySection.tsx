"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGetAllCategoriesQuery } from '@/redux/api/productApi';
import {
    Sparkles,
    Smartphone,
    Shirt,
    Laptop,
    Tv,
    Gamepad2,
    Utensils,
    Car,
    Dumbbell,
    Armchair,
    BookOpen,
    Bike,
    ShoppingBag,
    Home as HomeIcon,
    Flame,
    Tag
} from 'lucide-react';

// Crisp Flipkart-style outline icon mapper (24px, clean stroke)
const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    const iconClass = "w-6 h-6 text-slate-800 dark:text-slate-100 stroke-[1.6]";
    
    if (lower.includes('for you') || lower.includes('all') || lower.includes('featured')) return <ShoppingBag className={iconClass} />;
    if (lower.includes('fashion') || lower.includes('cloth') || lower.includes('wear') || lower.includes('apparel')) return <Shirt className={iconClass} />;
    if (lower.includes('mobile') || lower.includes('phone') || lower.includes('smartphone')) return <Smartphone className={iconClass} />;
    if (lower.includes('electronic') || lower.includes('laptop') || lower.includes('computer')) return <Laptop className={iconClass} />;
    if (lower.includes('beauty') || lower.includes('cosmetic') || lower.includes('perfume') || lower.includes('makeup')) return <Sparkles className={iconClass} />;
    if (lower.includes('home') || lower.includes('kitchen') || lower.includes('decor')) return <HomeIcon className={iconClass} />;
    if (lower.includes('appliance') || lower.includes('tv') || lower.includes('refrigerator')) return <Tv className={iconClass} />;
    if (lower.includes('toy') || lower.includes('baby') || lower.includes('kid')) return <Gamepad2 className={iconClass} />;
    if (lower.includes('food') || lower.includes('grocery') || lower.includes('health')) return <Utensils className={iconClass} />;
    if (lower.includes('auto') || lower.includes('car') || lower.includes('vehicle')) return <Car className={iconClass} />;
    if (lower.includes('sport') || lower.includes('fitness') || lower.includes('gym')) return <Dumbbell className={iconClass} />;
    if (lower.includes('furniture') || lower.includes('living')) return <Armchair className={iconClass} />;
    if (lower.includes('book') || lower.includes('stationery')) return <BookOpen className={iconClass} />;
    if (lower.includes('wheel') || lower.includes('bike') || lower.includes('cycle') || lower.includes('motorcycle')) return <Bike className={iconClass} />;
    if (lower.includes('deal') || lower.includes('offer') || lower.includes('trending')) return <Flame className="w-6 h-6 text-amber-500 stroke-[1.6]" />;
    return <Tag className={iconClass} />;
};

// Flipkart standard default categories list if API returns empty/few
const DEFAULT_FLIPKART_CATEGORIES = [
    { _id: 'fashion', name: 'Fashion' },
    { _id: 'mobiles', name: 'Mobiles' },
    { _id: 'electronics', name: 'Electronics' },
    { _id: 'beauty', name: 'Beauty' },
    { _id: 'home', name: 'Home' },
    { _id: 'appliances', name: 'Appliances' },
    { _id: 'toys', name: 'Toys, baby...' },
    { _id: 'food', name: 'Food & Health...' },
    { _id: 'auto', name: 'Auto Acc...' },
    { _id: 'sports', name: 'Sports & ...' },
    { _id: 'furniture', name: 'Furniture' },
    { _id: 'books', name: 'Books' },
    { _id: '2wheelers', name: '2 Wheelers' },
];

const CategorySection: React.FC = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeCategoryParam = searchParams?.get('category');

    const { data: allCategories, isLoading } = useGetAllCategoriesQuery();

    // Filter root categories from API, fallback to Flipkart list if none
    const categories = React.useMemo(() => {
        if (!allCategories) return DEFAULT_FLIPKART_CATEGORIES;
        const cats = Array.isArray(allCategories) ? allCategories : (allCategories as any).categories || [];
        const rootCats = cats.filter((cat: any) => !cat.parent || cat.level === 0 || cat.parent === null);
        return rootCats.length > 0 ? rootCats : DEFAULT_FLIPKART_CATEGORIES;
    }, [allCategories]);

    const isHomeActive = pathname === '/' && !activeCategoryParam;

    return (
        <section className="w-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200/70 dark:border-slate-800 rounded-2xl z-[5] relative overflow-hidden">
            <div className="w-full px-3 sm:px-6">
                <div className="flex items-center justify-start xl:justify-between gap-4 sm:gap-6 md:gap-7 overflow-x-auto no-scrollbar py-3 relative">
                    
                    {/* 1. "For You" Flipkart Signature Tab */}
                    <div className="flex-shrink-0">
                        <Link
                            href="/"
                            className={`flex flex-col items-center gap-1.5 px-2 py-0.5 cursor-pointer relative transition-colors ${
                                isHomeActive
                                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                                    : 'text-slate-800 dark:text-slate-200 font-medium hover:text-blue-600'
                            }`}
                        >
                            {/* Icon with Flipkart Yellow Rounded Square Accent */}
                            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-400/90 text-slate-900 shadow-xs">
                                <ShoppingBag className="w-5 h-5 stroke-[2] text-slate-900" />
                            </div>

                            {/* Label */}
                            <span className="text-[12px] sm:text-[13px] tracking-tight whitespace-nowrap">
                                For You
                            </span>

                            {/* Active Blue Indicator Line */}
                            {isHomeActive && (
                                <span className="absolute -bottom-3 left-0 right-0 h-[2.5px] bg-blue-600 dark:bg-blue-400 rounded-full" />
                            )}
                        </Link>
                    </div>

                    {/* 2. Categories with Clean Outline Icons */}
                    {categories.map((category: any) => {
                        const categoryName = typeof category === 'string' ? category : category.name;
                        const categoryId = typeof category === 'string' ? category : category._id;
                        const categoryImage = typeof category === 'object' && category.image?.url;
                        const isActive = activeCategoryParam === categoryId;

                        return (
                            <div key={categoryId} className="flex-shrink-0">
                                <Link
                                    href={`/product?category=${categoryId}`}
                                    className={`flex flex-col items-center gap-1.5 px-2 py-0.5 cursor-pointer relative transition-colors ${
                                        isActive
                                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                                            : 'text-slate-800 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                                >
                                    {/* Clean Icon / Image (No background box) */}
                                    <div className="w-9 h-9 flex items-center justify-center relative">
                                        {categoryImage ? (
                                            <Image
                                                src={categoryImage}
                                                alt={categoryName}
                                                fill
                                                className="object-contain"
                                                sizes="36px"
                                            />
                                        ) : (
                                            getCategoryIcon(categoryName)
                                        )}
                                    </div>

                                    {/* Category Label */}
                                    <span className="text-[12px] sm:text-[13px] tracking-tight whitespace-nowrap max-w-[85px] sm:max-w-[110px] truncate text-center">
                                        {categoryName}
                                    </span>

                                    {/* Active Blue Indicator Line */}
                                    {isActive && (
                                        <span className="absolute -bottom-3 left-0 right-0 h-[2.5px] bg-blue-600 dark:bg-blue-400 rounded-full" />
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
