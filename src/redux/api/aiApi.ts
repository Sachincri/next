import { apiSlice } from "./apiSlice";

export const aiApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        chat: builder.mutation({
            query: (data) => ({
                url: "/ai/chat",
                method: "POST",
                body: data,
            }),
        }),
        getSuggestions: builder.mutation({
            query: ({ productId, ...data }) => ({
                url: `/ai/suggestions/${productId}`,
                method: "POST",
                body: data,
            }),
        }),
    }),
    overrideExisting: true,
});

export const { useChatMutation, useGetSuggestionsMutation } = aiApi;
