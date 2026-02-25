import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../constants";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: server,
        prepareHeaders: (headers) => {
            // By default, credentials are handled by fetchBaseQuery if configured
            return headers;
        },
        credentials: 'include',
    }),
    tagTypes: ["Product", "User", "Order", "Admin", "Home", "Cart", "Review", "Brand", "Category", "RecentlyViewed", "Address", "Wishlist"],
    endpoints: () => ({}),
});
