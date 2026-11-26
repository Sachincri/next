"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/redux/hooks';
import { useGetProductsQuery, useGetRecentlyViewedQuery } from '@/redux/api/productApi';
import {
    useGetSimilarProductsQuery,
    useGetTrendingProductsQuery,
} from '@/redux/api/recommendationApi';
import { RootState } from '@/redux/store';

const ReviewIsland = dynamic(() => import('./ProductReviewIsland').then(mod => mod.ReviewIsland), {
    ssr: false,
    loading: () => <div className="h-40 w-full bg-gray-50 animate-pulse rounded-xl" />
});

const AISuggestions = dynamic(() => import('./AISuggestions'), {
    ssr: false,
    loading: () => <div className="h-24 w-full bg-gray-50 animate-pulse rounded-xl" />
});

const FrequentlyBoughtSlider = dynamic(
    () => import('./RecommendationSliders').then(mod => mod.FrequentlyBoughtSlider),
    { ssr: false }
);
const ProductSlider = dynamic(() => import('./ProductSlider').then(mod => mod.ProductSlider), {
    ssr: false
});

interface ClientIslandsProps {
    productId: string;
    initialReviews: any[];
    averageRating: number;
    ratingCount: number;
    categoryId?: string;
    categoryName?: string;
    currentBrandId?: string;
    currentBrandName?: string;
    similarProducts?: any[];
    brandProducts?: any[];
    catalogProducts?: any[];
}

function getEntityId(val: any): string | undefined {
    if (!val) return undefined;
    return typeof val === 'object' ? (val._id ? String(val._id) : undefined) : String(val);
}

function dedupeExcludingCurrent(list: any[], currentProductId: string): any[] {
    const seen = new Set<string>([String(currentProductId)]);
    const out: any[] = [];
    for (const item of list) {
        if (!item) continue;
        const pid = String(item._id || item.id || '');
        if (!pid || seen.has(pid)) continue;
        seen.add(pid);
        out.push(item);
    }
    return out;
}

