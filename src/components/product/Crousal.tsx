"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ImageMagnifier from "./ImageMagnifier";
import type { Product } from "@/types/product";
import { cdn } from "@/lib/imageUrl";
import { Play, Volume2, VolumeX } from "lucide-react";
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
  const [zoomImg, setZoomImg] = useState<boolean>(false);
  const [api, setApi] = useState<CarouselApi>();
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

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

  // Pause video when switching away
  useEffect(() => {
    if (!isActiveVideo) {
      videoRef.current?.pause();
      mobileVideoRef.current?.pause();
    }
  }, [activeIndex, isActiveVideo]);

  return (
    <div className="flex flex-col-reverse md:flex-row w-full gap-4">
      {/* Desktop Thumbnails - Side Strip */}
      <div className="hidden md:flex flex-col h-[500px] w-24 flex-shrink-0">
        <ScrollArea className="h-full pr-2">
          <div className="flex flex-col gap-3">
            {galleryItems.map((item, idx) => (
              <button
                key={item._id || item.public_id || item.url}
                className={cn(
                  "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200",
                  idx === activeIndex
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-transparent hover:border-gray-300"
                )}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => setActiveIndex(idx)}
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
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                    <video
                      src={item.url}
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                      muted
                      preload="metadata"
                    />
                    <div className="relative z-10 w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </div>
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
        <div className="hidden md:flex justify-center items-center w-full h-[500px] bg-gray-50/50 rounded-xl border border-gray-100">
          {isActiveVideo ? (
            /* Video Player */
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                key={activeItem.url}
                src={activeItem.url}
                className="w-full h-full object-contain"
                controls
                muted={isMuted}
                playsInline
                preload="metadata"
                autoPlay
              />
              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (videoRef.current) videoRef.current.muted = !isMuted;
                }}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="absolute top-4 left-4 px-2.5 py-1 bg-red-500/90 text-white text-[10px] font-bold rounded-full uppercase tracking-wider z-10">
                Video
              </div>
            </div>
          ) : (
            /* Image Magnifier */
            <div className="relative w-full h-full flex items-center justify-center p-4">
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
        </div>

        {/* Mobile Professional Carousel */}
        <div className="md:hidden w-full">
          <Carousel setApi={setApi} className="w-full relative">
            <CarouselContent>
              {galleryItems.map((item, idx) => (
                <CarouselItem key={item._id || item.public_id || item.url}>
                  {item.type === "image" ? (
                    <div
                      className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden"
                      onClick={() => setZoomImg(true)}
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
                    <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                      <video
                        ref={idx === activeIndex ? mobileVideoRef : undefined}
                        src={item.url}
                        className="w-full h-full object-contain"
                        controls
                        muted={isMuted}
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500/90 text-white text-[10px] font-bold rounded-full uppercase tracking-wider z-10">
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
        </div>
      </div>

      {/* Zoom Modal (images only) */}
      <Dialog open={zoomImg && !isActiveVideo} onOpenChange={setZoomImg}>
        <DialogContent className="max-w-[100vw] h-[100dvh] w-screen flex items-center justify-center p-0 bg-black border-none z-[60]">
          <DialogTitle className="sr-only">Zoomed Product Image</DialogTitle>
          <button
            onClick={() => setZoomImg(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-white/10 text-white rounded-full backdrop-blur-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              key={zoomActiveImage}
              src={zoomActiveImage}
              alt="Zoomed product view"
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/10">
                {activeIndex + 1} / {galleryItems.length}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
