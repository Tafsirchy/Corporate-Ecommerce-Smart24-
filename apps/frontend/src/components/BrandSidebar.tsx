'use client';
import { useState } from 'react';

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface BrandSidebarProps {
  brands: Brand[];
  selectedBrands: string[];
  onChange: (slugs: string[]) => void;
}

export function BrandSidebar({ brands, selectedBrands, onChange }: BrandSidebarProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleBrands = showAll ? brands : brands.slice(0, 10);

  const toggleBrand = (slug: string) => {
    if (selectedBrands.includes(slug)) {
      onChange(selectedBrands.filter(s => s !== slug));
    } else {
      onChange([...selectedBrands, slug]);
    }
  };

  return (
    <div className="w-full bg-white p-5 rounded-xl border border-border shadow-sm mt-6">
      <h2 className="text-[15px] font-bold text-foreground mb-3 font-serif">Brands</h2>
      <div className="space-y-2">
        {visibleBrands.map(brand => (
          <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={selectedBrands.includes(brand.slug)}
                onChange={() => toggleBrand(brand.slug)}
                className="w-4 h-4 rounded border-border text-primary/90 focus:ring-primary-500 transition cursor-pointer appearance-none checked:bg-primary-600 checked:border-primary-600 border"
              />
              {selectedBrands.includes(brand.slug) && (
                <svg className="absolute w-3 h-3 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              )}
            </div>
            <span className="text-[13px] text-muted-foreground group-hover:text-primary/90 transition-colors">
              {brand.name}
            </span>
          </label>
        ))}
      </div>
      {!showAll && brands.length > 10 && (
        <button 
          onClick={() => setShowAll(true)}
          className="mt-4 text-[13px] text-primary/90 hover:text-primary-700 font-medium w-full text-left"
        >
          See more brands...
        </button>
      )}
      {showAll && brands.length > 10 && (
        <button 
          onClick={() => setShowAll(false)}
          className="mt-4 text-[13px] text-primary/90 hover:text-primary-700 font-medium w-full text-left"
        >
          See less brands...
        </button>
      )}
    </div>
  );
}
