import { apiSlice } from "./apiSlice";
import { Order, ShippingInfo } from "@/types";
import { CartItem } from "@/types/cart";

export const orderApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<
            { message: string; order: Order },
            {
                shippingInfo: ShippingInfo;
                orderItems: CartItem[];
                paymentMethod: string;
                itemsPrice: number;
                shippingPrice: number;
                totalPrice: number;
            }
        >({
            query: (body) => ({
                url: "/orders",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Order", "Admin", "Cart"],
        }),
        getRazorpayKey: builder.query<{ key: string }, void>({
            query: () => "/payment/key",
            transformResponse: (response: any) => response.data,
        }),
        createRazorpayOrder: builder.mutation<{ order: any; orderOptions: any }, { amount: number; currency?: string; notes?: any }>({
            query: (body) => ({
                url: "/payment/order",
                method: "POST",
                body,
            }),
            transformResponse: (response: any) => response.data,
        }),
        verifyPayment: builder.mutation<any, any>({
            query: (body) => ({
                url: "/payment/verify",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Order", "Admin", "Cart"],
        }),
        getMyOrders: builder.query<Order[], void>({
            query: () => "/orders/me",
            providesTags: ["Order"],
            transformResponse: (response: any) => response.data.orders,
        }),
        getOrderDetails: builder.query<Order, string>({
            query: (id) => `/orders/${id}`,
            providesTags: (result, error, id) => [{ type: "Order", id }],
            transformResponse: (response: any) => response.data.order,
        }),
        getOrderTracking: builder.query<any, string>({
            query: (id) => `/orders/${id}/tracking`,
            providesTags: (result, error, id) => [{ type: "Order", id: `Tracking-${id}` }],
            transformResponse: (response: any) => response.data.tracking,
        }),
        createStripePaymentIntent: builder.mutation<{ clientSecret: string; paymentIntentId: string }, any>({
            query: (body) => ({
                url: "/payment/stripe/create-intent",
                method: "POST",
                body,
            }),
            transformResponse: (response: any) => response.data,
        }),
        verifyStripePayment: builder.mutation<any, { paymentIntentId: string; orderOptions: any }>({
            query: (body) => ({
                url: "/payment/stripe/verify",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Order", "Admin", "Cart"],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useVerifyPaymentMutation,
    useGetMyOrdersQuery,
    useGetOrderDetailsQuery,
    useGetOrderTrackingQuery,
    useGetRazorpayKeyQuery,
    useCreateRazorpayOrderMutation,
    useCreateStripePaymentIntentMutation,
    useVerifyStripePaymentMutation,
} = orderApi;
