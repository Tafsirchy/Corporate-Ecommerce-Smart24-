'use client';

import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { apiClient } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, Package, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const OfferSlider = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await apiClient.get('/banners?activeOnly=true');
        setBanners(res.data);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
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

  if (banners.length === 0) return null;

  return (
    <section className="py-6 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Set a fixed height for the wrapper to ensure both sides are exactly identical in height */}
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[350px] items-stretch">
          
          {/* Left Side: Carousel (approx 80%) */}
          <div className="w-full lg:w-[78%] relative group h-[300px] lg:h-full">
            <div className="overflow-hidden shadow-sm h-full rounded-none" ref={emblaRef}>
              <div className="flex touch-pan-y h-full">
                {banners.map((banner) => (
                  <div key={banner.id} className="min-w-0 flex-[0_0_100%] h-full relative">
                    {banner.targetUrl ? (
                      <Link href={banner.targetUrl} className="block w-full h-full">
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title} 
                          className="w-full h-full object-cover bg-white" 
                        />
                      </Link>
                    ) : (
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.title} 
                        className="w-full h-full object-cover bg-white" 
                      />
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={scrollNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollTo(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        index === selectedIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Side: Corporate Benefits Sidebar (approx 22%) */}
          <div className="w-full lg:w-[22%] bg-white flex flex-col h-full shadow-sm rounded-none border-l-4 border-primary-600 lg:border-l-0 overflow-hidden">
            
            {/* Top Header */}
            <div className="flex items-center gap-3 p-3 border-b border-gray-100 bg-primary-50 shrink-0">
              <div className="bg-primary-600 text-white p-1 rounded-md">
                <ShieldCheck size={18} />
              </div>
              <span className="font-bold text-gray-800 text-[14px]">Smart24 Corporate</span>
            </div>

            {/* Gradient Middle Section */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-blue-900 p-4 py-3 text-white flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="flex items-center gap-1 text-xs font-semibold mb-2 text-primary-100">
                <Star size={12} className="fill-primary-200 text-primary-200" />
                Trusted by 500+ Brands
              </div>
              
              <div className="text-center font-bold text-[15px] mb-3">
                Exclusive Benefits
              </div>

              <div className="space-y-2 mb-2 relative z-10">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-2">
                  <div className="bg-white rounded-full p-1.5 text-primary-600">
                    <Truck size={14} />
                  </div>
                  <span className="font-semibold text-xs leading-tight">Free Bulk<br/>Delivery</span>
                </div>
                
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-2">
                  <div className="bg-white rounded-full p-1.5 text-blue-600">
                    <CreditCard size={14} />
                  </div>
                  <span className="font-semibold text-xs leading-tight">Flexible<br/>Payments</span>
                </div>
              </div>
              
              {/* Subtle background element */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Bottom Section: Contact / Quote */}
            <div className="p-3 bg-gray-50 shrink-0">
              <div className="flex gap-2 items-center">
                {/* Contact Icon / Graphic */}
                <div className="w-16 h-16 bg-white p-2 border border-gray-200 shrink-0 rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                   <Package size={32} strokeWidth={1.5} />
                </div>
                
                <div className="flex flex-col gap-1.5 flex-1">
                  <Link href="/contact" className="flex items-center justify-center gap-1.5 bg-primary-600 text-white py-1.5 px-2 rounded hover:bg-primary-700 transition-colors text-[11px] font-semibold shadow-sm">
                    Request Quote
                  </Link>
                  <Link href="/shop" className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 py-1.5 px-2 rounded hover:bg-gray-50 transition-colors text-[11px] font-semibold">
                    Browse Catalog
                  </Link>
                </div>
              </div>
              <div className="text-[10px] text-gray-500 mt-2 font-medium text-center">
                Need customized supplies?
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};
