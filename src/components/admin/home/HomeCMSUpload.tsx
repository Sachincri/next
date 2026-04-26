// HomeCMSUpload.tsx - Refactored version
"use client";

import React, { FC, useState, useCallback, useEffect } from "react";
import { Settings, Eye, X, Save, Loader2, AlertCircle, LayoutTemplate } from "lucide-react";
import {
    useCreateBrandMutation,
    useCreateCategoryMutation,
    useGetCategoriesQuery,
} from "@/redux/api/adminApi";
import {
    useGetHomePageDataQuery,
    useGetHomePageByIdQuery,
    useGetAllHomePagesQuery,
    useUpdateHomePageDataMutation,
    useUpdateDraftPageMutation,
    useUpdateSeoMutation,
    useUpdateCarouselMutation,
    useUpdateSectionMutation,
    useResolveOEmbedMutation,
} from "@/redux/api/homeApi";
import toast from "react-hot-toast";
import { z } from "zod";
import {
    IHomePageCMS,
    CarouselItem,
    Banner,
    ProductsSection,
    SingleProductSection,
    SectionType,
    VideoReel,
} from "@/types/home";

// Internal Components
import { CollapsibleSection, ImageUploadField, SaveIndicator, ErrorBadge } from "./components/CMSComponents";
import { SEOSettings } from "./components/SEOSettings";
import { CarouselSettings } from "./components/CarouselSettings";
import { HeaderSettings } from "./components/HeaderSettings";
import { SectionSettings } from "./components/SectionSettings";
import { BrandCategorySettings } from "./components/BrandCategorySettings";
import { HomePageSelector } from "./components/HomePageSelector";
import { useUpdateHeaderLogoMutation } from "@/redux/api/homeApi";

// ============================================================================
// Validation Schemas
// ============================================================================

const imageSchema = z.union([
    z.string().min(1, "Please upload an image"),
    z.object({
        url: z.string().min(1, "Image URL is required"),
        public_id: z.string().optional()
    })
]);

const carouselItemSchema = z.object({
    image: imageSchema,
    title: z.string().min(1, "Please enter a title").max(100, "Title must be less than 100 characters"),
    subtitle: z.string().max(200, "Subtitle must be less than 200 characters").optional(),
    redirectLink: z.string().refine(
        (val) => val === "" || val === undefined || z.string().url().safeParse(val).success,
        { message: "Please enter a valid URL or leave empty" }
    ).optional(),
});

const seoSchema = z.object({
    title: z.string().min(1, "Page title is required").max(60, "Title must be 60 characters or less"),
    metaDescription: z.string().max(160, "Description must be 160 characters or less").optional(),
    slug: z.string()
        .min(1, "URL slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    ogImage: z.union([
        z.string().refine(
            (val) => !val || z.string().url().safeParse(val).success,
            { message: "Please enter a valid image URL or leave empty" }
        ),
        z.object({
            url: z.string().optional(),
            public_id: z.string().optional()
        })
    ]).optional(),
});

// ============================================================================
// Main Component
// ============================================================================

