"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";

interface Banner {
  id: string;
  image: string;
  redirectLink: string;
}

interface ProductSliderProps {
  banners: Banner[];
}

const CarouselSlider: React.FC<ProductSliderProps> = ({ banners }) => {
  const router = useRouter();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-slide (pause when dragging)
  useEffect(() => {
    if (banners.length === 0 || isDragging) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length, isDragging]);

  const nextBanner = () => {
    setBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Touch/Mouse event handlers
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50; // Minimum swipe distance
    const clickThreshold = 5;

    if (Math.abs(translateX) > threshold) {
      if (translateX > 0) {
        prevBanner();
      } else {
        nextBanner();
      }
    } else if (Math.abs(translateX) < clickThreshold) {
      // It's a click!
      const currentBanner = banners[bannerIndex];
      if (currentBanner?.redirectLink && currentBanner.redirectLink !== '#') {
        router.push(currentBanner.redirectLink);
      }
    }
    setTranslateX(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  if (banners.length === 0) return null;

  return (
    <div className="max-w-8xl p-2">
      <div className="bg-white shadow-sm overflow-hidden relative">
        <div className="overflow-hidden">
          <div
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-in-out cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(-${bannerIndex * 100}%) translateX(${isDragging ? translateX : 0}px)`,
              transitionDuration: isDragging ? '0ms' : '500ms'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {banners.map((banner, index) => (
              <div key={banner.id} className="min-w-full relative select-none h-40 sm:h-72 md:h-72">
                <NextImage
                  src={banner.image}
                  alt="banner"
                  fill
                  // className="object-contain pointer-events-none"
                  draggable={false}
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons - Hidden on mobile */}
        <button
          onClick={prevBanner}
          className="hidden md:flex absolute rounded-r-sm left-0 top-1/2 transform -translate-y-1/2 bg-white w-11 h-24 items-center justify-center shadow-lg border border-gray-200 z-10 opacity-80 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <button
          onClick={nextBanner}
          className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 bg-white w-11 h-24 items-center justify-center rounded-l-sm shadow-lg border border-gray-200 z-10 opacity-80 hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setBannerIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === bannerIndex ? "bg-white w-6" : "bg-white/50"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselSlider;