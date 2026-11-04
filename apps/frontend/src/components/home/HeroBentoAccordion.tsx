"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollFade } from '@/components/ui/ScrollFade';

export interface HeroAd {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  categoryUrl: string;
}

interface HeroBentoAccordionProps {
  ads: HeroAd[];
}

export function HeroBentoAccordion({ ads: initialAds }: HeroBentoAccordionProps) {
  const [ads, setAds] = useState<HeroAd[]>(initialAds || []);
  const [activeId, setActiveId] = useState<string>(initialAds?.[0]?.id || "");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await apiClient.get('/hero-contents?activeOnly=true');
        const dataList = response.data?.data || response.data;
        if (dataList && dataList.length > 0) {
          const fetchedAds = dataList.map((content: any) => ({
            id: content.id,
            title: content.title,
            subtitle: content.subtitle,
            imageUrl: content.imageUrl,
            categoryUrl: content.categoryUrl || "/shop"
          }));
          setAds(fetchedAds);
          setActiveId(fetchedAds[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch banners for hero:", error);
      }
    };
    fetchBanners();
  }, []);

  // Autoplay only when not hovered
  useEffect(() => {
    if (!ads || ads.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveId((currentId) => {
        const currentIndex = ads.findIndex((ad) => ad.id === currentId);
        const nextIndex = (currentIndex + 1) % ads.length;
        return ads[nextIndex].id;
      });
    }, 5500);
    return () => clearInterval(interval);
  }, [ads, isHovered]);

  const activeAd = ads.find((a) => a.id === activeId) || ads[0];

  const handleCardMouseEnter = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    // Micro-delay ensures fast gliding across cards doesn't trigger intermediate state jitter
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveId(id);
    }, 40);
  };

  if (!ads || ads.length === 0) return null;

  return (
    <section
      className="relative w-full min-h-[580px] md:h-[680px] bg-neutral-950 overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      }}
    >
      {/* GPU-Cached Aurora Blurred Backdrop: Crossfades opacity without re-rasterizing blur */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {ads.map((ad) => (
          <div
            key={`backdrop-${ad.id}`}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out will-change-opacity ${
              activeAd?.id === ad.id ? "opacity-35" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${ad.imageUrl})`,
              filter: "blur(48px)",
              transform: "scale(1.15) translate3d(0, 0, 0)",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      <div className="relative container mx-auto px-4 h-full z-10 flex flex-col justify-center">
        {/* Desktop/Tablet Layout: 60fps Decelerated Flex Accordion */}
        <div className="hidden md:flex h-[560px] w-full gap-3 lg:gap-4 py-6">
          {ads.map((ad) => {
            const isActive = activeId === ad.id;
            return (
              <div
                key={ad.id}
                onMouseEnter={() => handleCardMouseEnter(ad.id)}
                onClick={() => setActiveId(ad.id)}
                className={`relative overflow-hidden cursor-pointer rounded-2xl lg:rounded-3xl border border-white/10 shadow-2xl transition-[flex] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[flex] ${
                  isActive ? "flex-[3.5]" : "flex-[0.9] hover:flex-[1.1]"
                }`}
                style={{
                  transform: "translate3d(0, 0, 0)",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Background Image with Smooth Scale Zoom */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                  style={{
                    backgroundImage: `url(${ad.imageUrl})`,
                    transform: isActive
                      ? "scale(1.05) translate3d(0, 0, 0)"
                      : "scale(1.0) translate3d(0, 0, 0)",
                  }}
                />

                {/* Dark Vignette / Gradient Overlay */}
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    isActive
                      ? "bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                      : "bg-black/55 hover:bg-black/45"
                  }`}
                />

                {/* Collapsed State: Rotated Vertical Title */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${
                    isActive
                      ? "opacity-0 scale-90"
                      : "opacity-100 scale-100 delay-100"
                  }`}
                >
                  <h3 className="text-lg lg:text-xl font-bold text-white/95 whitespace-nowrap -rotate-90 tracking-widest uppercase drop-shadow-md">
                    {ad.title}
                  </h3>
                </div>

                {/* Expanded Active Content: Silky Entrance with Zero Layout Thrash */}
                <div
                  className={`absolute inset-0 p-6 lg:p-10 flex flex-col justify-end transition-all duration-500 ease-out ${
                    isActive
                      ? "opacity-100 translate-y-0 delay-100"
                      : "opacity-0 translate-y-6 pointer-events-none"
                  }`}
                >
                  <div className="max-w-xl">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary-500/90 text-white text-xs font-semibold tracking-wider uppercase mb-3 backdrop-blur-md shadow-sm">
                      Featured
                    </span>
                    <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 leading-tight drop-shadow-md">
                      {ad.title}
                    </h2>
                    <p className="text-sm lg:text-base text-gray-200 mb-6 drop-shadow-sm line-clamp-2 max-w-lg">
                      {ad.subtitle}
                    </p>
                    <Link
                      href={ad.categoryUrl}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm lg:text-base font-semibold text-gray-900 bg-white hover:bg-primary-500 hover:text-white transition-all duration-300 shadow-xl group hover:scale-105 active:scale-95"
                    >
                      Shop Collection
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Layout: Touch-optimized Main Hero + Swipeable Thumbnails */}
        <div className="flex md:hidden flex-col w-full gap-4 pt-[70px] pb-10 relative">
          {/* Main Active Card */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-white/10">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out"
              style={{ backgroundImage: `url(${activeAd.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary-500 text-white text-[10px] font-semibold tracking-wider uppercase mb-2 w-fit">
                Featured
              </span>
              <h2 className="text-2xl font-bold text-white mb-1.5">{activeAd.title}</h2>
              <p className="text-xs text-gray-200 mb-3.5 line-clamp-2">{activeAd.subtitle}</p>
              <Link
                href={activeAd.categoryUrl}
                className="inline-flex items-center text-xs font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full w-fit transition-colors"
              >
                Shop Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Thumbnails Row */}
          {ads.length > 1 && (
            <ScrollFade className="flex w-full overflow-x-auto snap-x snap-mandatory gap-3 scrollbar-hide py-1">
              {ads.map((ad) => {
                const isCurrent = ad.id === activeAd.id;
                return (
                  <button
                    key={`thumb-${ad.id}`}
                    onClick={() => setActiveId(ad.id)}
                    className={`relative flex-none w-[38%] aspect-[4/3] snap-center rounded-xl overflow-hidden shadow-md text-left transition-all duration-300 border ${
                      isCurrent
                        ? "border-primary-500 ring-2 ring-primary-500/50 scale-[1.02]"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${ad.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 p-2.5 flex flex-col justify-end">
                      <h3 className="text-xs font-bold text-white line-clamp-1">{ad.title}</h3>
                    </div>
                  </button>
                );
              })}
            </ScrollFade>
          )}
        </div>
      </div>
    </section>
  );
}
