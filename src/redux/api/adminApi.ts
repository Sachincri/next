import { apiSlice } from "./apiSlice";
import { User, Product, Order, DashboardStats, ProductAnalytics, CustomerAnalytics, AnalyticsOverviewData } from "@/types";

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
        getAllOrders: builder.query<{ orders: Order[]; totalOrders: number; totalPages: number; currentPage: number; totalRevenue?: number }, {
            page?: number;
            limit?: number;
            status?: string;
            payment?: string;
            paymentMethod?: string;
            startDate?: string;
            endDate?: string;
            minAmount?: number | string;
            maxAmount?: number | string;
            sortBy?: string;
            search?: string;
        } | void>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params) {
                    Object.entries(params).forEach(([key, val]) => {
                        if (val !== undefined && val !== null && val !== "" && val !== "all") {
                            queryParams.append(key, String(val));
                        }
                    });
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
            invalidatesTags: ["Admin", "Home"],
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
            invalidatesTags: ["Admin", "Home"],
        }),
        deleteCoupon: builder.mutation<any, string>({
            query: (id) => ({
                url: `/coupons/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Admin", "Home"],
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
        getAnalyticsOverview: builder.query<
            AnalyticsOverviewData,
            { preset?: string; startDate?: string; endDate?: string } | void
        >({
            query: (params) => {
                const search = new URLSearchParams();
                if (params?.preset) search.set("preset", params.preset);
                if (params?.startDate) search.set("startDate", params.startDate);
                if (params?.endDate) search.set("endDate", params.endDate);
                const qs = search.toString();
                return `/admin/analytics/overview${qs ? `?${qs}` : ""}`;
            },
            providesTags: ["Admin", "Order", "Product"],
            transformResponse: (response: any) => response.data,
        }),
        getCampaignSegmentCounts: builder.query<Record<string, number>, void>({
            query: () => "/campaigns/segments/counts",
            providesTags: ["Admin"],
            transformResponse: (response: any) => response.data,
        }),
        getCampaignHistory: builder.query<any[], void>({
            query: () => "/campaigns",
            providesTags: ["Admin"],
            transformResponse: (response: any) => response.data || [],
        }),
        deleteCampaign: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/campaigns/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Admin"],
        }),
        generateCampaignData: builder.mutation<
            {
                campaignId?: string;
                pushTitle?: string;
                pushBody?: string;
                pushDeepLink?: string;
                whatsappText?: string;
                whatsappButtons?: string[];
                emailSubject?: string;
                emailHtml?: string;
                imageUrl?: string | null;
                storeName?: string;
                storeLogo?: string;
                ctaUrl?: string;
                couponCode?: string;
            },
            {
                topic: string;
                type: string;
                tone?: string;
                channels: string[];
                couponId?: string;
                productId?: string;
                categoryId?: string;
                ctaUrl?: string;
            }
        >({
            query: (args) => ({
                url: `/campaigns/generate`,
                method: "POST",
                body: args,
            }),
            invalidatesTags: ["Admin"],
            transformResponse: (response: any) => response.data,
        }),
        sendTestCampaign: builder.mutation<
            { status: string; message: string },
            { testEmail?: string; testPhone?: string; channels: string[]; payload: any }
        >({
            query: (args) => ({
                url: `/campaigns/test-send`,
                method: "POST",
                body: args,
            }),
            transformResponse: (response: any) => ({
                status: response.status,
                message: response.message,
            }),
        }),
        broadcastCampaign: builder.mutation<
            { status: string; message: string; data?: any },
            {
                campaignId?: string;
                topic?: string;
                tone?: string;
                audienceType: string;
                channels: string[];
                payload: any;
                couponId?: string;
                couponCode?: string;
                productId?: string;
                categoryId?: string;
                ctaUrl?: string;
                scheduleMode?: "now" | "schedule";
                scheduledAt?: string;
            }
        >({
            query: (args) => ({
                url: `/campaigns/broadcast`,
                method: "POST",
                body: args,
            }),
            invalidatesTags: ["Admin"],
            transformResponse: (response: any) => ({
                status: response.status,
                message: response.message,
                data: response.data,
            }),
        }),
        getHomeSections: builder.query<{ id: string; type: string; heading: string; quadCards?: { index: number; title: string }[] }[], void>({
            query: () => "/home/cms/sections/metadata",
            providesTags: ["Admin"],
            transformResponse: (response: any) => response.data,
        }),
        addProductToHomeSection: builder.mutation<{ message: string }, { productId: string; sectionId: string; quadIndex?: number }>({
            query: (data) => ({
                url: "/home/cms/sections/add-product",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Admin", "Home"],
            transformResponse: (response: any) => ({ message: response.message }),
        }),
        bulkProductAction: builder.mutation<{ message: string; modifiedCount?: number }, { productIds: string[]; action: string; data?: any }>({
            query: (body) => ({
                url: "/products/bulk-action",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Product", "Admin"],
            transformResponse: (response: any) => response.data || { message: response.message },
        }),
        bulkImportProducts: builder.mutation<{ message: string; count: number }, { products: any[] }>({
            query: (body) => ({
                url: "/products/bulk-import",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Product", "Admin"],
            transformResponse: (response: any) => response.data || { message: response.message },
        }),
        bulkOrderAction: builder.mutation<{ message: string; modifiedCount?: number }, { orderIds: string[]; status?: string; action?: string }>({
            query: (body) => ({
                url: "/admin/orders/bulk-action",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Order", "Admin"],
            transformResponse: (response: any) => response.data || { message: response.message },
        }),
        bulkCustomerAction: builder.mutation<{ message: string; modifiedCount?: number }, { userIds: string[]; action: string; data?: any }>({
            query: (body) => ({
                url: "/admin/users/bulk-action",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User", "Admin"],
            transformResponse: (response: any) => response.data || { message: response.message },
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
    useBulkProductActionMutation,
    useBulkImportProductsMutation,
    useBulkOrderActionMutation,
    useBulkCustomerActionMutation,
    useGetAllUsersQuery,
    useLazyGetAllUsersQuery,
    useGetAllOrdersQuery,
    useLazyGetAllOrdersQuery,
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
    useGetAnalyticsOverviewQuery,
    useGetCampaignSegmentCountsQuery,
    useGetCampaignHistoryQuery,
    useDeleteCampaignMutation,
    useGenerateCampaignDataMutation,
    useSendTestCampaignMutation,
    useBroadcastCampaignMutation,
    useGetHomeSectionsQuery,
    useAddProductToHomeSectionMutation,
} = adminApi;
