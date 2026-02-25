import { apiSlice } from "./apiSlice";

export const supportApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        submitSupportRequest: builder.mutation<any, { subject: string; category: string; description: string; priority?: string }>({
            query: (body) => ({
                url: "/support/request",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Order"], // Or a new Support tag
        }),
        getMySupportRequests: builder.query<any, void>({
            query: () => "/support/my-requests",
            providesTags: ["Order"],
        }),
        // Admin endpoints
        getAllSupportRequests: builder.query<any, void>({
            query: () => "/support/all-requests",
            providesTags: ["Admin"],
        }),
        updateSupportStatus: builder.mutation<any, { id: string; status?: string; priority?: string }>({

            query: ({ id, ...body }) => ({
                url: `/support/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Admin"],
        }),
    }),
});

export const {
    useSubmitSupportRequestMutation,
    useGetMySupportRequestsQuery,
    useGetAllSupportRequestsQuery,
    useUpdateSupportStatusMutation,
} = supportApi;
