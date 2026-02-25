"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ImageMagnifier from "./ImageMagnifier"; // adjust import if local
import type { Product } from "@/types/product";
import { cdn } from "@/lib/imageUrl";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  product: Product | undefined;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [zoomImg, setZoomImg] = useState<boolean>(false);
  const [api, setApi] = useState<CarouselApi>();

  const images = product?.images ?? [];
  const activeImage = images[activeIndex]?.url ?? "";
  // Check for public_id to optimize if possible
  const activePublicId = images[activeIndex]?.public_id;
  const optimizedActiveImage = activePublicId ? cdn(activePublicId, "ecom_detail") : activeImage;
  const zoomActiveImage = activePublicId ? cdn(activePublicId, "ecom_zoom") : activeImage;

  // Sync Carousel with activeIndex (for external control if needed)
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

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleSwipe = (offsetX: number) => {
    if (offsetX < -50) {
      // swipe left → next
      setActiveIndex((prev) => (prev + 1) % images.length);
    } else if (offsetX > 50) {
      // swipe right → prev
      setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row w-full gap-4">
      {/* Desktop Thumbnails - Side Strip */}
      <div className="hidden md:flex flex-col h-[500px] w-24 flex-shrink-0">
        <ScrollArea className="h-full pr-2">
          <div className="flex flex-col gap-3">
            {images.map((image) => (
              <button
                key={image._id || image.public_id || image.url}
                className={cn(
                  "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200",
                  images.indexOf(image) === activeIndex
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-transparent hover:border-gray-300"
                )}
                onMouseEnter={() => setActiveIndex(images.indexOf(image))}
                onClick={() => setActiveIndex(images.indexOf(image))}
              >
                <Image
                  src={image.public_id ? cdn(image.public_id, "ecom_thumb", 150) : image.url}
                  alt={`Product view`}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* Main Image Container */}
      <div className="flex-1 relative bg-white rounded-xl overflow-hidden md:overflow-visible">
        {/* Desktop Magnifier */}
        <div className="hidden md:flex justify-center items-center w-full h-[500px] bg-gray-50/50 rounded-xl border border-gray-100">
          {/* Using ImageMagnifier if it supports fluid width, else adjust */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Assuming ImageMagnifier handles sizing nicely */}
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
        </div>

        {/* Mobile Professional Carousel */}
        <div className="md:hidden w-full">
          <Carousel setApi={setApi} className="w-full relative">
            <CarouselContent>
              {images.map((img) => (
                <CarouselItem key={img._id || img.public_id || img.url}>
                  <div
                    className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden"
                    onClick={() => setZoomImg(true)}
                  >
                    <Image
                      src={img.public_id ? cdn(img.public_id, "ecom_detail") : img.url}
                      alt={`Product view ${images.indexOf(img) + 1}`}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={images.indexOf(img) === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Mobile Dots Indicator - Overlaid at bottom */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((img, index) => (
                <button
                  key={img._id || img.public_id || img.url || index}
                  onClick={(e) => { e.stopPropagation(); api?.scrollTo(index); }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                    activeIndex === index ? "w-6 bg-gray-900" : "w-1.5 bg-gray-300"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </div>

      {/* Zoom Modal with swipe (mobile) */}
      <Dialog open={zoomImg} onOpenChange={setZoomImg}>
        <DialogContent className="max-w-[100vw] h-[100dvh] w-screen flex items-center justify-center p-0 bg-black border-none z-[60]">
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
            {/* Zoom Gallery Indicators */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/10">
                {activeIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
