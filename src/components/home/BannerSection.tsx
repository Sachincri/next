"use client"
import React from "react"
import Link from "next/link"
import Image from "next/image"

interface Banner {
  image: string
  redirectLink: string
}

interface BannerSectionProps {
  layout?: "1" | "2" | "3"
  banners?: Banner[]
}

const BannerSection: React.FC<BannerSectionProps> = ({ layout, banners }) => {
  if (!banners || banners.length === 0) return null;

  // Layout styles for desktop
  let gridCols = "grid-cols-1"
  let desktopAspect = "aspect-[21/9] lg:aspect-[4/1]"
  let mobileAspect = "aspect-[2.5/1] sm:aspect-[3/1]"

  if (layout === "2") {
    gridCols = "md:grid-cols-2"
    desktopAspect = "aspect-[21/9] lg:aspect-[8/3]"
    mobileAspect = "aspect-[16/8] sm:aspect-[21/9]"
  }
  if (layout === "3") {
    gridCols = "md:grid-cols-3 lg:grid-cols-3"
    desktopAspect = "aspect-[4/3] lg:aspect-[16/9]"
    mobileAspect = "aspect-[16/8]"
  }

  return (
    <div className="w-full md:px-4 mx-auto py-2">
      {/* Mobile: Horizontal scroll container with scroll snapping */}
      <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2 px-2">
        {banners.map((banner, idx) => (
          <Link
            href={banner.redirectLink}
            key={banner.image}
            className={`flex-shrink-0 ${layout === "1" ? "w-full" : "w-[88vw]"} snap-center transform transition-transform hover:scale-[1.02] `}
          >
            <div className={`relative overflow-hidden cursor-pointer w-full ${mobileAspect} group rounded-lg shadow-sm`}>
              <Image
                src={banner.image}
                alt={`Banner`}
                fill
                className=" transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 85vw"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: Grid layout */}
      <div className={`hidden md:grid ${gridCols} gap-2 lg:gap-2`}>
        {banners.map((banner, idx) => (
          <Link href={banner.redirectLink} key={banner.image} className="block group">
            <div className={`relative overflow-hidden cursor-pointer w-full ${desktopAspect} rounded-md shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
              <Image
                src={banner.image}
                alt={`Banner ${idx + 1}`}
                fill
                className=" transition-transform duration-700 ease-out group-hover:scale-105"
                sizes={
                  layout === "1" ? "100vw" :
                    layout === "2" ? "50vw" : "33vw"
                }
                priority={idx < (layout === "1" ? 1 : layout === "2" ? 2 : 3)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BannerSection
