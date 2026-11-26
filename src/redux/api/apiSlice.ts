import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../constants";
import { getStoredReferralCode } from "@/components/common/ReferralTracker";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: server,
        prepareHeaders: (headers) => {
            const refCode = getStoredReferralCode();
            if (refCode) {
                headers.set("x-referral-code", refCode);
            }
            return headers;
        },
        credentials: 'include',
    }),
    tagTypes: ["Product", "User", "Order", "Admin", "Home", "Cart", "Review", "Brand", "Category", "RecentlyViewed", "Address", "Wishlist", "Recommendations", "RAG_Stats", "Disputes", "Support", "Wallet", "Share", "Contest", "Privacy"],
    endpoints: () => ({}),
});
