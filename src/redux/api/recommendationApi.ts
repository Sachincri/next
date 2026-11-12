import { apiSlice } from "./apiSlice";

export const recommendationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        trackEvent: builder.mutation({
            query: (data: { productId: string; eventType: string; sessionId?: string; metadata?: any }) => ({
                url: "/recommendations/track",
                method: "POST",
                body: data,
            }),
        }),
        getForYouRecommendations: builder.query({
            query: (params?: { limit?: number; currentProductId?: string }) => ({
                url: "/recommendations/for-you",
                params,
            }),
            providesTags: ["Recommendations"],
        }),
        getSimilarProducts: builder.query({
            query: ({ productId, limit = 8 }: { productId: string; limit?: number }) => ({
                url: `/recommendations/similar/${productId}`,
                params: { limit },
            }),
            providesTags: (_result, _error, arg) => [{ type: "Recommendations", id: `similar-${arg.productId}` }],
        }),
        getTrendingProducts: builder.query({
            query: (limit: number = 12) => ({
                url: "/recommendations/trending",
                params: { limit },
            }),
            providesTags: ["Recommendations"],
        }),
        getFrequentlyBoughtTogether: builder.query({
            query: ({ productId, limit = 4 }: { productId: string; limit?: number }) => ({
                url: `/recommendations/frequently-bought/${productId}`,
                params: { limit },
            }),
            providesTags: (_result, _error, arg) => [{ type: "Recommendations", id: `fbt-${arg.productId}` }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useTrackEventMutation,
    useGetForYouRecommendationsQuery,
    useGetSimilarProductsQuery,
    useGetTrendingProductsQuery,
    useGetFrequentlyBoughtTogetherQuery,
} = recommendationApi;
