'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';


import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { apiClient } from '@/context/AuthContext';
import { ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, Package, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { OfferSliderSkeleton } from './Skeletons';

export const OfferSlider = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/banners?activeOnly=true&type=MAIN_CAROUSEL');
        setBanners(res.data);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  if (isLoading) {
    return <OfferSliderSkeleton />;
  }

  if (banners.length === 0) return null;

  return (
    <section className="py-6 bg-muted overflow-hidden">
      <div className="container mx-auto px-0 lg:px-4">
        {/* Set a fixed height for the wrapper to ensure both sides are exactly identical in height */}
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[380px] items-stretch">
          
          {/* Left Side: Carousel (approx 80%) */}
          <div className="w-full lg:w-[78%] relative group h-[300px] lg:h-full">
            <div className="overflow-hidden shadow-sm h-full rounded-none" ref={emblaRef}>
              <div className="flex touch-pan-y h-full">
                {banners.map((banner) => (
                  <div key={banner.id} className="min-w-0 flex-[0_0_100%] h-full relative">
                    {banner.targetUrl ? (
                      <Link href={banner.targetUrl} className="block w-full h-full">
                        <OptimizedImage src={banner.imageUrl} 
                          alt={banner.title} 
                          className="w-full h-full object-cover bg-white" />
                      </Link>
                    ) : (
                      <OptimizedImage src={banner.imageUrl} 
                        alt={banner.title} 
                        className="w-full h-full object-cover bg-white" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button 
                  onClick={scrollPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/20 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={scrollNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/20 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollTo(index)}
                      className="p-2"
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      <div className={`h-2.5 rounded-full transition-all ${
                        index === selectedIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white w-2.5'
                      }`} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Side: Business Benefits Sidebar (approx 22%) */}
          <div className="w-full px-4 lg:px-0 lg:w-[22%]">
            <div className="bg-white flex flex-col h-full shadow-sm rounded-lg lg:rounded-none border-l-4 border-primary-600 lg:border-l-0 overflow-hidden">
              
              {/* Top Header */}
              <div className="flex items-center gap-3 p-3 border-b border-border bg-primary-50 shrink-0">
                <div className="bg-primary-600 text-white p-1.5 rounded-md">
                  <ShieldCheck size={20} />
                </div>
                <span className="font-bold text-foreground text-base">Smart24 Business</span>
              </div>

              {/* Gradient Middle Section */}
              <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-blue-900 p-4 lg:py-3 text-white flex-1 flex flex-col justify-start relative overflow-hidden">
                <div className="flex items-center gap-2 text-sm font-semibold mb-1.5 text-primary-100">
                  <Star size={14} className="fill-primary-200 text-primary-200" />
                  Trusted by 500+ Brands
                </div>
                
                <div className="text-center font-bold text-base mb-2.5">
                  Exclusive Benefits
                </div>

                <div className="space-y-2 mb-1 relative z-10">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-2">
                    <div className="bg-white rounded-full p-1.5 text-primary/90 shrink-0">
                      <Truck size={16} />
                    </div>
                    <span className="font-semibold text-sm leading-tight">Free Bulk<br/>Delivery</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-2">
                    <div className="bg-white rounded-full p-1.5 text-info-text shrink-0">
                      <CreditCard size={16} />
                    </div>
                    <span className="font-semibold text-sm leading-tight">Flexible<br/>Payments</span>
                  </div>
                </div>
                
                {/* Subtle background element */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>

              {/* Bottom Section: Contact / Quote */}
              <div className="p-4 bg-muted shrink-0">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row lg:flex-col xl:flex-row gap-2 lg:gap-3">
                    <Link href="/contact" className="flex-1 flex items-center justify-center bg-primary-600 text-white py-3 px-2 lg:py-2 xl:py-3 rounded-lg hover:bg-primary-700 transition-colors text-[13px] sm:text-base lg:text-sm xl:text-base font-semibold shadow-sm text-center leading-tight">
                      Request Quote
                    </Link>
                    <Link href="/shop" className="flex-1 flex items-center justify-center bg-white border border-border text-foreground py-3 px-2 lg:py-2 xl:py-3 rounded-lg hover:bg-muted transition-colors text-[13px] sm:text-base lg:text-sm xl:text-base font-semibold text-center leading-tight">
                      Browse Catalog
                    </Link>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium text-center">
                    Need customized supplies?
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
