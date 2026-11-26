"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ImageMagnifier from "./ImageMagnifier";
import type { Product } from "@/types/product";
import { cdn } from "@/lib/imageUrl";
import {
  Play,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface GalleryItem {
  _id?: string;
  public_id?: string;
  url: string;
  type: "image" | "video";
}

interface ProductGalleryProps {
  product: Product | undefined;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"videos" | "images">("videos");
  const [modalVideoUrl, setModalVideoUrl] = useState<string>("");
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<string>("1:00");
  const [api, setApi] = useState<CarouselApi>();
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // Build unified gallery: images first, then videos
  const rawImages = (product?.images ?? []) as Array<{ _id?: string; public_id?: string; url: string }>;
  const rawVideos = ((product as any)?.videos ?? []) as Array<{ _id?: string; public_id?: string; url: string }>;

  const galleryItems: GalleryItem[] = [
    ...rawImages.map(img => ({ ...img, type: "image" as const })),
    ...rawVideos.map(vid => ({ ...vid, type: "video" as const })),
  ];

  const activeItem = galleryItems[activeIndex];
  const isActiveVideo = activeItem?.type === "video";

  const activeImage = activeItem?.url ?? "";
  const activePublicId = activeItem?.public_id;
  const optimizedActiveImage = !isActiveVideo && activePublicId ? cdn(activePublicId, "ecom_detail") : activeImage;
  const zoomActiveImage = !isActiveVideo && activePublicId ? cdn(activePublicId, "ecom_zoom") : activeImage;

  const brandName = typeof product?.brand === "object" ? product?.brand?.name : (product?.brand || "");

  const openMediaModal = (tab: "videos" | "images", videoUrl?: string, imageIdx?: number) => {
    setActiveMediaTab(tab);
    if (tab === "videos") {
      setModalVideoUrl(videoUrl || rawVideos[0]?.url || "");
    } else {
      if (typeof imageIdx === "number") {
        setModalImageIndex(imageIdx);
      } else {
        const found = rawImages.findIndex(img => img.url === activeItem?.url);
        setModalImageIndex(found >= 0 ? found : 0);
      }
    }
    setIsMediaModalOpen(true);
  };

  const handleShare = async () => {
    try {
      if (typeof window === "undefined") return;
      const url = window.location.href;

      // 1. Try modern navigator.clipboard
      if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied to clipboard");
        return;
      }

      // 2. Robust fallback for HTTP/non-secure contexts & mobile
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        toast.success("Product link copied to clipboard");
      } else {
        toast.error("Failed to copy link");
      }
    } catch (err) {
      console.error("Clipboard copy error:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const duration = e.currentTarget.duration;
    if (duration && !isNaN(duration) && isFinite(duration)) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      setVideoDuration(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
    }
  };

  const prevImage = () => {
    if (rawImages.length === 0) return;
    setModalImageIndex(prev => (prev > 0 ? prev - 1 : rawImages.length - 1));
  };

  const nextImage = () => {
    if (rawImages.length === 0) return;
    setModalImageIndex(prev => (prev < rawImages.length - 1 ? prev + 1 : 0));
  };

  // Sync Carousel with activeIndex
  useEffect(() => {
    if (!api) return;
    api.scrollTo(activeIndex);
  }, [activeIndex, api]);

  // Update activeIndex when Carousel slides
  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

  // Pause inline video when switching away
  useEffect(() => {
    if (!isActiveVideo) {
      videoRef.current?.pause();
      mobileVideoRef.current?.pause();
    }
  }, [activeIndex, isActiveVideo]);

  // Pause modal video when modal closes or switches to images
  useEffect(() => {
    if (!isMediaModalOpen && modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
  }, [isMediaModalOpen]);

  return (
    <div className="flex flex-col-reverse md:flex-row w-full gap-4">
      {/* Desktop Thumbnails - Side Strip */}
      <div className="hidden md:flex flex-col h-[500px] w-24 flex-shrink-0">
        <ScrollArea className="h-full pr-2">
          <div className="flex flex-col gap-3">
            {galleryItems.map((item, idx) => (
              <button
                key={item._id || item.public_id || item.url || idx}
                className={cn(
                  "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200",
                  idx === activeIndex
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-transparent hover:border-gray-300"
                )}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  setActiveIndex(idx);
                  if (item.type === "video") {
                    openMediaModal("videos", item.url);
                  }
                }}
              >
                {item.type === "image" ? (
                  <Image
                    src={item.public_id ? cdn(item.public_id, "ecom_thumb", 150) : item.url}
                    alt="Product view"
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative group/vid">
                    <video
                      src={item.url}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/vid:opacity-85 transition-opacity"
                      muted
                      preload="metadata"
                    />
                    <div className="relative z-10 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md group-hover/vid:scale-110 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                    <span className="relative z-10 mt-1 text-[8px] font-black uppercase text-white bg-black/75 px-1 py-0.5 rounded tracking-wider">
                      VIDEO
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 relative bg-white rounded-xl overflow-hidden md:overflow-visible">
        {/* Desktop Main View */}
        <div className="hidden md:flex justify-center items-center w-full h-[500px] bg-gray-50/50 rounded-xl border border-gray-100 relative">
          {isActiveVideo ? (
            /* Video Player with Click to Play in Popup */
            <div
              className="relative w-full h-full flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden group cursor-pointer"
              onClick={() => openMediaModal("videos", activeItem.url)}
            >
              <video
                ref={videoRef}
                key={activeItem.url}
                src={activeItem.url}
                className="w-full h-full object-contain opacity-85 group-hover:opacity-100 transition-opacity"
                muted={isMuted}
                playsInline
                preload="metadata"
                autoPlay
              />

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/25 group-hover:bg-black/40 transition-colors pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-115 ring-4 ring-white/30">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
                <span className="mt-3 text-xs font-bold text-white bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
                  Click to Play Video
                </span>
              </div>

              <div className="absolute top-4 left-4 px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider z-20 shadow-md flex items-center gap-1">
                <Play className="w-2.5 h-2.5 fill-white" /> Video
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                  if (videoRef.current) videoRef.current.muted = !isMuted;
                }}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-20"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          ) : (
            /* Image Magnifier */
            <div
              className="relative w-full h-full flex items-center justify-center p-4 cursor-pointer"
              onClick={() => openMediaModal("images", undefined, activeIndex)}
            >
              <ImageMagnifier
                smallImage={{
                  alt: product?.name || "Product Image",
                  isFluidWidth: true,
                  src: optimizedActiveImage,
                }}
                largeImage={{
                  src: zoomActiveImage,
                  width: 1800,
                  height: 1800,
                }}
                enlargedImageContainerDimensions={{
                  width: 600,
                  height: 500,
                }}
                enlargedImageContainerStyle={{
                  left: "calc(100% + 20px)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1000,
                  backgroundColor: "white",
                }}
                shouldUsePositiveSpaceLens={true}
              />
            </div>
          )}

          {/* Floating "Watch Video" pill when viewing images and video exists */}
          {!isActiveVideo && rawVideos.length > 0 && (
            <button
              type="button"
              onClick={() => openMediaModal("videos", rawVideos[0].url)}
              className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-950/90 hover:bg-red-600 text-white text-xs font-bold shadow-xl backdrop-blur-md transition-all hover:scale-105 border border-white/20 group"
            >
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white transition-colors">
                <Play className="w-2.5 h-2.5 fill-white text-white group-hover:text-red-600 group-hover:fill-red-600 ml-0.5" />
              </div>
              <span>Watch Video</span>
            </button>
          )}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden w-full relative">
          <Carousel setApi={setApi} className="w-full relative">
            <CarouselContent>
              {galleryItems.map((item, idx) => (
                <CarouselItem key={item._id || item.public_id || item.url || idx}>
                  {item.type === "image" ? (
                    <div
                      className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => openMediaModal("images", undefined, idx)}
                    >
                      <Image
                        src={item.public_id ? cdn(item.public_id, "ecom_detail") : item.url}
                        alt={`Product view ${idx + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={idx === 0}
                      />
                    </div>
                  ) : (
                    <div
                      className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => openMediaModal("videos", item.url)}
                    >
                      <video
                        ref={idx === activeIndex ? mobileVideoRef : undefined}
                        src={item.url}
                        className="w-full h-full object-contain opacity-80 pointer-events-none"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      {/* Mobile Big Play Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/30 pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl ring-4 ring-white/30">
                          <Play className="w-6 h-6 fill-white ml-1" />
                        </div>
                        <span className="mt-2 text-[11px] font-bold text-white bg-black/75 px-3 py-1 rounded-full border border-white/20 shadow">
                          Tap to Play Video
                        </span>
                      </div>
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider z-20 shadow">
                        Video
                      </div>
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Mobile Dots Indicator */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {galleryItems.map((item, index) => (
                <button
                  key={item._id || item.public_id || item.url || index}
                  onClick={(e) => { e.stopPropagation(); api?.scrollTo(index); }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                    activeIndex === index ? "w-6 bg-gray-900" : "w-1.5 bg-gray-300",
                    item.type === "video" && activeIndex === index ? "bg-red-500" : ""
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>

          {/* Mobile floating "Watch Video" pill */}
          {!isActiveVideo && rawVideos.length > 0 && (
            <button
              type="button"
              onClick={() => openMediaModal("videos", rawVideos[0].url)}
              className="absolute bottom-10 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-sm border border-white/20"
            >
              <Play className="w-3 h-3 fill-red-500 text-red-500" />
              <span>Watch Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Unified Media Modal Popup (VIDEOS & IMAGES) */}
      <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[98vw] max-sm:w-full max-sm:h-[100dvh] max-sm:max-h-none max-sm:rounded-none max-sm:border-none sm:max-w-[94vw] md:max-w-[1240px] lg:max-w-[1340px] xl:max-w-[1420px] h-[90vh] max-h-[880px] p-0 bg-white text-gray-900 border border-gray-200 rounded-xl overflow-hidden shadow-2xl z-[70] flex flex-col"
        >
          <DialogTitle className="sr-only">Product Media Viewer</DialogTitle>

          {/* Top Header Bar with Tabs and Close Button */}
          <div className="flex items-center justify-between px-4 sm:px-8 pt-4 pb-0 border-b border-gray-200 bg-white shrink-0">
            <div className="flex items-center gap-6 sm:gap-8 -mb-[1px]">
              {rawVideos.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMediaTab("videos");
                    if (!modalVideoUrl && rawVideos[0]) {
                      setModalVideoUrl(rawVideos[0].url);
                    }
                  }}
                  className={cn(
                    "pb-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase transition-colors relative",
                    activeMediaTab === "videos"
                      ? "text-[#007185] border-b-2 border-[#007185]"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  VIDEOS
                </button>
              )}
              {rawImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMediaTab("images");
                    modalVideoRef.current?.pause();
                  }}
                  className={cn(
                    "pb-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase transition-colors relative",
                    activeMediaTab === "images"
                      ? "text-[#007185] border-b-2 border-[#007185]"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  IMAGES
                </button>
              )}
            </div>

            {/* Close Button on Top Right */}
            <button
              type="button"
              onClick={() => setIsMediaModalOpen(false)}
              className="p-1 -mr-2 text-gray-500 hover:text-black transition-colors rounded-full pb-3.5"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Content Area: 2 Columns */}
          <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden p-3.5 sm:p-6 md:p-7 gap-4 md:gap-8 bg-white">
            {/* Left Column (~70% width) */}
            <div className="w-full md:w-[70%] flex flex-col shrink-0 md:shrink md:h-full md:min-h-0">
              {activeMediaTab === "videos" ? (
                <>
                  {/* Responsive Video Container */}
                  <div className="relative w-full aspect-video md:aspect-auto md:flex-1 md:min-h-[460px] lg:min-h-[520px] bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-inner group shrink-0">
                    {modalVideoUrl && (
                      <video
                        ref={modalVideoRef}
                        key={modalVideoUrl}
                        src={modalVideoUrl}
                        controls
                        autoPlay
                        playsInline
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        className="w-full h-full object-contain"
                      />
                    )}
                    {/* Share Button Overlay */}
                    <button
                      type="button"
                      onClick={handleShare}
                      className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-white rounded transition-colors"
                      title="Share link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Video Title and Subtitle */}
                  <div className="mt-3 shrink-0">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-snug">
                      {product?.name || "Product Video"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {brandName ? `${brandName} Videos` : "Official Videos"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Image Viewer Container */}
                  <div className="relative w-full aspect-video md:aspect-auto md:flex-1 md:min-h-[460px] lg:min-h-[520px] bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center shadow-inner group shrink-0">
                    {rawImages[modalImageIndex] && (
                      <img
                        src={rawImages[modalImageIndex].url}
                        alt={product?.name || "Product Image"}
                        className="w-full h-full object-contain p-4 sm:p-6"
                      />
                    )}

                    {/* Prev/Next arrows */}
                    {rawImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={prevImage}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-md transition-all hover:scale-105 border border-gray-200"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={nextImage}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-white/95 hover:bg-white text-gray-800 shadow-md transition-all hover:scale-105 border border-gray-200"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Image Title and Counter */}
                  <div className="mt-3 shrink-0 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-snug">
                        {product?.name || "Product Image"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Image {modalImageIndex + 1} of {rawImages.length}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column (~30% width) */}
            <div className="w-full md:w-[30%] flex flex-col shrink-0 md:shrink md:h-full md:min-h-0 pb-6 md:pb-0">
              {/* Header Pill */}
              <div className="bg-gray-100 text-gray-800 text-xs font-semibold px-3.5 py-2.5 rounded-md mb-3 shrink-0">
                {activeMediaTab === "videos" ? "Videos for this product" : "Images for this product"}
              </div>

              {activeMediaTab === "videos" ? (
                <div className="space-y-3 md:overflow-y-auto md:flex-1 pr-1.5">
                  {rawVideos.map((vid, idx) => {
                    const isSelected = vid.url === modalVideoUrl;
                    return (
                      <div
                        key={vid.url || idx}
                        onClick={() => setModalVideoUrl(vid.url)}
                        className={cn(
                          "flex items-start gap-3 p-1.5 rounded-lg cursor-pointer transition-all",
                          isSelected ? "bg-amber-50/70" : "hover:bg-gray-50"
                        )}
                      >
                        {/* Thumbnail with Orange Border if Active */}
                        <div
                          className={cn(
                            "relative w-28 sm:w-36 md:w-40 aspect-video rounded-md overflow-hidden shrink-0 bg-slate-950",
                            isSelected
                              ? "ring-2 ring-[#e77600] border-2 border-[#e77600]"
                              : "border border-gray-200 opacity-90 hover:opacity-100"
                          )}
                        >
                          <video
                            src={vid.url}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/70 text-white flex items-center justify-center">
                              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[9px] font-semibold rounded leading-none">
                            {videoDuration || "Video"}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                            {product?.name || "Product Video"}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1 truncate">
                            {brandName ? `${brandName} Videos` : "Official Videos"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-3 gap-2 sm:gap-2.5 md:overflow-y-auto md:flex-1 pr-1.5 content-start">
                  {rawImages.map((img, idx) => {
                    const isSelected = idx === modalImageIndex;
                    return (
                      <button
                        key={img.url || idx}
                        type="button"
                        onClick={() => setModalImageIndex(idx)}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden p-1 transition-all bg-white flex items-center justify-center",
                          isSelected
                            ? "ring-2 ring-[#e77600] border-2 border-[#e77600]"
                            : "border border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100"
                        )}
                      >
                        <img
                          src={img.url}
                          alt={`Product thumbnail ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
