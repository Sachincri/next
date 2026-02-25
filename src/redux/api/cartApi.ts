import { apiSlice } from "./apiSlice";
import { CartItem, CartSummary } from "@/types/cart";

export const cartApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCart: builder.query<CartItem[], void>({
            query: () => "/cart",
            providesTags: ["Cart"],
            transformResponse: (response: any) =>
                response.data?.cart?.items?.map((item: any) => ({
                    ...item,
                    name: item.productName || item.name,
                    image: item.productImage || item.image,
                    price: item.finalPrice,
                    originalPrice: item.price,
                    size: item.variant?.size,
                    color: item.variant?.color,
                })) || [],
        }),
        addToCart: builder.mutation<any, { productId: string; quantity: number; variant?: any }>({
            query: (body) => ({
                url: "/cart",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Cart"],
        }),
        updateCartItem: builder.mutation<any, { itemId: string; quantity: number }>({
            query: ({ itemId, quantity }) => ({
                url: `/cart/${itemId}`,
                method: "PATCH",
                body: { quantity },
            }),
            invalidatesTags: ["Cart"],
        }),
        removeFromCart: builder.mutation<any, string>({
            query: (itemId) => ({
                url: `/cart/${itemId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),
        syncCart: builder.mutation<any, { items: CartItem[] }>({
            query: ({ items }) => ({
                url: "/cart/sync",
                method: "POST",
                body: {
                    items: items.map((item) => ({
                        ...item,
                        variant: {
                            size: item.size,
                            color: item.color,
                        },
                    })),
                },
            }),
            invalidatesTags: ["Cart"],
        }),
        getCartSummary: builder.query<CartSummary, void>({
            query: () => "/cart/summary",
            providesTags: ["Cart"],
            transformResponse: (response: any) => response.data,
        }),
        clearCart: builder.mutation<any, void>({
            query: () => ({
                url: "/cart",
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),
        applyCoupon: builder.mutation<any, { code: string }>({
            query: (body) => ({
                url: "/cart/coupon",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Cart"],
        }),
        removeCoupon: builder.mutation<any, void>({
            query: () => ({
                url: "/cart/coupon",
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),
        toggleCoins: builder.mutation<any, { useCoins: boolean }>({
            query: (body) => ({
                url: "/cart/coins",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Cart"],
        }),
    }),
});

export const {
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useSyncCartMutation,
    useGetCartSummaryQuery,
    useClearCartMutation,
    useApplyCouponMutation,
    useRemoveCouponMutation,
    useToggleCoinsMutation,
} = cartApi;
