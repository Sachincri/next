import { apiSlice } from "./apiSlice";
import { User, ApiResponse } from "@/types";

/** Credentials for password-based login */
interface LoginCredentials { email: string; password: string }
/** Credentials for new user registration */
interface RegisterPayload { name: string; email: string; password: string; phone?: string }
/** Partial user update payload */
interface UpdateProfilePayload { name?: string; phone?: string; avatar?: string }

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<ApiResponse<{ user: User }>, LoginCredentials>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ["User"],
        }),
        register: builder.mutation<ApiResponse<{ message: string }>, RegisterPayload>({
            query: (userData) => ({
                url: "/auth/register",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["User"],
        }),
        loadUser: builder.query<User, void>({
            query: () => "/auth/me",
            providesTags: ["User"],
            transformResponse: (response: ApiResponse<{ user: User }> & { user?: User }) =>
                response.data?.user ?? response.user ?? null as unknown as User,
        }),
        logout: builder.mutation<ApiResponse<null>, void>({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
            invalidatesTags: ["User"],
        }),
        sendLoginOtp: builder.mutation<ApiResponse<{ message: string }>, { email: string }>({
            query: (body) => ({
                url: "/auth/send-login-otp",
                method: "POST",
                body,
            }),
        }),
        verifyLoginOtp: builder.mutation<ApiResponse<{ user: User }>, { email: string; otp: string }>({
            query: (body) => ({
                url: "/auth/login-otp",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),
        verifyEmailOtp: builder.mutation<ApiResponse<{ user: User }>, { email: string; otp: string }>({
            query: (body) => ({
                url: "/auth/verify-email",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),
        updateProfile: builder.mutation<ApiResponse<{ user: User }>, UpdateProfilePayload>({
            query: (userData) => ({
                url: "/users/profile",
                method: "PATCH",
                body: userData,
            }),
            invalidatesTags: ["User"],
        }),
        updatePassword: builder.mutation<ApiResponse<null>, { oldPassword: string; newPassword: string }>({
            query: (passwords) => ({
                url: "/users/password",
                method: "PATCH",
                body: passwords,
            }),
        }),
        forgotPassword: builder.mutation<ApiResponse<{ message: string }>, { email: string }>({
            query: (body) => ({
                url: "/auth/forgot-password",
                method: "POST",
                body,
            }),
        }),
        resetPassword: builder.mutation<ApiResponse<null>, { token: string; body: { password: string } }>({
            query: ({ token, body }) => ({
                url: `/auth/reset-password/${token}`,
                method: "PATCH",
                body,
            }),
        }),
        getCoinHistory: builder.query<unknown, void>({
            query: () => "/users/coins",
            providesTags: ["User"],
            transformResponse: (response: ApiResponse<unknown>) => response.data,
        }),
        getMyReviews: builder.query<unknown, void>({
            query: () => "/products/reviews/me",
            providesTags: ["User"],
            transformResponse: (response: ApiResponse<unknown>) => response.data,
        }),
        getMyNotifications: builder.query<{ notifications: any[]; unreadCount: number }, void>({
            query: () => "/notifications",
            providesTags: ["User"],
            transformResponse: (response: ApiResponse<{ notifications: any[]; unreadCount: number }>) => response.data || { notifications: [], unreadCount: 0 },
        }),
        markAsRead: builder.mutation<ApiResponse<null>, string>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: "PATCH",
            }),
            invalidatesTags: ["User"],
        }),
        markAllAsRead: builder.mutation<ApiResponse<null>, void>({
            query: () => ({
                url: "/notifications/read-all",
                method: "PATCH",
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLoadUserQuery,
    useLogoutMutation,
    useSendLoginOtpMutation,
    useVerifyLoginOtpMutation,
    useVerifyEmailOtpMutation,
    useUpdateProfileMutation,
    useUpdatePasswordMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGetCoinHistoryQuery,
    useGetMyReviewsQuery,
    useGetMyNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} = userApi;
