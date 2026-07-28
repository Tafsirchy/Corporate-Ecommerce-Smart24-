'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../context/AuthContext';
import { ProductCard, Product } from './ProductCard';

export const JustForYou = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const limit = 48; // 6 products per row * 8 rows = 48 products

  const fetchProducts = async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/products?page=${pageNumber}&limit=${limit}`);
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
      console.error('Failed to fetch Just For You products:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  if (isInitialLoad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Just For You</h2>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section id="just-for-you" className="bg-muted py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">Just For You</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((product, index) => (
            // Add index to key to prevent issues if same product is accidentally fetched twice
            <div key={`${product.id}-${index}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {page < totalPages && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-16 py-3 border border-primary-600 text-primary/90 font-semibold rounded hover:bg-primary/10 transition-colors disabled:opacity-50 flex items-center justify-center uppercase text-sm tracking-wider w-full sm:w-auto min-w-[300px]"
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
      </div>
    </section>
  );
};
