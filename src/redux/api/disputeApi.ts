import { apiSlice } from "./apiSlice";

export const disputeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Customer submits a dispute with formData (photos, videos, reason, etc.)
    createDisputeClaim: builder.mutation({
      query: (formData: FormData) => ({
        url: "/disputes",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Disputes", "Order"],
    }),

    // Customer gets their own dispute claims
    getMyDisputes: builder.query({
      query: () => "/disputes/my-claims",
      providesTags: ["Disputes"],
    }),

    // Get single claim details
    getDisputeDetails: builder.query({
      query: (id: string) => `/disputes/${id}`,
      providesTags: ["Disputes"],
    }),

    // Admin: Get all disputes
    getAdminDisputes: builder.query({
      query: (params?: { status?: string; reason?: string; search?: string; page?: number; limit?: number }) => ({
        url: "/disputes/admin/all",
        params,
      }),
      providesTags: ["Disputes"],
    }),

    // Admin: Upload warehouse packing evidence
    uploadAdminEvidence: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/disputes/admin/${id}/upload-evidence`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Disputes"],
    }),

    // Admin: Manually trigger AI forensic review
    triggerAiReview: builder.mutation({
      query: (id: string) => ({
        url: `/disputes/admin/${id}/trigger-ai-review`,
        method: "POST",
      }),
      invalidatesTags: ["Disputes"],
    }),

    // Admin: Resolve dispute
    resolveDispute: builder.mutation({
      query: ({ id, data }: { id: string; data: { action: string; reason?: string; refundAmount?: number; creditToWallet?: boolean } }) => ({
        url: `/disputes/admin/${id}/resolve`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Disputes", "Order", "Admin"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateDisputeClaimMutation,
  useGetMyDisputesQuery,
  useGetDisputeDetailsQuery,
  useGetAdminDisputesQuery,
  useUploadAdminEvidenceMutation,
  useTriggerAiReviewMutation,
  useResolveDisputeMutation,
} = disputeApi;