export const ClientIslands: React.FC<ClientIslandsProps> = (props) => {
    const { isAuthenticated } = useAppSelector((state: RootState) => state.user);
    const { recentlyViewed: localRecentlyViewed } = useAppSelector((state: RootState) => state.product);
    const { data: serverRecentlyViewed } = useGetRecentlyViewedQuery(undefined, { skip: !isAuthenticated });

    // Client-side RTK Query enrichment/fallback so sections still populate if SSR cache was empty or cold
    const { data: categoryQueryData } = useGetProductsQuery(
        { category: props.categoryId, limit: 14 },
        { skip: !props.categoryId }
    );
    const { data: brandQueryData } = useGetProductsQuery(
        { brand: props.currentBrandId, limit: 14 },
        { skip: !props.currentBrandId }
    );
    const { data: storeCatalogData } = useGetProductsQuery({ limit: 16 });
    const { data: similarRecsData } = useGetSimilarProductsQuery({ productId: props.productId, limit: 12 });
    const { data: trendingRecsData } = useGetTrendingProductsQuery(12);

    // 1. Category-based products (Same Category + Similar Recommendation Engine fallback)
    const categoryProducts = useMemo(() => {
        const ssrCategory = Array.isArray(props.similarProducts) ? props.similarProducts : [];
        const clientCategory = Array.isArray(categoryQueryData?.products) ? categoryQueryData.products : [];
        const engineSimilar = Array.isArray(similarRecsData?.data)
            ? similarRecsData.data.map((r: any) => r?.product).filter(Boolean)
            : [];

        return dedupeExcludingCurrent(
            [...ssrCategory, ...clientCategory, ...engineSimilar],
            props.productId
        );
    }, [props.similarProducts, categoryQueryData, similarRecsData, props.productId]);

    // 2. Same Brand products ("More from <Brand>")
    const sameBrandProducts = useMemo(() => {
        if (!props.currentBrandId) return [];
        const ssrBrand = Array.isArray(props.brandProducts) ? props.brandProducts : [];
        const clientBrand = Array.isArray(brandQueryData?.products) ? brandQueryData.products : [];
        return dedupeExcludingCurrent([...ssrBrand, ...clientBrand], props.productId);
    }, [props.brandProducts, brandQueryData, props.currentBrandId, props.productId]);

    // 3. Other Brand products (prefer same-category other brands first, then expand storewide)
    const otherBrandProducts = useMemo(() => {
        const ssrCatalog = Array.isArray(props.catalogProducts) ? props.catalogProducts : [];
        const clientCatalog = Array.isArray(storeCatalogData?.products) ? storeCatalogData.products : [];
        const pool = [...categoryProducts, ...ssrCatalog, ...clientCatalog];

        const filtered = pool.filter((p: any) => {
            const pBrandId = getEntityId(p?.brand);
            if (!props.currentBrandId) return Boolean(pBrandId);
            return pBrandId && pBrandId !== String(props.currentBrandId);
        });

        return dedupeExcludingCurrent(filtered, props.productId);
    }, [categoryProducts, props.catalogProducts, storeCatalogData, props.currentBrandId, props.productId]);

    // 4. Trending & Other Categories Discovery
    const trendingOrDiscoverProducts = useMemo(() => {
        const trendingItems = Array.isArray(trendingRecsData?.data)
            ? trendingRecsData.data.map((r: any) => r?.product).filter(Boolean)
            : [];
        const ssrCatalog = Array.isArray(props.catalogProducts) ? props.catalogProducts : [];
        const clientCatalog = Array.isArray(storeCatalogData?.products) ? storeCatalogData.products : [];

        // Prioritize products from other categories for broader discovery, then trending items
        const otherCategoryItems = [...ssrCatalog, ...clientCatalog].filter((p: any) => {
            const pCatId = getEntityId(p?.category);
            return !props.categoryId || (pCatId && pCatId !== String(props.categoryId));
        });

        return dedupeExcludingCurrent(
            [...trendingItems, ...otherCategoryItems, ...ssrCatalog, ...clientCatalog],
            props.productId
        );
    }, [trendingRecsData, props.catalogProducts, storeCatalogData, props.categoryId, props.productId]);

    // 5. Recently Viewed
    const recentlyViewedProducts = useMemo(() => {
        const products = (localRecentlyViewed && Array.isArray(localRecentlyViewed) && localRecentlyViewed.length > 0)
            ? localRecentlyViewed
            : (Array.isArray(serverRecentlyViewed) ? serverRecentlyViewed : []);

        return dedupeExcludingCurrent(products, props.productId);
    }, [localRecentlyViewed, serverRecentlyViewed, props.productId]);

    return (
        <div className="space-y-6">
            <ReviewIsland
                productId={props.productId}
                initialReviews={props.initialReviews}
                averageRating={props.averageRating}
                ratingCount={props.ratingCount}
            />

            <div className="-mx-4 sm:mx-0">
                <AISuggestions productId={props.productId} />
            </div>

            <div className="-mx-4 sm:mx-0">
                <FrequentlyBoughtSlider productId={props.productId} />
            </div>

            {categoryProducts.length > 0 && (
                <div className="-mx-4 sm:mx-0">
                    <ProductSlider
                        products={categoryProducts}
                        heading={props.categoryName ? `More in ${props.categoryName}` : "Similar Products"}
                        viewAllHref={props.categoryId ? `/product?category=${props.categoryId}` : "/product"}
                    />
                </div>
            )}

            {sameBrandProducts.length > 0 && (
                <div className="-mx-4 sm:mx-0">
                    <ProductSlider
                        products={sameBrandProducts}
                        heading={props.currentBrandName ? `More from ${props.currentBrandName}` : "More from This Brand"}
                        viewAllHref={props.currentBrandId ? `/product?brand=${props.currentBrandId}` : "/product"}
                    />
                </div>
            )}

            {otherBrandProducts.length > 0 && (
                <div className="-mx-4 sm:mx-0">
                    <ProductSlider
                        products={otherBrandProducts}
                        heading="Top Picks from Other Brands"
                        viewAllHref="/product"
                    />
                </div>
            )}

            {trendingOrDiscoverProducts.length > 0 && (
                <div className="-mx-4 sm:mx-0">
                    <ProductSlider
                        products={trendingOrDiscoverProducts}
                        heading="Trending & Explore More Categories"
                        viewAllHref="/product"
                    />
                </div>
            )}

            {recentlyViewedProducts.length > 0 && (
                <div className="-mx-4 sm:mx-0">
                    <ProductSlider
                        products={recentlyViewedProducts}
                        heading="Recently Viewed"
                        viewAllHref="/product"
                    />
                </div>
            )}
        </div>
    );
};
