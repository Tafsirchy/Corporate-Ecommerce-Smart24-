'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState, useEffect } from 'react';
import { apiClient } from '@/context/AuthContext';

export const SpecialOfferBanner = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await apiClient.get('/banners?activeOnly=true&type=SPECIAL_OFFER');
        setBanners(res.data);
      } catch (error) {
        console.error('Failed to fetch special offer banners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="w-full h-24 md:h-32 lg:h-40 bg-muted/80 animate-pulse rounded-xl mt-8 mb-4 border border-border"></div>
      </div>
    );
  }

  // Render the first active special offer banner or a fallback if none exist
  const banner = banners.length > 0 ? banners[0] : {
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
    title: 'Huge End of Season Sale',
    targetUrl: '/shop'
  };

  const content = (
    <div className="w-full aspect-[6/1] overflow-hidden rounded-xl shadow-sm border border-border mt-8 mb-4 relative">
      <OptimizedImage src={banner.imageUrl} 
        alt={banner.title || "Special Offer"} 
        fill
        className="object-cover object-center" />
    </div>
  );

  return (
    <div className="container mx-auto px-4">
      {banner.targetUrl ? (
        <a href={banner.targetUrl} className="block hover:opacity-95 transition-opacity">
          {content}
        </a>
      ) : content}
    </div>
  );
};
