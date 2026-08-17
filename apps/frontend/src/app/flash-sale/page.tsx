'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/context/AuthContext';
import { ProductCard, Product } from '@/components/ProductCard';
import { Timer } from 'lucide-react';

export default function FlashSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Dummy countdown timer for the page
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  const limit = 24;

  async function fetchFlashSaleProducts(pageNumber: number) {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/products?isFlashSale=true&page=${pageNumber}&limit=${limit}`);
      const newProducts = res.data.data || [];
      
      if (pageNumber === 1) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }
      
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch flash sale products:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchFlashSaleProducts(1);
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

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFlashSaleProducts(nextPage);
    }
  };

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-muted min-h-screen py-8">
      <div className="container mx-auto px-4">
        
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between border-l-4 border-rose-500">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Flash Sale</h1>
            <p className="text-muted-foreground">Grab these exclusive deals before time runs out!</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap items-center justify-center gap-2 text-destructive font-bold bg-danger-bg px-4 py-2 rounded-lg text-base md:text-lg">
            <Timer size={20} className="md:w-6 md:h-6" />
            <span>Ending in:</span>
            <span className="flex items-center gap-1 text-lg md:text-xl">
              <span className="bg-rose-500 text-white px-2 py-0.5 rounded">{pad(timeLeft.hours)}</span>:
              <span className="bg-rose-500 text-white px-2 py-0.5 rounded">{pad(timeLeft.minutes)}</span>:
              <span className="bg-rose-500 text-white px-2 py-0.5 rounded">{pad(timeLeft.seconds)}</span>
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isInitialLoad ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">No Flash Sale deals available right now.</h2>
            <p className="text-muted-foreground mt-2">Check back later for exciting offers!</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {products.map((product, index) => (
                <div key={`${product.id}-${index}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {page < totalPages && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-16 py-3 border border-primary-600 text-primary/90 font-semibold rounded hover:bg-primary/10 transition-colors disabled:opacity-50 flex min-h-[44px] items-center justify-center uppercase text-sm tracking-wider w-full sm:w-auto sm:min-w-[300px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : (
                    'LOAD MORE'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
