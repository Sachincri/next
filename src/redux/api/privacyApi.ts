import { apiSlice } from "./apiSlice";

export type ConsentPurpose =
  | "cookies_essential"
  | "cookies_analytics"
  | "cookies_marketing"
  | "privacy_notice"
  | "marketing_email"
  | "marketing_whatsapp";

export interface RecordConsentPayload {
  anonymousId?: string;
  email?: string;
  source?: string;
  policyVersion?: string;
  consents?: Array<{ purpose: ConsentPurpose; status: "granted" | "withdrawn" }>;
  analytics?: boolean;
  marketing?: boolean;
  emailMarketing?: boolean;
  whatsappMarketing?: boolean;
  privacyNoticeAccepted?: boolean;
}

export interface DataRequestPayload {
  type: "access" | "deletion" | "correction" | "grievance";
  subject?: string;
  notes?: string;
  immediateAnonymization?: boolean;
}

export const privacyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    recordConsent: builder.mutation<any, RecordConsentPayload>({
      query: (body) => ({
        url: "/privacy/consent",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Privacy", "User"],
    }),

    getMyPrivacyData: builder.query<any, void>({
      query: () => "/privacy/me",
      providesTags: ["Privacy"],
      transformResponse: (res: any) => res?.data || res,
    }),

    updateMarketingConsent: builder.mutation<
      any,
      { emailMarketing?: boolean; whatsappMarketing?: boolean }
    >({
      query: (body) => ({
        url: "/privacy/marketing",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Privacy", "User"],
    }),

    exportMyData: builder.query<any, void>({
      query: () => "/privacy/export",
      transformResponse: (res: any) => res?.data || res,
    }),

    submitDataRequest: builder.mutation<any, DataRequestPayload>({
      query: (body) => ({
        url: "/privacy/requests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Privacy", "Admin", "User"],
    }),

    getAdminPrivacyOverview: builder.query<any, { status?: string } | void>({
      query: (params) => ({
        url: "/privacy/admin/overview",
        params: params || undefined,
      }),
      providesTags: ["Privacy", "Admin"],
      transformResponse: (res: any) => res?.data || res,
    }),

    updateAdminDataRequest: builder.mutation<
      any,
      { id: string; status: "pending" | "in_progress" | "completed" | "rejected"; adminNotes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/privacy/admin/requests/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Privacy", "Admin"],
    }),
  }),
});

export const {
  useRecordConsentMutation,
  useGetMyPrivacyDataQuery,
  useUpdateMarketingConsentMutation,
  useLazyExportMyDataQuery,
  useSubmitDataRequestMutation,
  useGetAdminPrivacyOverviewQuery,
  useUpdateAdminDataRequestMutation,
} = privacyApi;
