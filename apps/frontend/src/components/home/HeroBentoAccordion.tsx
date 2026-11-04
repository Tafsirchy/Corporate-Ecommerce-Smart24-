"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    const interval = setInterval(() => {
      setActiveId((currentId) => {
        const currentIndex = ads.findIndex((ad) => ad.id === currentId);
        const nextIndex = (currentIndex + 1) % ads.length;
        return ads[nextIndex].id;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [ads]);

  const activeAd = ads.find((a) => a.id === activeId) || ads[0];

  if (!ads || ads.length === 0) return null;

  return (
    <section className="relative w-full min-h-[600px] md:h-[700px] bg-black overflow-hidden">
      {/* Dynamic Aurora Blurred Background */}
      <AnimatePresence>
        <motion.div
          key={activeAd.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center scale-125 blur-[100px] opacity-50"
            style={{ backgroundImage: `url(${activeAd.imageUrl})` }}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/40 z-0" /> {/* Ensures navbar text is readable */}

      <div className="relative container mx-auto px-4 h-full z-10">
        {/* Desktop/Tablet Layout: Horizontal Accordion */}
        <div className="hidden md:flex h-full w-full gap-4 pt-[60px] pb-8">
          {ads.map((ad) => {
            const isActive = activeId === ad.id;
            return (
              <motion.div
                key={ad.id}
                layout
                onHoverStart={() => setActiveId(ad.id)}
                className="relative overflow-hidden cursor-pointer rounded-3xl"
                animate={{
                  flex: isActive ? 3 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 30,
                }}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out"
                  style={{
                    backgroundImage: `url(${ad.imageUrl})`,
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                  }}
                />

                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${isActive
                      ? "bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                      : "bg-black/50"
                    }`}
                />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <AnimatePresence mode="popLayout">
                    {isActive ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="max-w-xl"
                      >
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight">
                          {ad.title}
                        </h2>
                        <p className="text-lg text-gray-200 mb-6">
                          {ad.subtitle}
                        </p>
                        <Link
                          href={ad.categoryUrl}
                          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-foreground bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-lg"
                        >
                          Shop Now
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <h3 className="text-xl lg:text-2xl font-bold text-white whitespace-nowrap -rotate-90 tracking-wider drop-shadow-md">
                          {ad.title}
                        </h3>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Layout: Auto-animating Hero + Thumbnail Row */}
        <div className="flex md:hidden flex-col w-full gap-4 pt-[60px] pb-12 relative">
          {/* Main Hero Ad (Active Item) */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
              style={{ backgroundImage: `url(${activeAd.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeAd.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full"
                >
                  <h2 className="text-2xl font-bold text-white mb-2">{activeAd.title}</h2>
                  <p className="text-sm text-gray-200 mb-4 line-clamp-2">{activeAd.subtitle}</p>
                  <Link
                    href={activeAd.categoryUrl}
                    className="inline-flex items-center text-sm font-medium text-white hover:text-primary-200 transition-colors py-2"
                  >
                    Explore <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Remaining Ads in a Horizontal Row */}
          {ads.length > 1 && (
            <ScrollFade className="flex w-full overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide pb-2">
              {ads.filter(a => a.id !== activeAd.id).map((ad) => (
                <button
                  key={ad.id}
                  onClick={() => setActiveId(ad.id)}
                  className="relative flex-none w-[45%] aspect-square snap-center rounded-2xl overflow-hidden shadow-md group block text-left"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${ad.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{ad.title}</h3>
                    <div className="inline-flex items-center text-xs font-medium text-white/90 group-hover:text-white">
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </button>
              ))}
            </ScrollFade>
          )}
        </div>
      </div>
    </section>
  );
}