const HomeCMSIntegrated: FC = () => {
    // API Hooks
    const [createBrand, { isLoading: brandLoading }] = useCreateBrandMutation();
    const [createCategory, { isLoading: categoryLoading }] = useCreateCategoryMutation();
    const [updateHomePage, { isLoading: updateLoading }] = useUpdateHomePageDataMutation(); // Keep for global save/creation handling if needed

    // Global State
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

    // Modular Mutations
    const [updateDraftPage] = useUpdateDraftPageMutation();
    const [updateSEO, { isLoading: seoLoading }] = useUpdateSeoMutation();
    const [updateCarousel, { isLoading: carouselLoading }] = useUpdateCarouselMutation();
    const [updateSection, { isLoading: sectionLoading }] = useUpdateSectionMutation(); // We'll assume the hook handles the sectionId logic

    // Fetch lists and data
    const { data: pagesListResponse } = useGetAllHomePagesQuery();

    useEffect(() => {
        if (pagesListResponse?.data) {
            const pages = pagesListResponse.data;

            // If nothing selected, or if current selection is not in the list (stale), pick a default
            const isCurrentValid = selectedPageId && pages.some((p: any) => p._id === selectedPageId);

            if (!isCurrentValid && pages.length > 0) {
                const activePage = pages.find((p: any) => p.isActive);
                setSelectedPageId(activePage?._id || pages[0]._id);
            }
        }
    }, [pagesListResponse, selectedPageId]);

    const { data: homeData, isLoading: dataLoading, refetch: refetchHomeData } = useGetHomePageByIdQuery(selectedPageId as string, { skip: !selectedPageId });

    // State
    const [seo, setSeo] = useState<IHomePageCMS["seo"]>({
        title: "",
        metaDescription: "",
        slug: "home",
        ogImage: "",
    });

    const [carousel, setCarousel] = useState<IHomePageCMS["carousel"]>({
        items: [],
    });

    const [sections, setSections] = useState<IHomePageCMS["sections"]>([]);
    const [headerLogo, setHeaderLogo] = useState<IHomePageCMS["headerLogo"]>("");
    const [storeName, setStoreName] = useState<string>("");
    const [preview, setPreview] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
    const [openSectionId, setOpenSectionId] = useState<number | null>(null);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        seo: false,
        logo: false,
        carousel: false,
        brands: false
    });

    // Brand & Category State
    const [brandName, setBrandName] = useState("");
    const [brandPreview, setBrandPreview] = useState("");
    const [brandFile, setBrandFile] = useState<File | null>(null);

    const [categoryName, setCategoryName] = useState("");
    const [categoryPreview, setCategoryPreview] = useState("");
    const [categoryFile, setCategoryFile] = useState<File | null>(null);
    const [categoryParent, setCategoryParent] = useState(""); // parent category _id or empty string

    // Fetch existing categories for parent selector
    const { data: categoriesList = [] } = useGetCategoriesQuery();

    // Load data
    useEffect(() => {
        if (homeData) {
            setSeo({
                ...homeData.seo,
                ogImage: homeData.seo?.ogImage // Preserve object structure
            });

            setHeaderLogo(homeData.headerLogo);
            setStoreName(homeData.storeName || "");

            setCarousel({
                ...homeData.carousel,
                items: (homeData.carousel?.items || []).map(item => ({
                    ...item,
                    image: item.image // Preserve object {public_id, url}
                }))
            });

            setSections((homeData.sections || []).map(section => {
                if (section.type === "products" || section.type === "single_product_carousel") {
                    return {
                        ...section,
                        id: section.id || (section as any)._id,
                        products: {
                            ...section.products,
                            items: (section.products.items || []).map(item => ({
                                ...item,
                                image: item.image // Preserve object
                            }))
                        }
                    } as any;
                } else if (section.type === "quad_grid") {
                    return {
                        ...section,
                        id: section.id || (section as any)._id,
                        quads: ((section as any).quads || []).map((quad: any) => ({
                            ...quad,
                            items: (quad.items || []).map((item: any) => ({
                                ...item,
                                image: item.image // Preserve object
                            }))
                        }))
                    } as any;
                } else if (section.type === "banner1" || section.type === "banner2" || section.type === "banner3") {
                    return {
                        ...section,
                        id: section.id || (section as any)._id, // Ensure we have id
                        banners: (section.banners || []).map((banner: any) => ({
                            ...banner,
                            image: banner.image // Preserve object
                        }))
                    } as any;
                } else if (section.type === "video_reels") {
                    return {
                        ...section,
                        id: section.id || (section as any)._id,
                        videoReels: ((section as any).videoReels || []).map((reel: any) => ({
                            ...reel,
                            video: reel.video,
                            thumbnail: reel.thumbnail,
                        }))
                    } as any;
                } else {
                    return {
                        ...section,
                        id: section.id || (section as any)._id
                    } as any;
                }
            }));
        }
    }, [homeData]);

    // Auto-hide save status
    useEffect(() => {
        if (saveStatus === "saved" || saveStatus === "error") {
            const timer = setTimeout(() => setSaveStatus("idle"), 3000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    // Validation
    const validateData = useCallback((): boolean => {
        try {
            seoSchema.parse(seo);
            z.object({
                items: z.array(carouselItemSchema).optional()
            }).parse(carousel);

            if (sections.length > 0) {
                sections.forEach((section, idx) => {
                    if (section.type === "products" || section.type === "single_product_carousel") {
                        if (!section.products.heading || section.products.heading.trim() === "") {
                            throw new Error(`Section ${idx + 1}: Section heading is required`);
                        }
                        if (section.products.items.length === 0) {
                            throw new Error(`Section ${idx + 1}: At least one product/image is required`);
                        }
                        section.products.items.forEach((item, pIdx) => {
                            if (!item.image) throw new Error(`Section ${idx + 1}, Item ${pIdx + 1}: Image is required`);
                            if (!item.title) throw new Error(`Section ${idx + 1}, Item ${pIdx + 1}: Title is required`);
                        });
                    } else if (section.type === "quad_grid") {
                        // Quad Grid Validation
                    } else if (section.type === "banner1" || section.type === "banner2" || section.type === "banner3") {
                        section.banners.forEach((banner, bIdx) => {
                            if (!banner.image) throw new Error(`Section ${idx + 1}, Banner ${bIdx + 1}: Image is required`);
                            if (!banner.title) throw new Error(`Section ${idx + 1}, Banner ${bIdx + 1}: Title is required`);
                        });
                    } else if (section.type === "video_reels") {
                        (section as any).videoReels?.forEach((reel: any, rIdx: number) => {
                            if (!reel.video) throw new Error(`Section ${idx + 1}, Reel ${rIdx + 1}: Video file is required`);
                        });
                    }
                });
            }
            setValidationErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                error.issues.forEach(err => errors[err.path.join(".")] = err.message);
                setValidationErrors(errors);
                const firstError = error.issues[0];
                toast.error(`${firstError.path.join(" → ")}: ${firstError.message}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
            return false;
        }
    }, [seo, carousel, sections]);

    // Helpers
    const cleanDataForSubmission = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(cleanDataForSubmission);

        // If it's a valid existing image object with public_id and url, keep it
        if (obj.url && obj.public_id && !obj.url.startsWith('blob:')) {
            return { url: obj.url, public_id: obj.public_id };
        }

        const newObj: any = {};
        for (const key in obj) {
            // Skip properties that shouldn't be sent if needed, but for now allow all
            const val = obj[key];
            if (typeof val === 'string' && val.startsWith('blob:')) {
                newObj[key] = { public_id: "pending", url: "pending" };
            } else {
                newObj[key] = cleanDataForSubmission(val);
            }
        }
        return newObj;
    };

    // Modular Handlers
    const handleSaveSEO = async () => {
        if (!homeData || !homeData._id) return toast.error("Save the page first to enable modular updates");

        try {
            seoSchema.parse(seo);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                error.issues.forEach(err => errors[err.path.join(".")] = err.message);
                setValidationErrors(errors);
                return toast.error("Please fix SEO validation errors");
            }
        }

        setSaveStatus("saving");
        const formData = new FormData();
        const payload = cleanDataForSubmission(seo);
        formData.append("payload", JSON.stringify(payload));

        const ogImageUrl = typeof seo.ogImage === 'object' ? (seo.ogImage as any).url : seo.ogImage;
        if (ogImageUrl?.startsWith("blob:")) {
            const file = pendingFiles[ogImageUrl];
            if (file) formData.append("seo.ogImage", file);
        }

        try {
            const res = await updateSEO({ id: homeData._id, body: formData }).unwrap();
            setSaveStatus("saved");
            toast.success(res?.message || "SEO Settings Saved");
            // Clear pending files related to SEO
            if (seo.ogImage) {
                const ogUrl = typeof seo.ogImage === 'object' ? (seo.ogImage as any).url : seo.ogImage;
                const { [ogUrl]: _, ...rest } = pendingFiles;
                setPendingFiles(rest);
            }
        } catch (e: any) {
            setSaveStatus("error");
            toast.error(e?.data?.message || "Failed to save SEO");
        }
    }

    const handleSaveHeader = async () => {
        if (!homeData || !homeData._id) return toast.error("Save the page first to enable modular updates");
        if (!headerLogo) return toast.error("Please upload a logo");

        setSaveStatus("saving");
        const formData = new FormData();
        const logoUrl = typeof headerLogo === 'object' ? headerLogo.url : headerLogo;

        if (logoUrl?.startsWith("blob:")) {
            const file = pendingFiles[logoUrl];
            if (file) formData.append("headerLogo", file);
        }
        formData.append("storeName", storeName);

        try {
            const res = await updateHeaderLogo({ id: homeData._id, body: formData }).unwrap();
            setSaveStatus("saved");
            toast.success(res?.message || "Header Settings Saved");
        } catch (e: any) {
            setSaveStatus("error");
            toast.error(e?.data?.message || "Failed to save Header Settings");
        }
    }

    const [updateHeaderLogo, { isLoading: headerLoading }] = useUpdateHeaderLogoMutation();

    const handleSaveCarousel = async () => {
        if (!homeData || !homeData._id) return toast.error("Save the page first to enable modular updates");

        try {
            z.object({
                items: z.array(carouselItemSchema).min(1, "At least one carousel slide is required")
            }).parse(carousel);
        } catch (e) { /* handle error */ return toast.error("Please fix Carousel validation errors"); }

        setSaveStatus("saving");
        const formData = new FormData();
        const payload = cleanDataForSubmission(carousel);
        formData.append("payload", JSON.stringify(payload));

        carousel.items.forEach((item, idx) => {
            const imageUrl = typeof item.image === 'object' ? (item.image as any).url : item.image;
            if (imageUrl?.startsWith("blob:")) {
                const file = pendingFiles[imageUrl];
                if (file) formData.append(`items.${idx}.image`, file);
            }
        });

        try {
            const res = await updateCarousel({ id: homeData._id, body: formData }).unwrap();
            setSaveStatus("saved");
            toast.success(res?.message || "Carousel Saved");
            // Cleanup pending would be more complex here, can be optimized later
        } catch (e: any) {
            setSaveStatus("error");
            toast.error(e?.data?.message || "Failed to save Carousel");
        }
    }

    const handleSaveSection = async (sectionId: number) => {
        if (!homeData || !homeData._id) return toast.error("Save the page first to enable modular updates");
        const section = sections.find(s => s.id === sectionId);
        if (!section) return;

        // Find actual section index or ID to map
        // NOTE: section.id used in frontend might be temp ID if new, but here we assume it maps to _id for existing sections.
        // If it's a new section (just added), it won't have a real _id unless we saved logic differently.
        // For now, let's assume we are updating EXISTING sections.
        // If it's a number (Date.now()), it's likely not persisted.
        // But wait, our getHomePageData maps _id to id if possible or we need to ensure it.

        // Simplified check:
        const realId = (section as any)._id || (typeof section.id === 'string' ? section.id : null);
        if (!realId) {
            return toast.error("This section is not saved on server yet. Please save the entire page first."); // Or implement addSection granularly
        }

        setSaveStatus("saving");
        const formData = new FormData();
        const cleanSection = cleanDataForSubmission(section);
        formData.append("payload", JSON.stringify(cleanSection));

        // Append files
        if (section.type === 'products' || section.type === 'single_product_carousel') {
            section.products.items.forEach((item, pIdx) => {
                const img = typeof item.image === 'object' ? (item.image as any).url : item.image;
                if (img?.startsWith("blob:")) {
                    const file = pendingFiles[img];
                    if (file) formData.append(`products.items.${pIdx}.image`, file);
                }
            });
        } else if (section.type === 'quad_grid') {
            (section as any).quads.forEach((quad: any, qIdx: number) => {
                quad.items.forEach((item: any, iIdx: number) => {
                    const img = typeof item.image === 'object' ? (item.image as any).url : item.image;
                    if (img?.startsWith("blob:")) {
                        const file = pendingFiles[img];
                        if (file) formData.append(`quads.${qIdx}.items.${iIdx}.image`, file);
                    }
                });
            });
        } else if (section.type === 'video_reels') {
            ((section as any).videoReels || []).forEach((reel: any, rIdx: number) => {
                const vidUrl = typeof reel.video === 'object' ? reel.video?.url : reel.video;
                if (vidUrl?.startsWith("blob:")) {
                    const file = pendingFiles[vidUrl];
                    if (file) formData.append(`videoReels.${rIdx}.video`, file);
                }
                const thumbUrl = typeof reel.thumbnail === 'object' ? reel.thumbnail?.url : reel.thumbnail;
                if (thumbUrl?.startsWith("blob:")) {
                    const file = pendingFiles[thumbUrl];
                    if (file) formData.append(`videoReels.${rIdx}.thumbnail`, file);
                }
            });
        } else {
            const hasBanners = (section as any).banners;
            if (hasBanners) {
                (section as any).banners.forEach((banner: any, bIdx: number) => {
                    const img = typeof banner.image === 'object' ? (banner.image as any).url : banner.image;
                    if (img?.startsWith("blob:")) {
                        const file = pendingFiles[img];
                        if (file) formData.append(`banners.${bIdx}.image`, file);
                    }
                });
            }
        }

        try {
            const res = await updateSection({ id: homeData._id, sectionId: realId, body: formData }).unwrap();
            setSaveStatus("saved");
            toast.success(res?.message || "Section Saved");
        } catch (e: any) {
            setSaveStatus("error");
            toast.error(e?.data?.message || "Failed to save Section");
        }
    }


    // Handlers
    const handleCreateBrand = async () => {
        if (!brandName || !brandFile) {
            toast.error("Please provide both brand name and logo");
            return;
        }
        const formData = new FormData();
        formData.append("name", brandName);
        formData.append("logo", brandFile);
        try {
            const res = await createBrand(formData).unwrap();
            toast.success(res?.message || "Brand created successfully");
            setBrandName("");
            setBrandFile(null);
            setBrandPreview("");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create brand");
        }
    };

    const handleCreateCategory = async () => {
        if (!categoryName || !categoryFile) {
            toast.error("Please provide both category name and image");
            return;
        }
        const formData = new FormData();
        formData.append("name", categoryName);
        formData.append("image", categoryFile);
        if (categoryParent) formData.append("parent", categoryParent);
        try {
            const res = await createCategory(formData).unwrap();
            toast.success(res?.message || "Category created successfully");
            setCategoryName("");
            setCategoryFile(null);
            setCategoryPreview("");
            setCategoryParent("");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create category");
        }
    };

    const handleSubmit = async () => {
        if (!selectedPageId) {
            toast.error("No page selected to save. Please select or create a draft first.");
            return;
        }

        if (!validateData()) {
            setSaveStatus("error");
            return;
        }
        setSaveStatus("saving");
        try {
            const formData = new FormData();

            const dataPayload = cleanDataForSubmission({ seo, carousel, sections, isActive: true });
            formData.append("payload", JSON.stringify(dataPayload));

            const logoUrl = typeof headerLogo === 'object' ? headerLogo.url : headerLogo;
            if (logoUrl?.startsWith("blob:")) {
                const file = pendingFiles[logoUrl];
                if (file) formData.append("headerLogo", file);
            }

            const ogImageUrl = typeof seo.ogImage === 'object' ? (seo.ogImage as any).url : seo.ogImage;
            if (ogImageUrl?.startsWith("blob:")) {
                const file = pendingFiles[ogImageUrl];
                if (file) formData.append("seo.ogImage", file);
            }

            carousel.items.forEach((item, idx) => {
                const imageUrl = typeof item.image === 'object' ? (item.image as any).url : item.image;
                if (imageUrl?.startsWith("blob:")) {
                    const file = pendingFiles[imageUrl];
                    if (file) formData.append(`carousel.items.${idx}.image`, file);
                }
            });

            sections.forEach((section, sIdx) => {
                if (section.type === "products" || section.type === "single_product_carousel") {
                    section.products.items.forEach((item, pIdx) => {
                        const img = typeof item.image === 'object' ? (item.image as any).url : item.image;
                        if (img?.startsWith("blob:")) {
                            const file = pendingFiles[img];
                            if (file) formData.append(`sections.${sIdx}.products.items.${pIdx}.image`, file);
                        }
                    });
                } else if (section.type === "quad_grid" && (section as any).quads) {
                    (section as any).quads.forEach((quad: any, qIdx: number) => {
                        quad.items.forEach((item: any, iIdx: number) => {
                            const img = typeof item.image === 'object' ? (item.image as any).url : item.image;
                            if (img?.startsWith("blob:")) {
                                const file = pendingFiles[img];
                                if (file) formData.append(`sections.${sIdx}.quads.${qIdx}.items.${iIdx}.image`, file);
                            }
                        });
                    });
                } else if (section.type.startsWith("banner")) {
                    (section as any).banners.forEach((banner: any, bIdx: number) => {
                        const img = typeof banner.image === 'object' ? (banner.image as any).url : banner.image;
                        if (img?.startsWith("blob:")) {
                            const file = pendingFiles[img];
                            if (file) formData.append(`sections.${sIdx}.banners.${bIdx}.image`, file);
                        }
                    });
                } else if (section.type === "video_reels" && (section as any).videoReels) {
                    ((section as any).videoReels || []).forEach((reel: any, rIdx: number) => {
                        const vidUrl = typeof reel.video === 'object' ? reel.video?.url : reel.video;
                        if (vidUrl?.startsWith("blob:")) {
                            const file = pendingFiles[vidUrl];
                            if (file) formData.append(`sections.${sIdx}.videoReels.${rIdx}.video`, file);
                        }
                        const thumbUrl = typeof reel.thumbnail === 'object' ? reel.thumbnail?.url : reel.thumbnail;
                        if (thumbUrl?.startsWith("blob:")) {
                            const file = pendingFiles[thumbUrl];
                            if (file) formData.append(`sections.${sIdx}.videoReels.${rIdx}.thumbnail`, file);
                        }
                    });
                }
            });

            const res = await updateDraftPage({ id: selectedPageId as string, body: formData }).unwrap();
            setSaveStatus("saved");
            toast.success(res?.message || "Home page saved successfully");
            setPendingFiles({});
        } catch (error: any) {
            setSaveStatus("error");
            const serverErrors = error?.data?.errors;
            if (serverErrors && Array.isArray(serverErrors) && serverErrors.length > 0) {
                serverErrors.forEach((e: any) => toast.error(e.message || e));
            } else {
                toast.error(error?.data?.message || "Failed to save home page");
            }
            console.error("Save Error:", error?.data || error);
        }
    };

    // Sub-handlers
    const addCarouselItem = () => {
        setCarousel(prev => ({ items: [...prev.items, { image: "", title: "", subtitle: "", redirectLink: "" }] }));
    };

    const updateCarouselItem = (index: number, field: keyof CarouselItem, value: string, file?: File) => {
        if (field === "image" && file) setPendingFiles(prev => ({ ...prev, [value]: file }));
        setCarousel(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value } as any;
            return { items: newItems };
        });
    };

    const removeCarouselItem = (index: number) => {
        if (carousel.items.length === 1) return toast.error("At least one carousel item is required");
        setCarousel(prev => ({ items: prev.items.filter((_, i) => i !== index) }));
    };

    const addSection = (type: "products" | "banner" | "quad_grid" | "single_product" | "video_reels", count?: number) => {
        const newOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 2;
        if (type === "products") {
            const newSection: ProductsSection = {
                id: Date.now(),
                order: newOrder,
                type: "products",
                products: { heading: "", items: [{ image: "", title: "", subtitle: "", redirectLink: "" }] },
            };
            setSections(prev => [...prev, newSection]);
            setOpenSectionId(newSection.id);
        } else if (type === "single_product") {
            const newSection: SingleProductSection = {
                id: Date.now(),
                order: newOrder,
                type: "single_product_carousel",
                products: { heading: "", items: [{ image: "", title: "", subtitle: "", redirectLink: "" }] },
            };
            setSections(prev => [...prev, newSection]);
            setOpenSectionId(newSection.id);
        } else if (type === "banner") {
            const bannerCount = count ?? 1;
            const sectionType: SectionType = bannerCount === 1 ? "banner1" : bannerCount === 2 ? "banner2" : "banner3";
            const newSection = {
                id: Date.now(),
                order: newOrder,
                type: sectionType,
                banners: Array.from({ length: bannerCount }, () => ({ image: "", title: "", redirectLink: "" })),
            };
            setSections(prev => [...prev, newSection as any]);
            setOpenSectionId(newSection.id);
        } else if (type === "quad_grid") {
            const newSection = {
                id: Date.now(),
                order: newOrder,
                type: "quad_grid",
                quads: [],
            };
            setSections(prev => [...prev, newSection as any]);
            setOpenSectionId(newSection.id);
        } else if (type === "video_reels") {
            const newSection = {
                id: Date.now(),
                order: newOrder,
                type: "video_reels",
                videoReels: [],
            };
            setSections(prev => [...prev, newSection as any]);
            setOpenSectionId(newSection.id);
        }
    };

    const addQuadColumn = (sectionId: number) => {
        setSections(prev => {
            return prev.map(s => {
                if (s.id === sectionId && s.type === "quad_grid") {
                    const newQuad = {
                        title: "",
                        redirectLink: "",
                        redirectText: "Shop all",
                        items: [{ image: "", title: "", redirectLink: "" }],
                        layout: "single" as any
                    };
                    return { ...s, quads: [...(s.quads || []), newQuad] };
                }
                return s;
            });
        });
        toast.success("Column added to grid");
    };

    const removeQuadColumn = (sectionId: number, quadIndex: number) => {
        setSections(prev => {
            return prev.map(s => {
                if (s.id === sectionId && s.type === "quad_grid") {
                    const newQuads = [...(s.quads || [])].filter((_, i) => i !== quadIndex);
                    return { ...s, quads: newQuads };
                }
                return s;
            });
        });
        toast.success("Column removed from grid");
    };

    const removeSection = (id: number) => {
        setSections(prev => prev.filter(s => s.id !== id));
        toast.success("Section removed");
    };

    const moveSection = (index: number, direction: "up" | "down") => {
        setSections(prev => {
            const newSections = [...prev];
            const targetIndex = direction === "up" ? index - 1 : index + 1;
            if (targetIndex >= 0 && targetIndex < newSections.length) {
                [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
                newSections.forEach((s, i) => s.order = i + 2);
            }
            return newSections;
        });
    };

    const updateProductsInSection = (id: number, products: ProductsSection["products"]) => {
        setSections(prev => prev.map(s => (s.id === id && s.type === "products" ? { ...s, products } : s)));
    };

    const updateBannerInSection = (sectionId: number, bannerIndex: number, field: keyof Banner, value: string, file?: File) => {
        if (field === "image" && file) setPendingFiles(prev => ({ ...prev, [value]: file }));
        setSections(prev => prev.map(s => {
            if (s.id === sectionId && (s.type === "banner1" || s.type === "banner2" || s.type === "banner3")) {
                const newBanners = [...s.banners];
                newBanners[bannerIndex] = { ...newBanners[bannerIndex], [field]: value };
                return { ...s, banners: newBanners };
            }
            return s;
        }));
    };

    const addProductToSection = (sectionId: number) => {
        setSections(prev => prev.map(s => (s.id === sectionId && s.type === "products" ? { ...s, products: { ...s.products, items: [...s.products.items, { image: "", title: "", subtitle: "", redirectLink: "" }] } } : s)));
    };

    const updateProductInSection = (sectionId: number, productIndex: number, field: keyof CarouselItem, value: string, file?: File) => {
        if (field === "image" && file) setPendingFiles(prev => ({ ...prev, [value]: file }));
        setSections(prev => prev.map(s => {
            if (s.id === sectionId && s.type === "products") {
                const newItems = [...s.products.items];
                newItems[productIndex] = { ...newItems[productIndex], [field]: value };
                return { ...s, products: { ...s.products, items: newItems } };
            }
            return s;
        }));
    };

    const removeProductFromSection = (sectionId: number, productIndex: number) => {
        setSections(prev => prev.map(s => {
            if (s.id === sectionId && s.type === "products") {
                if (s.products.items.length === 1) { toast.error("At least one product is required"); return s; }
                return { ...s, products: { ...s.products, items: s.products.items.filter((_, i) => i !== productIndex) } };
            }
            return s;
        }));
    };

    const updateQuadInSection = (sectionId: number, quadIndex: number, field: string, value: string, file?: File) => {
        setSections(prev => prev.map(s => {
            if (s.id === sectionId && s.type === "quad_grid") {
                const newQuads = [...(s as any).quads];
                let currentQuad = { ...newQuads[quadIndex], [field]: value };

                // Ensure correct number of items if layout changes
                if (field === "layout") {
                    if (value === "grid" && currentQuad.items.length < 4) {
                        const needed = 4 - currentQuad.items.length;
                        currentQuad.items = [...currentQuad.items, ...Array.from({ length: needed }, () => ({ image: "", title: "", redirectLink: "" }))];
                    } else if (value === "single" && currentQuad.items.length === 0) {
                        currentQuad.items = [{ image: "", title: "", redirectLink: "" }];
                    } else if (value === "carousel" && currentQuad.items.length < 1) {
                        currentQuad.items = [{ image: "", title: "", redirectLink: "" }];
                    }
                }

                newQuads[quadIndex] = currentQuad;
                return { ...s, quads: newQuads };
            }
            return s;
        }));
    };

    const updateQuadItemInSection = (sectionId: number, quadIndex: number, itemIndex: number, field: string, value: string, file?: File) => {
        if (field === "image" && file) setPendingFiles(prev => ({ ...prev, [value]: file }));
        setSections(prev => prev.map(s => {
            if (s.id === sectionId && s.type === "quad_grid") {
                const newQuads = [...(s as any).quads];
                const newItems = [...newQuads[quadIndex].items];
                newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
                newQuads[quadIndex] = { ...newQuads[quadIndex], items: newItems };
                return { ...s, quads: newQuads };
            }
            return s;
        }));
    };

    const updateSectionProperty = (sectionId: number, field: string, value: any) => {
        setSections(prev => prev.map(s => (s.id === sectionId ? { ...s, [field]: value } : s)));
    };

    const addReelToSection = (sectionId: number) => {
        setSections(prev => prev.map(s => {
            if (s.id === sectionId && s.type === "video_reels") {
                return { ...s, videoReels: [...(s.videoReels || []), { video: "", thumbnail: "", title: "", subtitle: "", redirectLink: "" }] };
            }
            return s;
        }));
    };

    const removeReelFromSection = (sectionId: number, reelIndex: number) => {
        setSections(prev => prev.map(s => {
            if (s.id === sectionId && s.type === "video_reels") {
                const reels = s.videoReels || [];
                return { ...s, videoReels: reels.filter((_, idx) => idx !== reelIndex) };
            }
            return s;
        }));
    };

    const updateReelInSection = (sectionId: number, reelIndex: number, field: string, value: string, file?: File) => {
        if ((field === "video" || field === "thumbnail") && file) {
            setPendingFiles(prev => ({ ...prev, [value]: file }));
        }
        setSections(prev => prev.map(s => {
            if (s.id === sectionId && s.type === "video_reels") {
                const newReels = [...(s.videoReels || [])];
                newReels[reelIndex] = { ...newReels[reelIndex], [field]: value };
                return { ...s, videoReels: newReels };
            }
            return s;
        }));
    };

    const [resolveOEmbed] = useResolveOEmbedMutation();

    const resolveReelUrl = async (sectionId: number, reelIndex: number, url: string) => {
        if (!url) return;

        const tid = toast.loading("Resolving video URL...");
        try {
            const data = await resolveOEmbed(url).unwrap();
            setSections(prev => prev.map(s => {
                if (s.id === sectionId && s.type === "video_reels") {
                    const newReels = [...(s.videoReels || [])];
                    newReels[reelIndex] = {
                        ...newReels[reelIndex],
                        oembedUrl: url,
                        oembedHtml: data.html,
                        title: newReels[reelIndex].title || data.title,
                        thumbnail: newReels[reelIndex].thumbnail || (data.thumbnail_url ? { url: data.thumbnail_url, public_id: "oembed" } : ""),
                        isOEmbed: true
                    };
                    return { ...s, videoReels: newReels };
                }
                return s;
            }));
            toast.success("Resolved successfully!", { id: tid });
        } catch (error: any) {
            toast.error(error.data?.message || "Failed to resolve URL", { id: tid });
        }
    };

    if (dataLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 size={48} className="animate-spin text-blue-600" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Loading home page data...</p>
            </div>
        );
    }

    return (
        <div className="w-full transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                                    <Settings size={28} />
                                </div>
                                Home Page CMS
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg">Manage your homepage content, banners, and layout.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <button
                                onClick={() => setPreview(!preview)}
                                className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all font-bold shadow-sm"
                            >
                                {preview ? <X size={20} /> : <Eye size={20} />}
                                <span>{preview ? "Edit Mode" : "Preview"}</span>
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={updateLoading}
                                className="w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold disabled:opacity-50 disabled:hover:translate-y-0 shadow-md shadow-blue-600/20"
                            >
                                {updateLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                    {!preview && Object.keys(validationErrors).length > 0 && (
                        <div className="mt-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                            <h3 className="font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                                <AlertCircle size={20} />
                                Validation Failed
                            </h3>
                            <ul className="space-y-1 ml-7">
                                {Object.entries(validationErrors).map(([key, message]) => (
                                    <li key={key} className="text-sm text-red-700 dark:text-red-300 list-disc">{key}: {message}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {!preview ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <HomePageSelector
                            selectedPageId={selectedPageId}
                            onSelectPage={setSelectedPageId}
                        />

                        {selectedPageId ? (
                            <>
                                <SEOSettings
                                    seo={seo} setSeo={setSeo} validationErrors={validationErrors}
                                    isOpen={expandedSections.seo} onToggle={() => setExpandedSections(p => ({ ...p, seo: !p.seo }))}
                                    onSave={handleSaveSEO}
                                    onFileChange={(file, url) => setPendingFiles(prev => ({ ...prev, [url]: file }))}
                                />
                                <HeaderSettings
                                    headerLogo={headerLogo}
                                    setHeaderLogo={(val) => setHeaderLogo(val as any)}
                                    storeName={storeName}
                                    setStoreName={setStoreName}
                                    onSave={handleSaveHeader}
                                    isLoading={headerLoading}
                                    isOpen={expandedSections.logo}
                                    onToggle={() => setExpandedSections(p => ({ ...p, logo: !p.logo }))}
                                    onFileChange={(file, url) => setPendingFiles(prev => ({ ...prev, [url]: file }))}
                                />
                                <CarouselSettings
                                    carousel={carousel} addCarouselItem={addCarouselItem} updateCarouselItem={updateCarouselItem} removeCarouselItem={removeCarouselItem}
                                    validationErrors={validationErrors} isOpen={expandedSections.carousel} onToggle={() => setExpandedSections(p => ({ ...p, carousel: !p.carousel }))}
                                    onSave={handleSaveCarousel}
                                />
                                <SectionSettings
                                    sections={sections}
                                    addSection={addSection}
                                    removeSection={removeSection}
                                    moveSection={moveSection}
                                    updateBannerInSection={updateBannerInSection}
                                    addProductToSection={addProductToSection}
                                    updateProductInSection={updateProductInSection}
                                    removeProductFromSection={removeProductFromSection}
                                    updateProductsInSection={updateProductsInSection}
                                    validationErrors={validationErrors}
                                    openSectionId={openSectionId}
                                    setOpenSectionId={setOpenSectionId}
                                    updateQuadInSection={updateQuadInSection}
                                    updateQuadItemInSection={updateQuadItemInSection}
                                    onSaveSection={handleSaveSection}
                                    updateSectionProperty={updateSectionProperty}
                                    addQuadColumn={addQuadColumn}
                                    removeQuadColumn={removeQuadColumn}
                                    addReelToSection={addReelToSection}
                                    removeReelFromSection={removeReelFromSection}
                                    updateReelInSection={updateReelInSection}
                                    resolveReelUrl={resolveReelUrl}
                                />
                                <BrandCategorySettings
                                    brandName={brandName} setBrandName={setBrandName} brandPreview={brandPreview} brandLoading={brandLoading} handleCreateBrand={handleCreateBrand} setBrandFile={setBrandFile} setBrandPreview={setBrandPreview}
                                    categoryName={categoryName} setCategoryName={setCategoryName} categoryPreview={categoryPreview} categoryLoading={categoryLoading} handleCreateCategory={handleCreateCategory} setCategoryFile={setCategoryFile} setCategoryPreview={setCategoryPreview}
                                    categoryParent={categoryParent} setCategoryParent={setCategoryParent}
                                    categories={categoriesList as any[]}
                                    isOpen={expandedSections.brands} onToggle={() => setExpandedSections(p => ({ ...p, brands: !p.brands }))}
                                />
                            </>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <LayoutTemplate className="w-10 h-10 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Page Selected</h3>
                                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
                                    Please select an existing home page version from the selector above, or create a new draft to start editing.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-center mb-8">
                            <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm font-bold tracking-wide uppercase">Preview Mode</span>
                        </div>
                        <div className="border-8 border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden pointer-events-none shadow-2xl">
                            <img
                                src={typeof carousel.items[0]?.image === 'object' ? carousel.items[0].image.url : carousel.items[0]?.image}
                                alt="preview"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                )}

                <SaveIndicator status={saveStatus} />
            </div>
        </div>
    );
};

export default HomeCMSIntegrated;