import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CategorySkeleton = () => (
  <div className="w-full bg-white dark:bg-slate-800 shadow-sm border-b border-gray-100 dark:border-slate-700">
    <div className="container mx-auto px-2 sm:px-4">
      <div className="flex items-center sm:justify-center justify-start gap-4 sm:gap-8 overflow-hidden py-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 px-2 min-w-[70px] sm:min-w-0 flex-shrink-0">
            <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-full" />
            <Skeleton className="h-2.5 w-12 sm:w-14" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HeroSkeleton = () => (
  <div className="w-full px-0">
    <Skeleton className="w-full aspect-[21/9] sm:aspect-[21/7] rounded-none" />
  </div>
);

const QuadGridSkeleton = () => (
  <div className="w-full px-2 lg:px-4 py-4">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 p-4 border-r border-b border-slate-100 dark:border-slate-700 last:border-r-0">
          <Skeleton className="h-6 w-3/4 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full rounded" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-3 w-20 mt-4" />
        </div>
      ))}
    </div>
  </div>
);

const ProductSliderSkeleton = () => (
  <div className="w-full bg-white dark:bg-slate-900 py-6">
    <div className="px-4 sm:px-6 mb-6 flex justify-between items-center">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="px-4 sm:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[3/4] sm:aspect-[3/5] lg:h-60 w-full rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const VideoReelsSkeleton = () => (
  <div className="w-full py-8 bg-slate-50 dark:bg-slate-900/50">
    <div className="px-4 sm:px-6 mb-6">
      <Skeleton className="h-7 w-40" />
    </div>
    <div className="px-4 sm:px-6 flex gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-44 sm:w-56">
          <Skeleton className="aspect-[9/16] w-full rounded-xl" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BannerSkeleton = () => (
  <div className="w-full px-2 lg:px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
     <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
     <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
     <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
  </div>
);

export const HomeSkeleton = () => {
  return (
    <main className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 overflow-x-hidden">
      {/* Matches the real CategorySection container */}
      <div className="md:mx-2 md:mt-2">
        <CategorySkeleton />
      </div>

      <div className="space-y-2 pb-10">
        {/* Main Banner Hero */}
        <HeroSkeleton />

        {/* AI Suggestions Placeholder */}
        <div className="px-4 py-1">
           <Skeleton className="h-14 w-full rounded-xl border border-primary/5 bg-white/50 dark:bg-slate-800/50" />
        </div>

        {/* Quad Grid Section - Matching QuadGrid.tsx padding */}
        <QuadGridSkeleton />

        {/* Triple Banner Section */}
        <BannerSkeleton />

        {/* Trending Products */}
        <ProductSliderSkeleton />

        {/* Video Reels Section */}
        <VideoReelsSkeleton />

        {/* More Products */}
        <ProductSliderSkeleton />
      </div>
    </main>
  );
};
