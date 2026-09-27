"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";

interface Banner {
  id?: string;
  _id?: string;
  image: string;
  redirectLink: string;
}

interface ProductSliderProps {
  banners: Banner[];
}

const CarouselSlider: React.FC<ProductSliderProps> = ({ banners = [] }) => {
  const router = useRouter();
  const [cardWidthPercent, setCardWidthPercent] = useState(42);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Number of clones on each side for smooth circular looping
  const CLONE_COUNT = Math.max(3, banners.length);
  const [currentIndex, setCurrentIndex] = useState(CLONE_COUNT);
  const [withTransition, setWithTransition] = useState(true);

  // Responsive card width percentage (Flipkart exact: 42% on desktop, 58% on tablet, 88% on mobile)
  useEffect(() => {
    const updateCardWidth = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCardWidthPercent(88); // Mobile: 88% width
      } else if (width < 1024) {
        setCardWidthPercent(58); // Tablet: 58% width
      } else {
        setCardWidthPercent(42); // Desktop: 42% width (2 full + 1 peek)
      }
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  const gapPx = 12; // Gap between cards in px

  // Build extended circular list with clones before and after
  const extendedBanners = React.useMemo(() => {
    if (!banners || banners.length === 0) return [];
    if (banners.length === 1) return banners;

    // Create clones for infinite circular flow
    const beforeClones: Banner[] = [];
    const afterClones: Banner[] = [];

    for (let i = 0; i < CLONE_COUNT; i++) {
      beforeClones.unshift(banners[(banners.length - 1 - (i % banners.length))]);
      afterClones.push(banners[i % banners.length]);
    }

    return [...beforeClones, ...banners, ...afterClones];
  }, [banners, CLONE_COUNT]);

  const nextBanner = useCallback(() => {
    if (banners.length <= 1) return;
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  }, [banners.length]);

  const prevBanner = useCallback(() => {
    if (banners.length <= 1) return;
    setWithTransition(true);
    setCurrentIndex((prev) => prev - 1);
  }, [banners.length]);

  // Handle circular jump when reaching clone boundaries
  const handleTransitionEnd = () => {
    if (banners.length <= 1) return;

    if (currentIndex >= CLONE_COUNT + banners.length) {
      // Reached the cloned end -> jump to real start without transition
      setWithTransition(false);
      setCurrentIndex(currentIndex - banners.length);
    } else if (currentIndex < CLONE_COUNT) {
      // Reached the cloned start -> jump to real end without transition
      setWithTransition(false);
      setCurrentIndex(currentIndex + banners.length);
    }
  };

  // Re-enable transition after teleporting
  useEffect(() => {
    if (!withTransition) {
      const timer = setTimeout(() => {
        setWithTransition(true);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [withTransition]);

  // Auto-slide (pauses on hover and when dragging)
  useEffect(() => {
    if (banners.length <= 1 || isHovered || isDragging) return;
    const interval = setInterval(() => {
      nextBanner();
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length, isHovered, isDragging, nextBanner]);

  // Touch & Mouse Drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const delta = clientX - startX;
    setDragOffset(delta);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 40; // Minimum swipe distance
    if (dragOffset < -threshold) {
      nextBanner();
    } else if (dragOffset > threshold) {
      prevBanner();
    }
    setDragOffset(0);
  };

  const handleCardClick = (redirectLink: string) => {
    if (Math.abs(dragOffset) > 5) return; // Ignore click if user was dragging
    if (redirectLink && redirectLink !== "#") {
      router.push(redirectLink);
    }
  };

  const goToDot = (index: number) => {
    setWithTransition(true);
    setCurrentIndex(CLONE_COUNT + index);
  };

  if (!banners || banners.length === 0) return null;

  // Compute active original banner index for dots
  const activeDotIndex =
    banners.length > 0
      ? ((currentIndex - CLONE_COUNT) % banners.length + banners.length) % banners.length
      : 0;

  return (
    <div
      className="w-full mx-auto relative select-none overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isDragging) handleDragEnd();
      }}
    >
      {/* Slider Viewport */}
      <div className="relative overflow-hidden group">
        <div
          className="flex will-change-transform"
          style={{
            transform: `translateX(calc(-${currentIndex} * (${cardWidthPercent}% + ${gapPx}px) + ${dragOffset}px))`,
            transition: isDragging || !withTransition ? "none" : "transform 500ms ease-out",
            gap: `${gapPx}px`,
          }}
          onTransitionEnd={handleTransitionEnd}
          onMouseDown={(e) => {
            e.preventDefault();
            handleDragStart(e.clientX);
          }}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          {extendedBanners.map((banner, index) => (
            <div
              key={`${banner.id || banner._id || "b"}-${index}`}
              onClick={() => handleCardClick(banner.redirectLink)}
              style={{
                flex: `0 0 ${cardWidthPercent}%`,
              }}
              className="cursor-pointer relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              {/* Aspect Ratio Container (Flipkart 2.2:1 ratio, clean without hover zoom) */}
              <div className="relative w-full aspect-[2.2/1] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <NextImage
                  src={banner.image}
                  alt={`Banner`}
                  fill
                  draggable={false}
                  priority={index >= CLONE_COUNT && index < CLONE_COUNT + 3}
                  className="object-cover"
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 45vw"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Floating Buttons (Desktop Only, Removed on Mobile) */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevBanner();
              }}
              aria-label="Previous Slide"
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 shadow-md hover:shadow-lg items-center justify-center border border-slate-200/80 dark:border-slate-700 z-10 transition-colors backdrop-blur-sm cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextBanner();
              }}
              aria-label="Next Slide"
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 shadow-md hover:shadow-lg items-center justify-center border border-slate-200/80 dark:border-slate-700 z-10 transition-colors backdrop-blur-sm cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Mobile Indicator Dots (Overlay on Image) */}
        {banners.length > 1 && (
          <div className="flex sm:hidden absolute bottom-2 left-1/2 -translate-x-1/2 items-center justify-center gap-1 z-20 pointer-events-none">
            {banners.map((_, idx) => {
              const isActive = activeDotIndex === idx;
              return (
                <span
                  key={idx}
                  className={`transition-all duration-300 rounded-full ${
                    isActive
                      ? "w-4 h-1 bg-white shadow-xs"
                      : "w-1 h-1 bg-white/60"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Indicator Dots (Below Carousel) */}
      {banners.length > 1 && (
        <div className="hidden sm:flex items-center justify-center gap-1.5 mt-2.5">
          {banners.map((_, idx) => {
            const isActive = activeDotIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => goToDot(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-5 h-1.5 bg-slate-700 dark:bg-slate-200"
                    : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CarouselSlider;