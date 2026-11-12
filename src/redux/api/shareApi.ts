import { apiSlice } from "./apiSlice";

export const shareApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Share Link endpoints
    createShareLink: builder.mutation<any, { productId?: string; customCode?: string }>({
      query: (body) => ({
        url: "/share/link",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Share"],
    }),

    getMyShareLinks: builder.query<any, void>({
      query: () => "/share/my-links",
      providesTags: ["Share"],
    }),

    getMyShareStats: builder.query<any, void>({
      query: () => "/share/my-stats",
      providesTags: ["Share", "Wallet"],
    }),

    getMyReferredOrders: builder.query<any, void>({
      query: () => "/share/my-referrals",
      providesTags: ["Share", "Order", "Wallet"],
    }),

    deactivateShareLink: builder.mutation<any, string>({
      query: (id) => ({
        url: `/share/link/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Share"],
    }),

    // Wallet endpoints
    getMyWallet: builder.query<any, void>({
      query: () => "/share/wallet",
      providesTags: ["Wallet"],
    }),

    getWalletTransactions: builder.query<any, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/share/wallet/transactions",
        params: params || undefined,
      }),
      providesTags: ["Wallet"],
    }),

    setWalletPin: builder.mutation<any, { pin: string }>({
      query: (body) => ({
        url: "/share/wallet/set-pin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet"],
    }),

    // Contests & Leaderboards
    getLeaderboard: builder.query<any, { limit?: number; period?: "all" | "month" | "week" } | void>({
      query: (params) => ({
        url: "/share/leaderboard",
        params: params || undefined,
      }),
      providesTags: ["Contest", "Share"],
    }),

    getContests: builder.query<any, { status?: string } | void>({
      query: (params) => ({
        url: "/share/contests",
        params: params || undefined,
      }),
      providesTags: ["Contest"],
    }),

    getContestLeaderboard: builder.query<any, string>({
      query: (contestId) => `/share/contest/${contestId}/leaderboard`,
      providesTags: ["Contest"],
    }),

    getContestWinners: builder.query<any, { status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/share/contests",
        params: { status: "completed", ...(params || {}) },
      }),
      providesTags: ["Contest"],
    }),

    // Admin endpoints
    getAdminAffiliateOverview: builder.query<any, void>({
      query: () => "/share/admin/overview",
      providesTags: ["Admin", "Wallet", "Share"],
    }),

    getAdminWallets: builder.query<any, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/share/admin/wallets",
        params: params || undefined,
      }),
      providesTags: ["Admin", "Wallet"],
    }),

    getAdminTransactions: builder.query<any, { page?: number; limit?: number; type?: string } | void>({
      query: (params) => ({
        url: "/share/admin/transactions",
        params: params || undefined,
      }),
      providesTags: ["Admin", "Wallet"],
    }),

    createContest: builder.mutation<any, any>({
      query: (body) => ({
        url: "/share/contest",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contest", "Admin"],
    }),

    getContestDrawPreview: builder.query<any, string>({
      query: (contestId) => `/share/contest/${contestId}/draw-preview`,
      providesTags: ["Contest"],
    }),

    completeContest: builder.mutation<any, string | { contestId: string; method?: "weighted_random" | "leaderboard" }>({
      query: (arg) => {
        const contestId = typeof arg === "string" ? arg : arg.contestId;
        const body = typeof arg === "object" ? { method: arg.method || "weighted_random" } : { method: "weighted_random" };
        return {
          url: `/share/contest/${contestId}/complete`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Contest", "Admin", "Wallet"],
    }),

    toggleWalletFreeze: builder.mutation<any, { userId: string; reason?: string }>({
      query: ({ userId, reason }) => ({
        url: `/share/admin/wallet/${userId}/freeze`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Admin", "Wallet"],
    }),

    adminWalletAdjust: builder.mutation<any, { userId: string; type: "credit" | "debit"; amount: number; description: string }>({
      query: ({ userId, ...body }) => ({
        url: `/share/admin/wallet/${userId}/adjust`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admin", "Wallet"],
    }),
  }),
});

export const {
  useCreateShareLinkMutation,
  useGetMyShareLinksQuery,
  useGetMyShareStatsQuery,
  useGetMyReferredOrdersQuery,
  useDeactivateShareLinkMutation,
  useGetMyWalletQuery,
  useGetWalletTransactionsQuery,
  useSetWalletPinMutation,
  useGetLeaderboardQuery,
  useGetContestsQuery,
  useGetContestLeaderboardQuery,
  useGetContestWinnersQuery,
  useGetAdminAffiliateOverviewQuery,
  useGetAdminWalletsQuery,
  useGetAdminTransactionsQuery,
  useCreateContestMutation,
  useCompleteContestMutation,
  useGetContestDrawPreviewQuery,
  useLazyGetContestDrawPreviewQuery,
  useToggleWalletFreezeMutation,
  useAdminWalletAdjustMutation,
} = shareApi;
