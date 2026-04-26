"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, ShoppingBag, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";

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
    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-slate-900/50 to-transparent">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 w-3/4 rounded mb-2" />
            <div className="h-3 bg-slate-300 dark:bg-slate-700 w-1/2 rounded" />
        </div>
    </div>
);

/* ─── Single Reel Card ─── */
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
    const [views] = useState(() => Math.floor(Math.random() * 50 + 5) + "K");

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

    // Reset states if URL changes (important for Reels that might swap sources)
    useEffect(() => {
        setIsVideoLoaded(false);
        setVideoError(false);
        setShowPoster(true);
    }, [videoUrl]);

    // IntersectionObserver – lazy load video DOM and auto-play
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // If it enters the viewport even a bit, we lazy load the DOM
                if (entry.isIntersecting) {
                    setHasEnteredViewport(true);
                }
                // Auto play logic - more lenient threshold for reliability
                if (entry.intersectionRatio >= 0.3) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            },
            { threshold: [0, 0.3] }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Play/Pause based on visibility and isActive status
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isVisible && isActive) {
            video.play().then(() => {
                setIsPlaying(true);
                setShowPoster(false);
            }).catch(() => { /* autoplay blocked */ });
        } else {
            video.pause();
            setIsPlaying(false);
            // Reset progress if not active
            if (!isActive) setProgress(0);
        }
    }, [isVisible, isActive]);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (video && video.duration) {
            setProgress((video.currentTime / video.duration) * 100);
        }
    }, []);

    const toggleMute = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const handleVideoClick = useCallback(() => {
        if (reel.isOEmbed) return; // embeds have their own interactions
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            onManualPlay(index);
            video.play().then(() => setIsPlaying(true));
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, [reel.isOEmbed, index, onManualPlay]);

    // Handle oEmbed scripts (Instagram/TikTok often need their widgets.js)
    useEffect(() => {
        if (isMounted && reel.isOEmbed && reel.oembedHtml) {
            // Instagram
            if (reel.oembedHtml.includes("instagram.com")) {
                if (!(window as any).instgrm) {
                    const script = document.createElement("script");
                    script.src = "https://www.instagram.com/embed.js";
                    script.async = true;
                    script.onload = () => {
                        console.log("Instagram script loaded successfully");
                        if ((window as any).instgrm) (window as any).instgrm.Embeds.process();
                    };
                    document.body.appendChild(script);
                } else {
                    console.log("Re-processing Instagram embed");
                    (window as any).instgrm.Embeds.process();
                }
            }
            // TikTok
            if (reel.oembedHtml.includes("tiktok.com")) {
                const existingScript = document.querySelector('script[src*="tiktok.com/embed.js"]');
                if (!existingScript) {
                    const script = document.createElement("script");
                    script.src = "https://www.tiktok.com/embed.js";
                    script.async = true;
                    document.body.appendChild(script);
                }
            }
        }
    }, [isMounted, reel.isOEmbed, reel.oembedHtml]);

    const content = (
        <div
            ref={containerRef}
            className="w-full relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/10"
            onClick={handleVideoClick}
        >
            {/* Poster / Thumbnail */}
            {showPoster && thumbnailUrl && !reel.isOEmbed && (
                <div className={`absolute inset-0 z-10 transition-opacity duration-500 ${isVideoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <img
                        src={thumbnailUrl}
                        alt={reel.title || "Video thumbnail"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => setVideoError(true)}
                    />
                    {!videoError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                            </div>
                        </div>
                    )}
                    {videoError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <span className="text-white/60 text-[10px] font-medium uppercase tracking-widest">Video Unavailable</span>
                        </div>
                    )}
                </div>
            )}

            {/* oEmbed Container */}
            {isMounted && reel.isOEmbed && (
                <div className="absolute inset-0 z-10 w-full h-full overflow-hidden flex items-center justify-center bg-black">
                    {(() => {
                        if (reel.oembedUrl && reel.oembedUrl.includes("instagram.com")) {
                            let url = reel.oembedUrl.split("?")[0];
                            if (!url.endsWith("/")) url += "/";
                            const embedUrl = url + "embed";
                            return (
                                <iframe
                                    src={embedUrl}
                                    className="absolute inset-0 w-full h-full border-0 scale-[1.02]"
                                    style={{ width: "100%", height: "100%" }}
                                    scrolling="no"
                                    allow="encrypted-media"
                                />
                            );
                        }
                        if (reel.oembedUrl && reel.oembedUrl.includes("tiktok.com")) {
                            const match = reel.oembedUrl.match(/video\/(\d+)/);
                            if (match && match[1]) {
                                return (
                                    <iframe
                                        src={`https://www.tiktok.com/embed/v2/${match[1]}`}
                                        className="absolute inset-0 w-full h-full border-0 scale-[1.02]"
                                        scrolling="no"
                                        allow="encrypted-media"
                                    />
                                );
                            }
                        }
                        if (reel.oembedUrl && reel.oembedUrl.includes("youtube.com")) {
                            const match = reel.oembedUrl.match(/[?&]v=([^&]+)/);
                            const videoId = match ? match[1] : reel.oembedUrl.split('youtu.be/')[1]?.split('?')[0];
                            if (videoId) {
                                return (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&modestbranding=1&rel=0&playsinline=1`}
                                        className="absolute inset-0 w-full h-full border-0 scale-[1.5]"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                );
                            }
                        }

                        return (
                            <div
                                className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>blockquote]:m-0 [&>blockquote]:w-full [&>blockquote]:h-full"
                                dangerouslySetInnerHTML={{ __html: reel.oembedHtml || "" }}
                            />
                        );
                    })()}
                </div>
            )}

            {!isMounted && reel.isOEmbed && (
                <div className="absolute inset-0 z-10 w-full h-full bg-slate-900 animate-pulse" />
            )}

            {/* Show skeleton if nothing is loaded yet and no poster */}
            {!showPoster && !isVideoLoaded && !thumbnailUrl && (
                <div className="absolute inset-0 z-10 w-full h-full">
                    <SkeletonReel />
                </div>
            )}

            {/* Video Element – Lazy mounted when near viewport and URL is valid */}
            {hasEnteredViewport && !reel.isOEmbed && videoUrl && !videoError && (
                <video
                    key={videoUrl}
                    ref={videoRef}
                    src={videoUrl}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    style={{ opacity: isVideoLoaded ? 1 : 0 }}
                    muted={isMuted}
                    playsInline
                    preload="auto"
                    onLoadedData={() => setIsVideoLoaded(true)}
                    onEnded={onEnded}
                    onTimeUpdate={handleTimeUpdate}
                    onError={(e) => {
                        console.error("Video failed to load:", videoUrl);
                        setVideoError(true);
                        // Fallback to thumbnail if video fails
                        const videoElement = e.target as HTMLVideoElement;
                        videoElement.style.display = "none";
                        onEnded(); // Move to next video if this one fails
                    }}
                    poster={thumbnailUrl || undefined}
                />
            )}

            {/* Top Bar – Mute Only (Removed Views for less clutter) */}
            {!reel.isOEmbed && (
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={toggleMute}
                        className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 border border-white/20 transition-all hover:scale-110"
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                </div>
            )}

            {/* Play indicator – shown when paused */}
            {!isPlaying && (!showPoster || isVideoLoaded) && !reel.isOEmbed && (
                <div className="absolute inset-0 z-15 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                </div>
            )}

            {/* Bottom Gradient + Info Section */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 pb-20 flex flex-col justify-end">
                <div className="flex items-end gap-3">
                    {/* Thumbnail Card on Left Bottom */}
                    {!reel.isOEmbed && thumbnailUrl && (
                        <div className="flex-shrink-0 w-14 h-20 rounded-xl border border-white/30 shadow-2xl overflow-hidden bg-black/40 backdrop-blur-sm group/thumb relative transition-transform duration-300">
                            <img
                                src={thumbnailUrl}
                                className="w-full h-full object-cover"
                                alt="cover"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1 mb-1 max-w-[160px]">
                        {reel.title && (
                            <h4 className="text-white font-bold text-xs leading-tight line-clamp-2 drop-shadow-md flex items-start gap-2">
                                <span className="flex h-1.5 w-1.5 relative mt-1 flex-shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                                </span>
                                {reel.title}
                            </h4>
                        )}
                        {reel.subtitle && (
                            <p className="text-white/70 text-[9px] leading-snug line-clamp-2 font-medium pl-3.5">
                                {reel.subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Centered Shop Now Button */}
            {reel.redirectLink && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full w-fit border border-red-500 shadow-2xl shadow-red-600/40 transition-all active:scale-95 cursor-pointer group/btn overflow-hidden relative whitespace-nowrap">
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                        <ShoppingBag size={12} className="relative z-10" />
                        <span className="relative z-10 tracking-wider uppercase">Shop Now</span>
                    </div>
                </div>
            )}

            {/* Reel progress bar */}
            {!reel.isOEmbed && isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 z-30 bg-white/10">
                    <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );

    const cardContent = (
        <div className="w-[65vw] sm:w-[45vw] md:w-[280px] flex-shrink-0 snap-center">
            {content}
        </div>
    );

    if (reel.redirectLink) {
        return (
            <Link href={reel.redirectLink} className="block">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
};

/* ─── Main Section ─── */
export default function VideoReelsSection({ heading = "Trending Reels", reels }: VideoReelsSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 20);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollState();
        el.addEventListener("scroll", updateScrollState, { passive: true });
        return () => el.removeEventListener("scroll", updateScrollState);
    }, [updateScrollState]);

    const [activeReelIndex, setActiveReelIndex] = useState(0);

    const isFirstMount = useRef(true);

    // Auto-scroll to active reel when index changes (especially for sequential play)
    useEffect(() => {
        const el = scrollRef.current;
        if (!el || !el.children[activeReelIndex]) return;

        // Skip the scroll on first mount to avoid jumping the whole page to this section
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        // Only scroll the horizontal container, avoiding vertical page jumps
        const target = el.children[activeReelIndex] as HTMLElement;
        el.scrollTo({
            left: target.offsetLeft - (el.clientWidth / 2) + (target.clientWidth / 2),
            behavior: "smooth"
        });
    }, [activeReelIndex]);

    const handleReelEnd = useCallback(() => {
        // 2s delay before playing next video
        setTimeout(() => {
            setActiveReelIndex((prev) => (prev + 1) % reels.length);
        }, 2000);
    }, [reels.length]);

    const handleManualPlay = useCallback((index: number) => {
        setActiveReelIndex(index);
    }, []);

    const scroll = useCallback((dir: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = dir === "left" ? -300 : 300;
        el.scrollBy({ left: amount, behavior: "smooth" });
    }, []);

    if (!reels || reels.length === 0) return null;

    return (
        <section className="relative py-4 md:py-6">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-violet-600" />
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {heading}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {reels.length} videos • Watch & Shop
                        </p>
                    </div>
                </div>

                {/* Scroll Controls - Hidden on Mobile, shown on Desktop if needed */}
                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className={`p-2 rounded-full border transition-all ${canScrollLeft
                            ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                            }`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className={`p-2 rounded-full border transition-all ${canScrollRight
                            ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                            }`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
            <div className="relative group">
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-8 px-6"
                >
                    {(reels || []).map((reel, index) => (
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

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </section>
    );
}
