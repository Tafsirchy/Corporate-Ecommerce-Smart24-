'use client';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ProductCard, Product } from '../../components/ProductCard';
import { CategorySidebar, Category } from '../../components/CategorySidebar';
import { BrandSidebar, Brand } from '../../components/BrandSidebar';
import { FilterSidebar, FilterOption } from '../../components/FilterSidebar';
import { PriceFilter } from '../../components/PriceFilter';
import { RatingFilter } from '../../components/RatingFilter';
import { Pagination } from '../../components/Pagination';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Filter, X } from 'lucide-react';

function ShopContent() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(16);
  const [sortBy, setSortBy] = useState('best-match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Standard hardcoded filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Dynamic filters state: Record<filterKey, string[]>
  const [selectedDynamicFilters, setSelectedDynamicFilters] = useState<Record<string, string[]>>({});

  // 1. Static Metadata (Categories, Brands, Filter Defs)
  const { data: metadata } = useQuery({
    queryKey: ['shop-metadata'],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const [catRes, brandRes, filterRes] = await Promise.all([
        axios.get(`${apiUrl}/categories`),
        axios.get(`${apiUrl}/brands`),
        axios.get(`${apiUrl}/filters/active`)
      ]);
      const data = catRes.data;
      const map = new Map<string, Category>();
      const roots: Category[] = [];
      data.forEach((item: any) => map.set(item.id, { ...item, children: [] }));
      data.forEach((item: any) => {
        if (item.parentId) {
          const parent = map.get(item.parentId);
          if (parent) parent.children!.push(map.get(item.id)!);
        } else {
          roots.push(map.get(item.id)!);
        }
      });
      return { 
        categories: roots, 
        brands: brandRes.data?.data || brandRes.data, 
        activeFiltersDefs: filterRes.data?.data || filterRes.data 
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories = metadata?.categories || [];
  const brands = metadata?.brands || [];
  const activeFiltersDefs = metadata?.activeFiltersDefs || [];

  // 2. Facets
  const { data: facetsData } = useQuery({
    queryKey: ['facets', categorySlug, searchQuery],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      let url = `${apiUrl}/products/facets?`;
      if (categorySlug) url += `categoryId=${categorySlug}&`;
      if (searchQuery) url += `q=${searchQuery}&`;
      const res = await axios.get(url);
      return res.data;
    },
    staleTime: 60 * 1000,
  });
  
  const facets = facetsData || {};

  // 3. Products
  const { data: productsData, isLoading: loading } = useQuery({
    queryKey: ['products', categorySlug, searchQuery, page, limit, sortBy, selectedDynamicFilters, selectedBrands, minPrice, maxPrice, selectedRating],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      let url = searchQuery && searchQuery.trim().length > 0 
        ? `${apiUrl}/products/search?q=${encodeURIComponent(searchQuery)}&` 
        : `${apiUrl}/products?`;

      url += `page=${page}&limit=${limit}&sort=${sortBy}&`;
      if (categorySlug) url += `categoryId=${categorySlug}&`;
      if (Object.keys(selectedDynamicFilters).length > 0) url += `dynamicFilters=${encodeURIComponent(JSON.stringify(selectedDynamicFilters))}&`;
      if (minPrice !== null) url += `minPrice=${minPrice}&`;
      if (maxPrice !== null) url += `maxPrice=${maxPrice}&`;
      if (selectedRating !== null) url += `rating=${selectedRating}&`;
      if (selectedBrands.length > 0) url += `brands=${encodeURIComponent(JSON.stringify(selectedBrands))}&`;

      const res = await axios.get(url);
      return res.data;
    },
    placeholderData: (previousData) => previousData, // keep previous data while fetching new (prevents layout shift)
  });

  const products = productsData?.data || [];
  const totalPages = productsData?.meta?.totalPages || 1;
  const totalProducts = productsData?.meta?.total || 0;

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [categorySlug, searchQuery, sortBy, limit, selectedBrands, minPrice, maxPrice, selectedRating, selectedDynamicFilters]);

  // Lock body scroll when mobile filters are open
  useEffect(() => {
    if (isMobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileFiltersOpen]);

  // Determine applicable filter defs for the current category
  const applicableFilterDefs = useMemo(() => {
    if (!categorySlug) return activeFiltersDefs; 
    
    const findCatId = (cats: Category[], slug: string): string | null => {
      for (const c of cats) {
        if (c.slug === slug) return c.id;
        if (c.children) {
          const id = findCatId(c.children, slug);
          if (id) return id;
        }
      }
      return null;
    };
    const catId = findCatId(categories, categorySlug);
    
    return activeFiltersDefs.filter((f: any) => 
      !f.categoryIds || f.categoryIds.length === 0 || (catId && f.categoryIds.includes(catId))
    );
  }, [activeFiltersDefs, categorySlug, categories]);

  const toggleDynamicFilter = (filterKey: string, values: string[]) => {
    setSelectedDynamicFilters(prev => ({
      ...prev,
      [filterKey]: values
    }));
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setMinPrice(null);
    setMaxPrice(null);
    setSelectedRating(null);
    setSelectedDynamicFilters({});
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Mobile Floating Filter Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
         <button onClick={() => setIsMobileFiltersOpen(true)} className="bg-primary-600 text-white px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] font-medium flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Sort
         </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Mobile Bottom Sheet */}
        <aside className={`
          fixed inset-0 z-50 bg-white overflow-y-auto p-4 transition-transform duration-300
          ${isMobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'}
          md:static md:translate-y-0 md:bg-transparent md:p-0 md:w-[240px] md:shrink-0 md:block md:z-auto
        `}>
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 -mr-2"><X className="w-6 h-6" /></button>
          </div>

          <div className="mb-6">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <CategorySidebar categories={categories} />
          
          {brands.length > 0 && (
            <BrandSidebar 
              brands={brands} 
              selectedBrands={selectedBrands} 
              onChange={setSelectedBrands} 
            />
          )}
          
          <PriceFilter 
            minPrice={minPrice} 
            maxPrice={maxPrice} 
            onApply={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
          />
          
          <RatingFilter 
            selectedRating={selectedRating} 
            onChange={setSelectedRating} 
          />
          
          {/* Dynamic Filters rendering */}
          {applicableFilterDefs.map((filterDef: any) => {
            if (!filterDef.values || filterDef.values.length === 0) return null;
            
            const options = filterDef.values.map((v: any) => {
              // Get count from facets
              const count = facets[filterDef.key]?.[v.value] || 0;
              return {
                id: v.value,
                label: count > 0 ? `${v.label} (${count})` : v.label,
                value: v.value,
                colorHex: v.colorHex
              };
            });

            return (
              <FilterSidebar 
                key={filterDef.id}
                title={filterDef.label}
                options={options}
                selectedValues={selectedDynamicFilters[filterDef.key] || []}
                onChange={(vals) => toggleDynamicFilter(filterDef.key, vals)}
              />
            );
          })}

          {/* Mobile Apply Button */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-8 md:hidden border-t border-border">
            <button onClick={() => setIsMobileFiltersOpen(false)} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium transition-colors">
              Show Results ({totalProducts})
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground capitalize">
                {categorySlug ? categorySlug.replace(/-/g, ' ') : 'All Products'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground hidden sm:inline">Show:</span>
                <select 
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value={16}>16 per page</option>
                  <option value={36}>36 per page</option>
                  <option value={48}>48 per page</option>
                  <option value={64}>64 per page</option>
                  <option value={80}>80 per page</option>
                  <option value={96}>96 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground hidden sm:inline">Sort By:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="best-match">Best Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
              <div className="hidden sm:flex items-center gap-1 border border-border rounded-md p-0.5">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                  title="Grid View"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                  title="List View"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(() => {
            const activeTags: { id: string, label: string, onRemove: () => void }[] = [];
            
            selectedBrands.forEach(b => activeTags.push({ id: `brand-${b}`, label: b, onRemove: () => setSelectedBrands(prev => prev.filter(x => x !== b)) }));
            if (minPrice !== null || maxPrice !== null) {
               activeTags.push({ id: 'price', label: `Price: ${minPrice || 0} - ${maxPrice || 'Any'}`, onRemove: () => { setMinPrice(null); setMaxPrice(null); } });
            }
            if (selectedRating !== null) {
               activeTags.push({ id: 'rating', label: `Rating: ${selectedRating} & Up`, onRemove: () => setSelectedRating(null) });
            }
            
            Object.entries(selectedDynamicFilters).forEach(([filterKey, values]) => {
              const def = applicableFilterDefs.find((f: any) => f.key === filterKey);
              values.forEach((v: any) => {
                const label = def?.values?.find((opt: any) => opt.value === v)?.label || v;
                activeTags.push({
                  id: `${filterKey}-${v}`,
                  label,
                  onRemove: () => {
                    setSelectedDynamicFilters(prev => ({
                      ...prev,
                      [filterKey]: prev[filterKey].filter(x => x !== v)
                    }));
                  }
                });
              });
            });

            if (activeTags.length === 0) return null;

            return (
              <div className="flex flex-wrap items-center gap-2 mb-6 text-[13px]">
                <span className="text-muted-foreground font-medium mr-1">Filtered By:</span>
                {activeTags.map(tag => (
                  <span key={tag.id} className="inline-flex items-center gap-1.5 bg-white border border-border px-2.5 py-1.5 rounded-full text-foreground shadow-sm transition-all hover:border-border">
                    {tag.label}
                    <button onClick={tag.onRemove} className="text-muted-foreground hover:text-destructive focus:outline-none flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </span>
                ))}
                <button onClick={clearAllFilters} className="text-primary/90 hover:text-primary-700 font-medium ml-2 uppercase text-xs tracking-wide">
                  Clear All
                </button>
              </div>
            );
          })()}

          {loading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-6"}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className={`animate-pulse bg-muted/80 rounded-xl ${viewMode === 'grid' ? 'h-80' : 'h-48'}`}></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted rounded-xl border border-border">
              <h3 className="text-xl font-medium text-foreground">No products found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
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
