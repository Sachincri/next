import { apiSlice } from "./apiSlice";

export const addressApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAddresses: builder.query<any, void>({
            query: () => "/addresses",
            providesTags: ["Address"],
            transformResponse: (response: any) => response.data || [],
        }),
        addAddress: builder.mutation<any, any>({
            query: (addressData) => ({
                url: "/addresses",
                method: "POST",
                body: addressData,
            }),
            invalidatesTags: ["Address"],
        }),
        updateAddress: builder.mutation<any, { id: string; body: any }>({
            query: ({ id, body }) => ({
                url: `/addresses/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Address"],
        }),
        deleteAddress: builder.mutation<any, string>({
            query: (id) => ({
                url: `/addresses/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Address"],
        }),
        setDefaultAddress: builder.mutation<any, string>({
            query: (id) => ({
                url: `/addresses/${id}/default`,
                method: "PATCH",
            }),
            invalidatesTags: ["Address"],
        }),
    }),
});

export const {
    useGetAddressesQuery,
    useAddAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
    useSetDefaultAddressMutation,
} = addressApi;
