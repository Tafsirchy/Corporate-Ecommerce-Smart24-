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

  if (banners.length === 0) return null;

  // Render the first active special offer banner
  const banner = banners[0];

  const content = (
    <div className="w-full overflow-hidden rounded-xl shadow-sm border border-border mt-8 mb-4">
      <OptimizedImage src={banner.imageUrl} 
        alt={banner.title || "Special Offer"} 
        className="w-full h-24 md:h-32 lg:h-40 object-cover object-center" />
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
