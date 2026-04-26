import { apiSlice } from "./apiSlice";
import { IHomePageCMS } from "@/types/home";

export const homeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Legacy Active Page endpoints
        getHomePageData: builder.query<IHomePageCMS, void>({
            query: () => "/home",
            providesTags: ["Home"],
            transformResponse: (response: any) => response.setHomePageData || response.data,
        }),
        
        // New Home Pages Manager endpoints
        getAllHomePages: builder.query<any, void>({
            query: () => "/home/cms/pages",
            providesTags: ["Home"],
            transformResponse: (response: any) => response.data,
        }),
        getHomePageById: builder.query<IHomePageCMS, string>({
            query: (id) => `/home/cms/pages/${id}`,
            providesTags: ["Home"],
            transformResponse: (response: any) => response.data,
        }),
        createDraftPage: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: "/home/cms/pages",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Home"],
        }),
        updateDraftPage: builder.mutation<any, {id: string, body: FormData}>({
            query: ({id, body}) => ({
                url: `/home/cms/pages/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Home"],
        }),
        updatePageStatus: builder.mutation<any, string>({
            query: (id) => ({
                url: `/home/cms/pages/${id}/status`,
                method: "PATCH",
            }),
            invalidatesTags: ["Home"], 
        }),
        deleteDraftPage: builder.mutation<any, string>({
            query: (id) => ({
                url: `/home/cms/pages/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Home"],
        }),
        updateHomePageData: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: "/home/cms/home",
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Home"],
        }),
        updateSeo: builder.mutation<any, { id: string, body: FormData }>({
            query: ({ id, body }) => ({
                url: `/home/home/${id}/seo`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Home"],
        }),
        updateCarousel: builder.mutation<any, { id: string, body: FormData }>({
            query: ({ id, body }) => ({
                url: `/home/home/${id}/carousel`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Home"],
        }),
        addSection: builder.mutation<any, { id: string, body: any }>({
            query: ({ id, body }) => ({
                url: `/home/home/${id}/sections`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Home"],
        }),
        updateSection: builder.mutation<any, { id: string, sectionId: string, body: FormData }>({
            query: ({ id, sectionId, body }) => ({
                url: `/home/home/${id}/sections/${sectionId}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Home"],
        }),
        removeSection: builder.mutation<any, { id: string, sectionId: string }>({
            query: ({ id, sectionId }) => ({
                url: `/home/home/${id}/sections/${sectionId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Home"],
        }),
        updateHeaderLogo: builder.mutation<any, { id: string, body: FormData }>({
            query: ({ id, body }) => ({
                url: `/home/home/${id}/header`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Home"],
        }),
        reorderSections: builder.mutation<any, { id: string, orderMapping: any }>({
            query: ({ id, orderMapping }) => ({
                url: `/home/home/${id}/reorder-sections`,
                method: "PATCH",
                body: { orderMapping },
            }),
            invalidatesTags: ["Home"],
        }),
        toggleHomeStatus: builder.mutation<any, boolean>({
            // ... existing code ... keeping it if it works, but it looks suspicious too based on routes.
            // Looking at routes: router.patch("/updateBanner/:id", homeController.toggleHomePageStatus); 
            // Wait, query below uses /home/updateBanner/${id}. Let's assume the user wants to stick to the plan.
            // I will leave existing untouched if they aren't conflicting, but I need to replace the placeholders.
            query: (isActive) => ({
                url: "/home/cms/home/status",
                method: "PATCH",
                body: { isActive },
            }),
            invalidatesTags: ["Home"],
        }),
        deleteBanner: builder.mutation<any, string>({
            query: (id) => ({
                url: `/home/deleteBanner/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Home"],
        }),
        toggleBannerStatus: builder.mutation<any, string>({
            query: (id) => ({
                url: `/home/updateBanner/${id}`,
                method: "PATCH",
            }),
            invalidatesTags: ["Home"],
        }),
        getPublicSettings: builder.query<any, void>({
            query: () => "/home/settings",
            providesTags: ["Home"],
            transformResponse: (response: any) => response.data.settings,
        }),
        resolveOEmbed: builder.mutation<{title: string, thumbnail_url: string, html: string, provider_name: string}, string>({
            query: (url) => ({
                url: "/home/cms/resolve-oembed",
                method: "POST",
                body: { url },
            }),
            transformResponse: (response: any) => response.data,
        }),
    }),
});

export const {
    // API Hooks
    useGetHomePageDataQuery,
    useUpdateHomePageDataMutation,
    useUpdateSeoMutation,
    useUpdateCarouselMutation,
    useAddSectionMutation,
    useUpdateSectionMutation,
    useRemoveSectionMutation,
    useReorderSectionsMutation,
    useToggleHomeStatusMutation,
    useDeleteBannerMutation,
    useToggleBannerStatusMutation,
    useGetPublicSettingsQuery,
    useUpdateHeaderLogoMutation,
    useResolveOEmbedMutation,
    
    // New Home Pages Manager Hooks
    useGetAllHomePagesQuery,
    useGetHomePageByIdQuery,
    useCreateDraftPageMutation,
    useUpdateDraftPageMutation,
    useUpdatePageStatusMutation,
    useDeleteDraftPageMutation,
} = homeApi;
