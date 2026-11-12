"use client";

import React, { useRef } from 'react';
import { 
    useGetForYouRecommendationsQuery, 
    useGetSimilarProductsQuery, 
    useGetTrendingProductsQuery, 
    useGetFrequentlyBoughtTogetherQuery 
} from '@/redux/api/recommendationApi';
import ProductCard from '@/components/product/ProductCard';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, ShoppingBag, Layers } from 'lucide-react';

interface SliderProps {
    title: string;
    icon: React.ReactNode;
    products: any[];
    isLoading: boolean;
}

const ProductSlider: React.FC<SliderProps> = ({ title, icon, products, isLoading }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="my-10 w-full animate-pulse">
                <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-6" />
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="min-w-[240px] h-80 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex-shrink-0" />
                    ))}
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) return null;

    return (
        <div className="my-12 w-full relative group">
            <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                    <span className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        {icon}
                    </span>
                    {title}
                </h2>
                <div className="hidden md:flex items-center gap-2">
                    <button 
                        onClick={() => scroll('left')}
                        className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div 
                ref={scrollRef}
                className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
            >
                {products.map((item: any, index: number) => (
                    <div key={item.product._id || index} className="snap-start flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px]">
                        <ProductCard 
                            {...item.product} 
                            badgeText={item.reason} 
                            badgeColor={
                                item.strategy === 'collaborative' ? 'bg-indigo-500 text-white' : 
                                item.strategy === 'trending' ? 'bg-orange-500 text-white' : undefined
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ForYouSlider = () => {
    const { data, isLoading } = useGetForYouRecommendationsQuery({});
    return <ProductSlider title="Picked For You" icon={<Sparkles className="w-5 h-5" />} products={data?.data} isLoading={isLoading} />;
};

export const TrendingSlider = () => {
    const { data, isLoading } = useGetTrendingProductsQuery(12);
    return <ProductSlider title="Trending Now" icon={<TrendingUp className="w-5 h-5" />} products={data?.data} isLoading={isLoading} />;
};

export const SimilarProductsSlider = ({ productId }: { productId: string }) => {
    const { data, isLoading } = useGetSimilarProductsQuery({ productId });
    return <ProductSlider title="Similar Products" icon={<Layers className="w-5 h-5" />} products={data?.data} isLoading={isLoading} />;
};

export const FrequentlyBoughtSlider = ({ productId }: { productId: string }) => {
    const { data, isLoading } = useGetFrequentlyBoughtTogetherQuery({ productId });
    return <ProductSlider title="Frequently Bought Together" icon={<ShoppingBag className="w-5 h-5" />} products={data?.data} isLoading={isLoading} />;
};
