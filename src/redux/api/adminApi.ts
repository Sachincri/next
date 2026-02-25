import { apiSlice } from "./apiSlice";
import { User, Product, Order, DashboardStats, ProductAnalytics, CustomerAnalytics } from "@/types";

export const adminApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminDashboard: builder.query<DashboardStats, void>({
            query: () => "/admin/dashboard",
            providesTags: ["Admin"],
            transformResponse: (response: any) => response.data,
        }),
        getProductAnalytics: builder.query<ProductAnalytics, void>({
            query: () => "/admin/analytics/products",
            providesTags: ["Admin", "Product"],
            transformResponse: (response: any) => response.data,
        }),
        getCustomerAnalytics: builder.query<CustomerAnalytics, void>({
            query: () => "/admin/analytics/customers",
            providesTags: ["Admin", "User"],
            transformResponse: (response: any) => response.data,
        }),
        createProduct: builder.mutation<{ message: string }, FormData>({
            query: (formData) => ({
                url: "/products/addnewproduct",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Product", "Admin"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        getAdminProducts: builder.query<{ products: Product[]; statistics: any }, void>({
            query: () => "/admin/product/details",
            providesTags: ["Product", "Admin"],
            transformResponse: (response: any) => response.data,
        }),
        updateProduct: builder.mutation<{ message: string }, { productId: string; productData: FormData }>({
            query: ({ productId, productData }) => ({
                url: `/products/${productId}`,
                method: "PATCH",
                body: productData,
            }),
            invalidatesTags: (result, error, { productId }) => [{ type: "Product", id: productId }, "Product", "Admin"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        deleteProduct: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Product", "Admin"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        getAllUsers: builder.query<User[], void>({
            query: () => "/admin/users",
            providesTags: ["User", "Admin"],
            transformResponse: (response: any) => response.data.users,
        }),
        getAllOrders: builder.query<{ orders: Order[]; totalOrders: number; totalPages: number; currentPage: number }, { page?: number; limit?: number; status?: string; search?: string } | void>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params) {
                    if (params.page) queryParams.append("page", params.page.toString());
                    if (params.limit) queryParams.append("limit", params.limit.toString());
                    if (params.status) queryParams.append("status", params.status);
                    // Search assumes backend supports it, if not we might need to add it to backend controller first. 
                    // Looking at order.controller.ts, it DOES NOT support search. 
                    // Only filter by status. 
                    // So let's stick to what is supported for now or update controller.
                }
                return `/admin/orders?${queryParams.toString()}`;
            },
            providesTags: ["Order", "Admin"],
            transformResponse: (response: any) => response.data,
        }),
        updateUserRole: builder.mutation<{ message: string }, { id: string; role: string }>({
            query: ({ id, role }) => ({
                url: `/admin/user/${id}`,
                method: "PUT",
                body: { role },
            }),
            invalidatesTags: ["User", "Admin"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        deleteUser: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/user/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User", "Admin"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        getUserDetails: builder.query<User, string>({
            query: (id) => `/admin/user/${id}`,
            providesTags: (result, error, id) => [{ type: "User", id }, "Admin"],
            transformResponse: (response: any) => response.data.user,
        }),
        updateOrder: builder.mutation<{ message: string }, { id: string; orderStatus: string }>({
            query: ({ id, orderStatus }) => ({
                url: `/admin/order/${id}`,
                method: "PUT",
                body: { status: orderStatus },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Order", id }, "Order", "Admin"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        deleteOrder: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/order/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Order", "Admin"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        createBrand: builder.mutation<{ message: string }, FormData>({
            query: (formData) => ({
                url: "/home/addbrand",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Brand"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        createCategory: builder.mutation<{ message: string }, FormData>({
            query: (formData) => ({
                url: "/home/addcategories",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Category"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        getBrands: builder.query<{ name: string; slug: string }[], void>({
            query: () => "/brands",
            providesTags: ["Brand"],
            transformResponse: (response: any) => response.data,
        }),
        getCategories: builder.query<{ _id: string; name: string; slug: string; level: number; parent?: { _id: string; name: string } | null }[], void>({
            query: () => "/categories",
            providesTags: ["Category"],
            transformResponse: (response: any) => response.data,
        }),
        getAppSettings: builder.query<any, void>({
            query: () => "/admin/settings",
            providesTags: ["Admin"],
            transformResponse: (response: any) => response.data.settings,
        }),
        updateAppSettings: builder.mutation<any, any>({
            query: (settings) => ({
                url: "/admin/settings",
                method: "PUT",
                body: settings,
            }),
            invalidatesTags: ["Admin"],
        }),
        refundOrder: builder.mutation<{ message: string }, { paymentId: string; amount?: number; reason?: string }>({
            query: (body) => ({
                url: "/payment/admin/payment/refund",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Order", "Admin"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        sendOrderEmail: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/orders/${id}/email`,
                method: "POST",
            }),
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        getGoogleAnalytics: builder.query<any, void>({
            query: () => "/admin/analytics/google",
            providesTags: ["Admin"],
            transformResponse: (response: any) => response.data,
        }),
        generateProductDetails: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: "/ai/generate-details",
                method: "POST",
                body: formData,
            }),
            transformResponse: (response: any) => response.data,
        }),
        getCoupons: builder.query<any[], void>({
            query: () => "/coupons",
            providesTags: ["Admin"],
            transformResponse: (response: any) => response.data,
        }),
        createCoupon: builder.mutation<any, any>({
            query: (data) => ({
                url: "/coupons",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Admin"],
        }),
        deleteCoupon: builder.mutation<any, string>({
            query: (id) => ({
                url: `/coupons/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Admin"],
        }),
        assignCoupon: builder.mutation<any, { couponId: string; userId: string }>({
            query: (data) => ({
                url: "/coupons/assign",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Admin", "User"],
        }),
        validateCoupon: builder.mutation<any, { code: string; amount: number }>({
            query: (data) => ({
                url: "/coupons/validate",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: any) => response.data,
        }),
        getRealtimeAnalytics: builder.query<{ totalActiveUsers: number; countryData: { country: string; activeUsers: number }[] }, void>({
            query: () => "/analytics/realtime",
            providesTags: ["Admin"],
            transformResponse: (response: any) => response.data,
        }),
    }),
});

export const {
    useGetAdminDashboardQuery,
    useGetProductAnalyticsQuery,
    useGetCustomerAnalyticsQuery,
    useCreateProductMutation,
    useGetAdminProductsQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetAllUsersQuery,
    useGetAllOrdersQuery,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
    useGetUserDetailsQuery,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
    useCreateBrandMutation,
    useCreateCategoryMutation,
    useGetBrandsQuery,
    useGetCategoriesQuery,
    useGetAppSettingsQuery,
    useUpdateAppSettingsMutation,
    useRefundOrderMutation,
    useSendOrderEmailMutation,
    useGetGoogleAnalyticsQuery,
    useGenerateProductDetailsMutation,
    useGetCouponsQuery,
    useCreateCouponMutation,
    useDeleteCouponMutation,
    useAssignCouponMutation,
    useValidateCouponMutation,
    useGetRealtimeAnalyticsQuery,
} = adminApi;
