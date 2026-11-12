import { apiSlice } from "./apiSlice";

export const supportApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        submitSupportRequest: builder.mutation<any, { subject: string; category: string; description: string; priority?: string }>({
            query: (body) => ({
                url: "/support/request",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Support", "Order"],
        }),
        getMySupportRequests: builder.query<any, void>({
            query: () => "/support/my-requests",
            providesTags: ["Support"],
        }),
        // Admin endpoints
        getAllSupportRequests: builder.query<any, void>({
            query: () => "/support/all-requests",
            providesTags: ["Admin", "Support"],
        }),
        getSupportRequestDetails: builder.query<any, string>({
            query: (id) => `/support/${id}`,
            providesTags: ["Support"],
        }),
        updateSupportStatus: builder.mutation<any, { id: string; status?: string; priority?: string; adminNotes?: string }>({
            query: ({ id, ...body }) => ({
                url: `/support/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Admin", "Support"],
        }),
        replyToSupportRequest: builder.mutation<any, { id: string; message: string; status?: string }>({
            query: ({ id, ...body }) => ({
                url: `/support/${id}/reply`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Admin", "Support"],
        }),
    }),
});

export const {
    useSubmitSupportRequestMutation,
    useGetMySupportRequestsQuery,
    useGetAllSupportRequestsQuery,
    useGetSupportRequestDetailsQuery,
    useUpdateSupportStatusMutation,
    useReplyToSupportRequestMutation,
} = supportApi;
