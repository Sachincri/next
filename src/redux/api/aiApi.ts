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
        analystChat: builder.mutation({
            query: (data: { question: string; history: { role: string; content: string }[] }) => ({
                url: "/ai/analyst",
                method: "POST",
                body: data,
            }),
        }),
    }),
    overrideExisting: true,
});

export const { useChatMutation, useGetSuggestionsMutation, useAnalystChatMutation } = aiApi;

