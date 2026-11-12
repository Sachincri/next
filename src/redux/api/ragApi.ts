import { apiSlice } from "./apiSlice";

export const ragApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        ragChat: builder.mutation({
            query: (data: { message: string; sessionId: string; pageContext?: any }) => ({
                url: "/rag/chat",
                method: "POST",
                body: data,
            }),
        }),
        getRagSession: builder.query({
            query: (sessionId: string) => `/rag/sessions/${sessionId}`,
        }),
        submitRagFeedback: builder.mutation({
      query: ({ sessionId, rating }: { sessionId: string; rating: number }) => ({
        url: `/rag/sessions/${sessionId}/feedback`,
        method: "POST",
        body: { rating },
      }),
    }),
    getRagStats: builder.query({
      query: () => `/rag/stats`,
      providesTags: ["RAG_Stats"],
    }),
    ingestKnowledge: builder.mutation({
      query: (data: { title: string; content: string; sourceType: string }) => ({
        url: "/rag/ingest",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RAG_Stats"],
    }),
  }),
  overrideExisting: true,
});

export const { 
    useRagChatMutation, 
    useGetRagSessionQuery, 
    useSubmitRagFeedbackMutation,
    useGetRagStatsQuery,
    useIngestKnowledgeMutation
} = ragApi;
