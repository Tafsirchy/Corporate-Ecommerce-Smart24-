'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../context/AuthContext';
import { ProductCard, Product } from '../../components/ProductCard';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setHasSearched(true);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/products/search?q=${encodeURIComponent(query)}&limit=24`);
        setProducts(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch search results:', error);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-2xl font-bold mb-6">
        {query ? `Search results for "${query}"` : 'Search'}
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="bg-white p-4 rounded-lg shadow animate-pulse flex flex-col h-[300px]">
              <div className="w-full h-40 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-3 pt-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched && products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-xl text-gray-500 mb-2">No results found {query ? `for "${query}"` : ''}</p>
          <p className="text-gray-400">Try checking your spelling or using more general terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
