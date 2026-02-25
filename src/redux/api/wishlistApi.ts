import { apiSlice } from "./apiSlice";
import { Product, Wishlist } from "@/types";


export const wishlistApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getWishlist: builder.query<Wishlist, void>({
            query: () => "/wishlist",
            providesTags: ["Wishlist"],
            transformResponse: (response: any) => response.data.wishlist,
        }),
        addToWishlist: builder.mutation<{ message: string; wishlist: Wishlist }, string>({
            query: (productId) => ({
                url: "/wishlist",
                method: "POST",
                body: { productId },
            }),
            invalidatesTags: ["Wishlist"],
            transformResponse: (response: any) => ({
                message: response.message,
                wishlist: response.data.wishlist,
            }),
        }),
        removeFromWishlist: builder.mutation<{ message: string; wishlist: Wishlist }, string>({
            query: (productId) => ({
                url: `/wishlist/${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Wishlist"],
            transformResponse: (response: any) => ({
                message: response.message,
                wishlist: response.data.wishlist,
            }),
        }),
    }),
});

export const {
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} = wishlistApi;
