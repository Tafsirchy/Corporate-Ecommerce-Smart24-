'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/context/AuthContext';
import { ProductCard, Product } from '@/components/ProductCard';
import Link from 'next/link';
import { Timer, ArrowRight } from 'lucide-react';

export const FlashSale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For a visual effect, a dummy countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const fetchFlashSaleProducts = async () => {
      try {
        const res = await apiClient.get('/products?isFlashSale=true&limit=6');
        setProducts(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch flash sale products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashSaleProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) hours = 23;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-muted/80 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted/80 rounded"></div>
              <div className="h-4 bg-muted/80 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <section id="flash-sale" className="bg-white py-8">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-6 pb-2 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Flash Sale
          </h2>
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 w-full sm:w-auto">
              <div className="text-destructive font-medium text-base sm:text-base">
                On Sale Now
              </div>
              <div className="flex items-center gap-2 text-foreground text-sm sm:text-sm">
                <span>Ending in:</span>
                <span className="flex items-center gap-1 font-semibold">
                  <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-base sm:text-sm">{pad(timeLeft.hours)}</span>:
                  <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-base sm:text-sm">{pad(timeLeft.minutes)}</span>:
                  <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-base sm:text-sm">{pad(timeLeft.seconds)}</span>
                </span>
              </div>
            </div>
            
            <Link 
              href="/flash-sale" 
              className="text-primary/90 font-medium hover:text-primary-700 border border-primary-600 px-4 py-2.5 sm:py-1.5 rounded-sm hover:bg-primary/10 transition-colors uppercase text-base sm:text-sm active:scale-95 w-full sm:w-auto text-center"
            >
              Shop all product
            </Link>
          </div>
        </div>
        
        {/* Products List (Swipeable Carousel on Mobile, Grid on Desktop) */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-3 xl:grid-cols-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {products.slice(0, 6).map((product) => (
            <div key={product.id} className="min-w-[280px] w-[80vw] md:w-auto shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
