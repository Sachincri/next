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
            query: (data: {
                question: string;
                history?: { role: string; content: string }[];
                conversationHistory?: { role: string; content: string }[];
                sessionId?: string;
            }) => ({
                url: "/admin/ai-analyst/ask",
                method: "POST",
                body: data,
            }),
        }),
        askAnalyst: builder.mutation({
            query: (data: {
                question: string;
                conversationHistory?: { role: string; content: string }[];
                sessionId?: string;
            }) => ({
                url: "/admin/ai-analyst/ask",
                method: "POST",
                body: data,
            }),
        }),
        getProactiveAlerts: builder.query<any, void>({
            query: () => "/admin/ai-analyst/proactive-alerts",
            providesTags: ["Admin"],
        }),
    }),
    overrideExisting: true,
});

export const {
    useChatMutation,
    useGetSuggestionsMutation,
    useAnalystChatMutation,
    useAskAnalystMutation,
    useGetProactiveAlertsQuery,
} = aiApi;
