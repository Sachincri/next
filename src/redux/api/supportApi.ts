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
            async onQueryStarted({ id, status, priority }, { dispatch, queryFulfilled }) {
                const patchAll = dispatch(
                    supportApi.util.updateQueryData("getAllSupportRequests", undefined, (draft: any) => {
                        const list = draft?.data?.requests;
                        if (Array.isArray(list)) {
                            const target = list.find((item: any) => item._id === id);
                            if (target) {
                                if (status) target.status = status;
                                if (priority) target.priority = priority;
                            }
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchAll.undo();
                }
            },
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
