"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy-load all non-critical sections to minimise initial JS bundle
const HomeProducts = dynamic(() => import("./HomeProducts").then(mod => mod.HomeProducts));
const BannerSection = dynamic(() => import("./BannerSection"));
const QuadGrid = dynamic(() => import("./QuadGrid"));
const CarouselSlider = dynamic(() => import("./CustomCarousel"));
const SingleProductCarousel = dynamic(() => import("./SingleProductCarousel"));
const VideoReelsSection = dynamic(() => import("./VideoReelsSection"), { ssr: false });
// CategorySection is above-the-fold but client-only (uses RTK Query), keep lazy to avoid bundle bloat
const CategorySection = dynamic(() => import("./CategorySection"));
const AISuggestions = dynamic(() => import("../product/AISuggestions"), { ssr: false });
const ProductSlider = dynamic(() => import("../product/ProductSlider").then(mod => mod.ProductSlider), { ssr: false });

import toast from "react-hot-toast";
import { useGetHomePageDataQuery } from "@/redux/api/homeApi";
import { useAppSelector } from "@/redux/hooks";
import { useGetRecentlyViewedQuery } from "@/redux/api/productApi";
import { RootState } from "@/redux/store";
import { HomeSkeleton } from "./HomeSkeleton";

interface HomeProps {
  initialData?: any;
}


export default function Home({ initialData }: HomeProps) {
  // Skip the client-side fetch entirely when the server already provided initialData (ISR).
  // This prevents the double-fetch pattern where both SSR and client RTK Query fire simultaneously.
  const { data: apiData, error, isLoading } = useGetHomePageDataQuery(undefined, {
    skip: !!initialData,
  });
  const { isAuthenticated } = useAppSelector((state: RootState) => state.user);
  const { recentlyViewed: localRecentlyViewed } = useAppSelector((state: RootState) => state.product);
  const { data: serverRecentlyViewed } = useGetRecentlyViewedQuery(undefined, { skip: !isAuthenticated });

  const homeData = apiData || initialData;

  const recentlyViewedProducts = (localRecentlyViewed && localRecentlyViewed.length > 0)
    ? localRecentlyViewed
    : (serverRecentlyViewed || []);
  useEffect(() => {
    if (error) {
      const err = error as any;
      toast.error(err.data?.message || "Failed to load home page data");
    }
  }, [error]);

  if (isLoading && !homeData) {
    return <HomeSkeleton />;
  }

  if (!homeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-2">No data available</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-4">We couldn't load the home page content. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getSectionStyle = (bgGradient?: string) => {
    if (!bgGradient) return {};
    if (bgGradient.includes("linear-gradient") || bgGradient.includes("radial-gradient")) {
      return { background: bgGradient };
    }
    return {};
  };

  const getSectionClass = (bgGradient?: string, type?: string) => {
    if (!bgGradient) {
      if (type === "quad_grid") return "bg-gray-100 dark:bg-slate-900/50";
      return "bg-white dark:bg-slate-800/50";
    }
    if (bgGradient.includes("linear-gradient") || bgGradient.includes("radial-gradient")) {
      return "";
    }
    return bgGradient; // Assume it's a tailwind class
  };

  return (
    <main className="min-h-screen w-full  dark:bg-slate-950 overflow-x-hidden">

      <div className="md:mx-2 md:mt-2">
        <CategorySection />
      </div>
      {/* Main Content */}
      <div className="space-y-2">
        {/* Carousel Section */}
        {homeData.carousel?.items && homeData.carousel.items.length > 0 && (
          <div className="">
            <CarouselSlider banners={homeData.carousel.items.map((it: any) => ({
              id: it._id,
              image: it.image?.url || it.image,
              redirectLink: it.redirectLink || "#"
            }))} />
          </div>
        )}

        {/* AI Suggestions Section */}
        <AISuggestions productId={recentlyViewedProducts[0]?._id} />

        {/* Sections */}
        {homeData.sections && Array.isArray(homeData.sections) && homeData.sections.length > 0 ? (
          homeData.sections.map((section: any) => (
            <div
              key={section._id}
              className={`transition-all duration-500 ${getSectionClass(section.bgGradient, section.type)}`}
              style={getSectionStyle(section.bgGradient)}
            >
              <div className=" py-2">
                {/* Banner Sections */}
                {(section.type === "banner1" || section.type === "banner2" || section.type === "banner3") && section.banners && section.banners.length > 0 && (
                  <BannerSection
                    layout={section.type === "banner1" ? "1" : section.type === "banner2" ? "2" : "3"}
                    banners={section.banners.map((b: any) => ({
                      image: b.image?.url || b.image,
                      redirectLink: b.redirectLink || "#"
                    }))}
                  />
                )}

                {/* Product Section */}
                {section.type === "products" && section.products && (
                  <HomeProducts products={{
                    heading: section.products.heading,
                    items: (section.products.items || []).map((it: any) => ({
                      id: it._id,
                      image: it.image?.url || it.image,
                      title: it.title,
                      subtitle: it.subtitle,
                      redirectLink: it.redirectLink || "#"
                    }))
                  }} />
                )}

                {/* Single Product Carousel Section */}
                {section.type === "single_product_carousel" && section.products && (
                  <SingleProductCarousel products={{
                    heading: section.products.heading,
                    items: (section.products.items || []).map((it: any) => ({
                      image: it.image?.url || it.image,
                      title: it.title,
                      subtitle: it.subtitle,
                      redirectLink: it.redirectLink || "#"
                    }))
                  }} />
                )}

                {/*  Quad Grid Section */}
                {section.type === "quad_grid" && section.quads && (
                  <QuadGrid
                    mobileColumns={section.mobileColumns}
                    quads={section.quads.map((q: any) => ({
                      title: q.title,
                      layout: q.layout || "grid",
                      redirectLink: q.redirectLink || "#",
                      redirectText: q.redirectText || "See more",
                      items: (q.items || []).map((it: any) => ({
                        image: it.image?.url || it.image,
                        title: it.title,
                        redirectLink: it.redirectLink || "#"
                      }))
                    }))} />
                )}

                {/* Video Reels Section */}
                {section.type === "video_reels" && section.videoReels && section.videoReels.length > 0 && (
                  <VideoReelsSection
                    heading={section.products?.heading || "Trending Reels"}
                    reels={section.videoReels.map((r: any) => ({
                      video: r.video?.url || r.video,
                      thumbnail: r.thumbnail?.url || r.thumbnail,
                      title: r.title,
                      subtitle: r.subtitle,
                      redirectLink: r.redirectLink || "",
                      productId: r.productId || "",
                      oembedUrl: r.oembedUrl || "",
                      oembedHtml: r.oembedHtml || "",
                      isOEmbed: r.isOEmbed || false,
                    }))}
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="text-center py-10">
              <p className="text-gray-500">No content sections available.</p>
            </div>
          )
        )}

        {/* Infinite Scroll Section */}
        {/* <HomeInfiniteScroll /> */}

        {/* Recently Viewed Section */}
        {recentlyViewedProducts.length > 0 && (
          <div className="pb-8">
            <ProductSlider products={recentlyViewedProducts} heading="Recently Viewed" />
          </div>
        )}
      </div>
    </main>
  );
}
