"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/redux/hooks';
import { useGetRecentlyViewedQuery } from '@/redux/api/productApi';
import { RootState } from '@/redux/store';

const ReviewIsland = dynamic(() => import('./ProductReviewIsland').then(mod => mod.ReviewIsland), {
    ssr: false,
    loading: () => <div className="h-40 w-full bg-gray-50 animate-pulse rounded-xl" />
});

const AISuggestions = dynamic(() => import('./AISuggestions'), {
    ssr: false,
    loading: () => <div className="h-24 w-full bg-gray-50 animate-pulse rounded-xl" />
});

const ProductSlider = dynamic(() => import('./ProductSlider').then(mod => mod.ProductSlider), {
    ssr: false
});

interface ClientIslandsProps {
    productId: string;
    initialReviews: any[];
    averageRating: number;
    ratingCount: number;
    categoryId?: string;
    currentBrandId?: string;
    similarProducts?: any[];
}

export const ClientIslands: React.FC<ClientIslandsProps> = (props) => {
    const { isAuthenticated } = useAppSelector((state: RootState) => state.user);
    const { recentlyViewed: localRecentlyViewed } = useAppSelector((state: RootState) => state.product);
    const { data: serverRecentlyViewed } = useGetRecentlyViewedQuery(undefined, { skip: !isAuthenticated });

    const otherBrandProducts = useMemo(() => {
        if (!props.similarProducts || !props.currentBrandId) return [];
        return props.similarProducts.filter((p: any) => {
            const pBrandId = typeof p.brand === 'object' ? p.brand._id : p.brand;
            return pBrandId && props.currentBrandId && pBrandId !== props.currentBrandId;
        });
    }, [props.similarProducts, props.currentBrandId]);

    const recentlyViewedProducts = useMemo(() => {
        const products = (localRecentlyViewed && localRecentlyViewed.length > 0)
            ? localRecentlyViewed
            : (serverRecentlyViewed || []);
        // Filter out the current product from recently viewed
        return products.filter((p: any) => (p._id || p.id) !== props.productId);
    }, [localRecentlyViewed, serverRecentlyViewed, props.productId]);

    return (
        <div className="space-y-4">
            <ReviewIsland
                productId={props.productId}
                initialReviews={props.initialReviews}
                averageRating={props.averageRating}
                ratingCount={props.ratingCount}
            />

            <div className="-mx-4 sm:mx-0">
                <AISuggestions productId={props.productId} />
            </div>

            {props.similarProducts && props.similarProducts.length > 0 && (
                <div className="-mx-4 sm:mx-0">
                    {/* <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2> */}
                    <ProductSlider products={props.similarProducts} heading="Similar Products" />
                </div>
            )}

            {otherBrandProducts.length > 0 && (
                <div className="-mx-4 sm:mx-0">
                    {/* <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Picks from Other Brands</h2> */}
                    <ProductSlider products={otherBrandProducts} heading="Top Picks from Other Brands" />
                </div>
            )}

            {recentlyViewedProducts.length > 0 && (
                <div className="-mx-4 sm:mx-0">
                    {/* <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2> */}
                    <ProductSlider products={recentlyViewedProducts} heading={"Recently Viewed"} />
                </div>
            )}
        </div>
    );
};
