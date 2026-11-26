"use client"
import React, { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Volume2, VolumeX, ArrowRight } from "lucide-react"

interface Banner {
  image?: string | { url?: string; public_id?: string }
  video?: string | { url?: string; public_id?: string }
  title?: string
  subtitle?: string
  ctaText?: string
  redirectLink: string
}

interface BannerSectionProps {
  layout?: "1" | "2" | "3"
  banners?: Banner[]
}

const getMediaUrl = (media: any): string => {
  if (!media) return "";
  if (typeof media === "string") return media.trim();
  if (typeof media === "object" && typeof media.url === "string") return media.url.trim();
  return "";
};

interface BannerCardProps {
  banner: Banner;
  idx: number;
  layout: "1" | "2" | "3";
  aspectClass: string;
  isMobile?: boolean;
}

const BannerCard: React.FC<BannerCardProps> = ({ banner, idx, layout, aspectClass, isMobile = false }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = getMediaUrl(banner.video);
  const imageUrl = getMediaUrl(banner.image);
  const hasVideo = Boolean(videoUrl);
  const hasImage = Boolean(imageUrl);

  const bannerKey = videoUrl || imageUrl || String(idx);
  const href = banner.redirectLink || "#";

  const toggleAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted) {
        videoRef.current.volume = 1;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <Link
      href={href}
      key={bannerKey}
      className={`block group ${isMobile ? `${layout === "1" ? "w-full" : "w-[88vw]"} flex-shrink-0 snap-center transform transition-transform hover:scale-[1.01]` : ""}`}
    >
      <div className={`relative overflow-hidden cursor-pointer w-full ${aspectClass} ${isMobile ? "rounded-xl shadow-md" : "rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1"} transition-all duration-300`}>
        {hasVideo ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={hasImage ? imageUrl : undefined}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <Image
            src={hasImage ? imageUrl : "/placeholder.jpg"}
            alt={banner.title || `Banner ${idx + 1}`}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes={
              isMobile
                ? "(max-width: 768px) 100vw, 85vw"
                : layout === "1"
                ? "100vw"
                : layout === "2"
                ? "50vw"
                : "33vw"
            }
            priority={idx === 0}
          />
        )}

        {/* Audio / Voice Toggle Button for Video */}
        {hasVideo && (
          <button
            type="button"
            onClick={toggleAudio}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 hover:bg-black/85 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-lg hover:scale-105 border border-white/25 cursor-pointer pointer-events-auto"
            title={isMuted ? "Click to unmute voice / sound" : "Click to mute sound"}
          >
            {isMuted ? (
              <>
                <VolumeX size={15} className="text-rose-400" />
                <span className="text-[11px] font-bold">Sound Off</span>
              </>
            ) : (
              <>
                <Volume2 size={15} className="text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold">Sound On</span>
              </>
            )}
          </button>
        )}

        {/* Dark Gradient Overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        {/* Title & CTA Button Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 pointer-events-none">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 w-full">
            {(banner.title || banner.subtitle) && (
              <div className="max-w-xl">
                {banner.title && (
                  <h3 className="text-white font-extrabold text-base sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-lg tracking-tight mb-1 sm:mb-2 line-clamp-2">
                    {banner.title}
                  </h3>
                )}
                {banner.subtitle && (
                  <p className="text-white/90 text-xs sm:text-sm md:text-base font-medium drop-shadow line-clamp-1">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-end sm:self-end pt-1 sm:pt-0 pointer-events-auto ml-auto">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-slate-900 rounded-full font-bold text-xs sm:text-sm shadow-xl transition-all duration-300 transform group-hover:scale-105 group-hover:bg-slate-100 group-hover:shadow-2xl border border-white/30">
                <span>{banner.ctaText || "Shop Now"}</span>
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1 text-slate-900" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const BannerSection: React.FC<BannerSectionProps> = ({ layout = "1", banners }) => {
  if (!banners || banners.length === 0) return null;

  // Layout styles for desktop & mobile with increased, prominent height
  let gridCols = "grid-cols-1"
  let desktopAspect = "aspect-[21/9] lg:aspect-[21/8] min-h-[340px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px]"
  let mobileAspect = "aspect-[16/9] sm:aspect-[2/1] min-h-[210px] sm:min-h-[250px]"

  if (layout === "2") {
    gridCols = "md:grid-cols-2"
    desktopAspect = "aspect-[16/9] lg:aspect-[16/8] min-h-[260px] md:min-h-[320px] lg:min-h-[360px]"
    mobileAspect = "aspect-[16/9] sm:aspect-[2/1] min-h-[190px] sm:min-h-[220px]"
  }
  if (layout === "3") {
    gridCols = "md:grid-cols-3 lg:grid-cols-3"
    desktopAspect = "aspect-[4/3] lg:aspect-[16/10] min-h-[230px] lg:min-h-[280px]"
    mobileAspect = "aspect-[16/9] min-h-[180px]"
  }

  return (
    <div className="w-full md:px-4 mx-auto py-3">
      {/* Mobile: Horizontal scroll container with scroll snapping */}
      <div className="flex md:hidden gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2 px-2">
        {banners.map((banner, idx) => (
          <BannerCard
            key={idx}
            banner={banner}
            idx={idx}
            layout={layout}
            aspectClass={mobileAspect}
            isMobile={true}
          />
        ))}
      </div>

      {/* Desktop: Grid layout */}
      <div className={`hidden md:grid ${gridCols} gap-3 lg:gap-4`}>
        {banners.map((banner, idx) => (
          <BannerCard
            key={idx}
            banner={banner}
            idx={idx}
            layout={layout}
            aspectClass={desktopAspect}
            isMobile={false}
          />
        ))}
      </div>
    </div>
  )
}

export default BannerSection
