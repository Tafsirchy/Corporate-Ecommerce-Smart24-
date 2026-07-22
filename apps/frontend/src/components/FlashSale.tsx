'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../context/AuthContext';
import { ProductCard, Product } from './ProductCard';
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
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              On Sale Now
            </h2>
            <div className="flex items-center gap-1.5 text-rose-500 font-semibold bg-rose-50 px-3 py-1 rounded-full text-sm">
              <Timer size={16} />
              <span>Ending in:</span>
              <span className="flex items-center gap-1">
                <span className="bg-rose-500 text-white px-1.5 rounded text-xs">{pad(timeLeft.hours)}</span>:
                <span className="bg-rose-500 text-white px-1.5 rounded text-xs">{pad(timeLeft.minutes)}</span>:
                <span className="bg-rose-500 text-white px-1.5 rounded text-xs">{pad(timeLeft.seconds)}</span>
              </span>
            </div>
          </div>
          
          <Link 
            href="/flash-sale" 
            className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 border border-primary-100 bg-primary-50 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors"
          >
            Shop all product <ArrowRight size={16} />
          </Link>
        </div>
        
        {/* Products Grid (Exactly 6 items in one row on large screens) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {products.slice(0, 6).map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
