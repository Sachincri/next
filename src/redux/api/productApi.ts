import { apiSlice } from "./apiSlice";
import { Product, ErrorResponse, ApiResponse, Brand, Category } from "@/types";

export const productApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query<
            {
                products: Product[];
                productsCount: number;
                resultPerPage: number;
                filteredProductsCount: number;
            },
            {
                keyword?: string;
                currentPage?: number;
                price?: [number, number];
                category?: string;
                brand?: string;
                ratings?: number;
                discount?: number;
            }
        >({
            query: ({
                keyword = "",
                currentPage = 1,
                price = [0, 10000000],
                category = "",
                brand = "",
                ratings = 0,
                discount = 0,
            }) => {
                const params = new URLSearchParams();
                if (keyword) params.set('keyword', keyword);
                params.set('page', String(currentPage));
                params.set('price[gte]', String(price[0]));
                params.set('price[lte]', String(price[1]));
                if (ratings > 0) params.set('rating[gte]', String(ratings));
                if (discount > 0) params.set('discount[gte]', String(discount));
                if (category) params.set('category', category);
                if (brand) params.set('brand', brand);
                return `/products?${params.toString()}`;
            },
            providesTags: ["Product"],
            transformResponse: (response: any) => {
                // Handle variations in response format as seen in product.ts
                // If response is the standard ApiResponse, response.data holds the payload
                if (response?.data?.products) {
                    return {
                        products: response.data.products,
                        productsCount: response.data.productsCount || 0,
                        resultPerPage: response.data.resultPerPage || 12,
                        filteredProductsCount: response.data.filteredProductsCount || 0,
                    };
                }
                // Fallback: if products is at root (unlikely given controller, but safely handle)
                if (response?.products) {
                    return response;
                }
                return response;
            },
        }),
        getProductDetails: builder.query<Product, string>({
            query: (id) => `/products/${id}`,
            providesTags: (result, error, id) => [{ type: "Product", id }],
            transformResponse: (response: any) => response.product || response.data?.product || response,
        }),
        getRecentlyViewed: builder.query<Product[], void>({
            query: () => "/products/getRecentlyViewedProduct",
            providesTags: ["RecentlyViewed"],
        }),
        addToRecentlyViewed: builder.mutation<ApiResponse<any>, string>({
            query: (productId) => ({
                url: "/products/recentlyviewed",
                method: "PUT",
                body: { productId },
            }),
            invalidatesTags: ["RecentlyViewed"],
        }),
        submitReview: builder.mutation<ApiResponse<any>, any>({
            query: (reviewData) => ({
                url: "/products/review",
                method: "PUT",
                body: reviewData,
            }),
            invalidatesTags: (result, error, { productId }) => [
                { type: "Product", id: productId },
                "Review",
            ],
        }),
        getReviews: builder.query<any[], string>({
            query: (id) => `/products/reviews?id=${id}`,
            providesTags: ["Review"],
            transformResponse: (response: any) => response.data?.reviews || [],
        }),
        deleteReview: builder.mutation<ApiResponse<any>, { reviewId: string; productId: string }>({
            query: ({ reviewId, productId }) => ({
                url: `/products/review?id=${reviewId}&productId=${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { productId }) => [
                { type: "Product", id: productId },
                "Review",
            ],
        }),
        getAllBrands: builder.query<Brand[], void>({
            query: () => "/brands",
            providesTags: ["Brand"],
            // Brands rarely change — keep cached for 1 hour to avoid re-fetching on every page visit
            keepUnusedDataFor: 3600,
            transformResponse: (response: { data: Brand[] } | Brand[]) =>
                (response as { data: Brand[] }).data ?? (response as Brand[]),
        }),
        getAllCategories: builder.query<Category[], void>({
            query: () => "/categories",
            providesTags: ["Category"],
            // Categories rarely change — keep cached for 1 hour
            keepUnusedDataFor: 3600,
            transformResponse: (response: { data: Category[] } | Category[]) =>
                (response as { data: Category[] }).data ?? (response as Category[]),
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductDetailsQuery,
    useGetRecentlyViewedQuery,
    useAddToRecentlyViewedMutation,
    useSubmitReviewMutation,
    useGetReviewsQuery,
    useDeleteReviewMutation,
    useGetAllBrandsQuery,
    useGetAllCategoriesQuery,
} = productApi;
