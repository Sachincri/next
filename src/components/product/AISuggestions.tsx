"use client";

import React, { useEffect } from "react";
import { useGetSuggestionsMutation } from "@/redux/api/aiApi";
import { useGetPublicSettingsQuery } from "@/redux/api/homeApi";
import { ProductSlider } from "./ProductSlider";
import { Skeleton } from "../ui/skeleton";


interface AISuggestionsProps {
    productId?: string;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ productId }) => {
    const { data: settings } = useGetPublicSettingsQuery();
    const [getSuggestions, { data, isLoading, isError }] = useGetSuggestionsMutation();

    useEffect(() => {
        if (settings && settings.aiSuggestionsEnabled !== false) {
            // Gather context from local storage or defaults
            let recentlyViewed = [];
            try {
                const stored = localStorage.getItem("recentlyViewed");
                if (stored) recentlyViewed = JSON.parse(stored).slice(0, 5); // Limit to 5
            } catch (e) { }

            // Only call if we have a productId or if the backend is fixed to handle home suggestions
            if (productId) {
                getSuggestions({
                    productId,
                    recentlyViewed,
                });
            }
        }
    }, [productId, settings, getSuggestions]);

    if (settings && settings.aiSuggestionsEnabled === false) return null;
    if (isError) return null;

    const products = data?.data?.map((item: any) => item.product) || [];

    if (!isLoading && products.length === 0) return null;

    return (
        <div className=" pt-6 bg-white dark:bg-slate-950">
            <div className="flex items-center gap-2 mb-8 md:px-6">
                <div className="px-2">
                    <h2 className="text-2xl font-bold tracking-tight md:px-0 dark:text-white">Recommended for You</h2>
                </div>
            </div>

            {isLoading ? (
                <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 overflow-x-auto sm:overflow-x-visible gap-4 pb-4 no-scrollbar md:px-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-[160px] sm:w-auto space-y-3 px-4 sm:px-0">
                            <Skeleton className="h-[160px] sm:h-[200px] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <ProductSlider products={products} />
            )}
        </div>
    );
};

export default AISuggestions;
