'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductCard, Product } from '../../components/ProductCard';
import { CategorySidebar, Category } from '../../components/CategorySidebar';
import { Pagination } from '../../components/Pagination';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('best-match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Fetch categories
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    axios.get(`${apiUrl}/categories`)
      .then(res => {
        const data = res.data;
        const map = new Map<string, Category>();
        const roots: Category[] = [];
        
        data.forEach((item: any) => {
          map.set(item.id, { ...item, children: [] });
        });
        
        data.forEach((item: any) => {
          if (item.parentId) {
            const parent = map.get(item.parentId);
            if (parent) {
              parent.children!.push(map.get(item.id)!);
            }
          } else {
            roots.push(map.get(item.id)!);
          }
        });
        setCategories(roots);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    // Fetch products
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    axios.get(`${apiUrl}/products?page=${page}&limit=16&sort=${sortBy}`)
      .then(res => {
        let filteredProducts = res.data.data || res.data; // fallback for backwards compatibility
        if (res.data.meta) {
          setTotalPages(res.data.meta.totalPages);
        }
        if (categorySlug) {
          if (categories.length > 0) {
            const getSlugs = (cats: Category[], target: string, found: boolean = false): string[] => {
              let slugs: string[] = [];
              for (const c of cats) {
                if (c.slug === target || found) {
                  slugs.push(c.slug);
                  if (c.children) {
                    slugs = slugs.concat(getSlugs(c.children, target, true));
                  }
                } else if (c.children) {
                  const childSlugs = getSlugs(c.children, target, false);
                  if (childSlugs.length > 0) {
                    slugs = slugs.concat(childSlugs);
                  }
                }
              }
              return slugs;
            };

            const validSlugs = getSlugs(categories, categorySlug);
            if (validSlugs.length > 0) {
              filteredProducts = filteredProducts.filter((p: any) => validSlugs.includes(p.category?.slug));
            } else {
              filteredProducts = filteredProducts.filter((p: any) => p.category?.slug === categorySlug);
            }
          } else {
            filteredProducts = filteredProducts.filter((p: any) => p.category?.slug === categorySlug);
          }
        }
        if (searchQuery) {
          filteredProducts = filteredProducts.filter((p: any) => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setProducts(filteredProducts);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [categorySlug, searchQuery, page, sortBy, categories]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4">
          <div className="mb-6">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <CategorySidebar categories={categories} />
        </aside>

        {/* Product Grid */}
        <main className="w-full md:w-3/4">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {searchQuery ? searchQuery : categorySlug ? categorySlug : 'All Products'}
              </h1>
              <span className="text-sm text-gray-500 mt-1 block">
                {products.length} items found {searchQuery ? `for "${searchQuery}"` : ''}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Sort By:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="best-match">Best Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
              <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-md p-0.5">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'hover:bg-gray-50 text-gray-400'}`}
                  title="Grid View"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'hover:bg-gray-50 text-gray-400'}`}
                  title="List View"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-6"}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className={`animate-pulse bg-gray-200 rounded-xl ${viewMode === 'grid' ? 'h-80' : 'h-48'}`}></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-xl font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your category filter.</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
