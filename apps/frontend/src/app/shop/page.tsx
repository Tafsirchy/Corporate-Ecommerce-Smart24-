'use client';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { ProductCard, Product } from '../../components/ProductCard';
import { CategorySidebar, Category } from '../../components/CategorySidebar';
import { BrandSidebar, Brand } from '../../components/BrandSidebar';
import { FilterSidebar, FilterOption } from '../../components/FilterSidebar';
import { PriceFilter } from '../../components/PriceFilter';
import { RatingFilter } from '../../components/RatingFilter';
import { Pagination } from '../../components/Pagination';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function ShopContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeFiltersDefs, setActiveFilterDefs] = useState<any[]>([]);
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({});
  
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(16);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState('best-match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Standard hardcoded filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Dynamic filters state: Record<filterKey, string[]>
  const [selectedDynamicFilters, setSelectedDynamicFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    
    // Fetch categories
    axios.get(`${apiUrl}/categories`).then(res => {
      const data = res.data;
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
      setCategories(roots);
    }).catch(console.error);
      
    // Fetch brands
    axios.get(`${apiUrl}/brands`).then(res => setBrands(res.data)).catch(console.error);

    // Fetch dynamic filter definitions
    axios.get(`${apiUrl}/filters`).then(res => setActiveFilterDefs(res.data)).catch(console.error);
  }, []);

  // Fetch Facets whenever category or search changes (facets represent available options)
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    let url = `${apiUrl}/products/facets?`;
    if (categorySlug) url += `categoryId=${categorySlug}&`;
    if (searchQuery) url += `q=${searchQuery}&`;
    
    axios.get(url).then(res => {
      setFacets(res.data);
    }).catch(console.error);
  }, [categorySlug, searchQuery]);

  // Fetch Products (Server-side filtering)
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    setLoading(true);
    
    // Base URL depends on whether there is a search query
    let url = searchQuery && searchQuery.trim().length > 0 
      ? `${apiUrl}/products/search?q=${encodeURIComponent(searchQuery)}&` 
      : `${apiUrl}/products?`;

    url += `page=${page}&limit=${limit}&sort=${sortBy}&`;
    
    if (categorySlug) {
      url += `categoryId=${categorySlug}&`;
    }
    
    // Add dynamic filters to query
    if (Object.keys(selectedDynamicFilters).length > 0) {
      url += `dynamicFilters=${encodeURIComponent(JSON.stringify(selectedDynamicFilters))}&`;
    }

    // Add standard filters
    if (minPrice !== null) url += `minPrice=${minPrice}&`;
    if (maxPrice !== null) url += `maxPrice=${maxPrice}&`;
    if (selectedRating !== null) url += `rating=${selectedRating}&`;
    if (selectedBrands.length > 0) url += `brands=${encodeURIComponent(JSON.stringify(selectedBrands))}&`;

    axios.get(url)
      .then(res => {
        const fetchedProducts = res.data.data;
        const meta = res.data.meta;
        
        setProducts(fetchedProducts);
        setTotalPages(meta.totalPages);
        setTotalProducts(meta.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categorySlug, searchQuery, page, limit, sortBy, selectedDynamicFilters, selectedBrands, minPrice, maxPrice, selectedRating]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [categorySlug, searchQuery, sortBy, limit, selectedBrands, minPrice, maxPrice, selectedRating, selectedDynamicFilters]);

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
    
    return activeFiltersDefs.filter(f => 
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-[240px] shrink-0">
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
          {applicableFilterDefs.map(filterDef => {
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
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {categorySlug ? categorySlug.replace(/-/g, ' ') : 'All Products'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 hidden sm:inline">Show:</span>
                <select 
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
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
                <span className="text-gray-600 hidden sm:inline">Sort By:</span>
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
              const def = applicableFilterDefs.find(f => f.key === filterKey);
              values.forEach(v => {
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
                <span className="text-gray-600 font-medium mr-1">Filtered By:</span>
                {activeTags.map(tag => (
                  <span key={tag.id} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1.5 rounded-full text-gray-700 shadow-sm transition-all hover:border-gray-300">
                    {tag.label}
                    <button onClick={tag.onRemove} className="text-gray-400 hover:text-red-500 focus:outline-none flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </span>
                ))}
                <button onClick={clearAllFilters} className="text-primary-600 hover:text-primary-700 font-medium ml-2 uppercase text-xs tracking-wide">
                  Clear All
                </button>
              </div>
            );
          })()}

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
              <p className="mt-2 text-gray-500">Try adjusting your filters or search query.</p>
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
