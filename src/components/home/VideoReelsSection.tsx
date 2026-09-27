"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, ShoppingBag, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface VideoReel {
    video: string | { url: string; public_id?: string };
    thumbnail?: string | { url: string; public_id?: string };
    title?: string;
    subtitle?: string;
    redirectLink?: string;
    productId?: string;
    oembedUrl?: string;
    oembedHtml?: string;
    isOEmbed?: boolean;
}

interface VideoReelsSectionProps {
    heading?: string;
    reels: VideoReel[];
}

const getUrl = (media: string | { url: string; public_id?: string } | undefined): string => {
    if (!media) return "";
    if (typeof media === "string") return media;
    return media.url || "";
};

/* ─── Skeleton Reel Card ─── */
const SkeletonReel: React.FC = () => (
    <div className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-slate-900/60 to-transparent">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 w-3/4 rounded mb-2" />
            <div className="h-3 bg-slate-300 dark:bg-slate-700 w-1/2 rounded" />
        </div>
    </div>
);

/* ─── Single Premium Reel Card ─── */
interface ReelCardProps {
    reel: VideoReel;
    index: number;
    isActive: boolean;
    onEnded: () => void;
    onManualPlay: (index: number) => void;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel, index, isActive, onEnded, onManualPlay }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showPoster, setShowPoster] = useState(true);

    const videoUrl = getUrl(reel.video);
    const thumbnailUrl = getUrl(reel.thumbnail);

    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setIsVideoLoaded(false);
        setVideoError(false);
        setShowPoster(true);
    }, [videoUrl]);

    // IntersectionObserver for lazy mounting & autoplay
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasEnteredViewport(true);
                }
                if (entry.intersectionRatio >= 0.4) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            },
            { threshold: [0, 0.4] }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Playback control based on visibility & active status
    useEffect(() => {
        const video = videoRef.current;
        if (!video || reel.isOEmbed) return;

        if (isVisible && isActive) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        setShowPoster(false);
                    })
                    .catch(() => {
                        setIsPlaying(false);
                    });
            }
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, [isVisible, isActive, reel.isOEmbed]);

    const handleCardClick = (e: React.MouseEvent) => {
        const video = videoRef.current;
        if (!video || reel.isOEmbed) return;

        onManualPlay(index);

        if (video.paused) {
            video.play().then(() => {
                setIsPlaying(true);
                setShowPoster(false);
            }).catch(() => {});
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video || !video.duration) return;
        const currentProgress = (video.currentTime / video.duration) * 100;
        setProgress(currentProgress);
    };

    const cardContent = (
        <div
            ref={containerRef}
            onClick={handleCardClick}
            className="group relative w-[68vw] sm:w-[48vw] md:w-[260px] lg:w-[280px] aspect-[9/16] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-950 transition-all duration-300 flex-shrink-0 cursor-pointer select-none"
        >
            {/* Poster / Thumbnail Fallback */}
            {thumbnailUrl && showPoster && (
                <div className="absolute inset-0 z-10 w-full h-full">
                    <img
                        src={thumbnailUrl}
                        alt={reel.title || "Reel"}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Video Element */}
            {hasEnteredViewport && !reel.isOEmbed && videoUrl && !videoError && (
                <video
                    key={videoUrl}
                    ref={videoRef}
                    src={videoUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: isVideoLoaded ? 1 : (showPoster ? 0 : 1) }}
                    muted={isMuted}
                    playsInline
                    preload="metadata"
                    onLoadedData={() => setIsVideoLoaded(true)}
                    onEnded={onEnded}
                    onTimeUpdate={handleTimeUpdate}
                    onError={() => {
                        setVideoError(true);
                        onEnded();
                    }}
                    poster={thumbnailUrl || undefined}
                />
            )}

            {/* OEmbed (YouTube, TikTok etc.) */}
            {reel.isOEmbed && reel.oembedUrl && (
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    {(() => {
                        if (reel.oembedUrl.includes('youtube.com') || reel.oembedUrl.includes('youtu.be')) {
                            const match = reel.oembedUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                            const videoId = match ? match[1] : reel.oembedUrl.split('youtu.be/')[1]?.split('?')[0];
                            if (videoId) {
                                return (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&modestbranding=1&rel=0&playsinline=1`}
                                        className="absolute inset-0 w-full h-full border-0 scale-[1.35]"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                );
                            }
                        }
                        return (
                            <div
                                className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
                                dangerouslySetInnerHTML={{ __html: reel.oembedHtml || "" }}
                            />
                        );
                    })()}
                </div>
            )}

            {/* Top Bar: Live Pill & Sound Button */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                {/* Pulse Tag */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Reels</span>
                </div>

                {/* Mute/Unmute Toggle */}
                {!reel.isOEmbed && (
                    <button
                        onClick={toggleMute}
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                        className="pointer-events-auto w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                )}
            </div>

            {/* Centered Play Overlay Icon when paused */}
            {!isPlaying && !reel.isOEmbed && (
                <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
                    <div className="w-13 h-13 rounded-full bg-white/25 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Bottom Gradient Overlay + Product Details */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 pt-14 flex flex-col justify-end">
                {/* Product Title & Subtitle */}
                <div className="mb-3">
                    {reel.title && (
                        <h3 className="text-white font-bold text-xs sm:text-sm line-clamp-1 leading-tight drop-shadow-sm mb-0.5">
                            {reel.title}
                        </h3>
                    )}
                    {reel.subtitle && (
                        <p className="text-white/75 text-[10px] sm:text-[11px] line-clamp-1 font-medium">
                            {reel.subtitle}
                        </p>
                    )}
                </div>

                {/* Shop Now Action Button */}
                {reel.redirectLink && (
                    <Link
                        href={reel.redirectLink}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
                    >
                        <ShoppingBag size={14} className="text-slate-900" />
                        <span>Shop Product</span>
                    </Link>
                )}
            </div>

            {/* Bottom Progress Bar */}
            {!reel.isOEmbed && isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 z-30 bg-white/20">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 rounded-full transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );

    return cardContent;
};

/* ─── Main Video Reels Carousel Section ─── */
export default function VideoReelsSection({ heading = "Trending Reels", reels }: VideoReelsSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [activeReelIndex, setActiveReelIndex] = useState(0);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 15);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollState();
        el.addEventListener("scroll", updateScrollState, { passive: true });
        return () => el.removeEventListener("scroll", updateScrollState);
    }, [updateScrollState]);

    const handleReelEnd = useCallback(() => {
        setTimeout(() => {
            setActiveReelIndex((prev) => (prev + 1) % reels.length);
        }, 1500);
    }, [reels.length]);

    const handleManualPlay = useCallback((index: number) => {
        setActiveReelIndex(index);
    }, []);

    const scroll = useCallback((dir: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = dir === "left" ? -320 : 320;
        el.scrollBy({ left: amount, behavior: "smooth" });
    }, []);

    if (!reels || reels.length === 0) return null;

    return (
        <section className="w-full relative py-3 sm:py-5">
            {/* Header with Luxury Gradient Accent */}
            <div className="flex items-center justify-between px-3 sm:px-6 mb-3 sm:mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                        <Sparkles className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {heading}
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            Watch & Buy • {reels.length} Trending Shorts
                        </p>
                    </div>
                </div>

                {/* Desktop Navigation Arrows */}
                <div className="hidden md:flex items-center gap-1.5">
                    <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        aria-label="Previous Reels"
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                            canScrollLeft
                                ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 shadow-sm cursor-pointer"
                                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                        }`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        aria-label="Next Reels"
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                            canScrollRight
                                ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 shadow-sm cursor-pointer"
                                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                        }`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Horizontal Snap Scroll Slider */}
            <div className="relative group">
                <div
                    ref={scrollRef}
                    className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-3 px-3 sm:px-6"
                >
                    {reels.map((reel, index) => (
                        <div key={index} className="flex-shrink-0 snap-center">
                            <ReelCard
                                reel={reel}
                                index={index}
                                isActive={activeReelIndex === index}
                                onEnded={handleReelEnd}
                                onManualPlay={handleManualPlay}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
