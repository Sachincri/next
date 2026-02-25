import { apiSlice } from "./apiSlice";

export const seoApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSitemapData: builder.query<any, void>({
            query: () => "/seo/sitemap",
        }),
    }),
});

export const { useGetSitemapDataQuery } = seoApi;
