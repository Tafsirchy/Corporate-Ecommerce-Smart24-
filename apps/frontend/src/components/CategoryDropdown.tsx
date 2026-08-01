'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  level: number;
  parentId: string | null;
  children?: Category[];
}

export function CategoryDropdown({ isTransparent }: { isTransparent?: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeLevel1, setActiveLevel1] = useState<string | null>(null);
  const [activeLevel2, setActiveLevel2] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        // Build tree from flat array
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
      .catch(console.error);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveLevel1(null);
      setActiveLevel2(null);
    }, 150); // slight delay to prevent flickering
  };

  const textColor = isTransparent ? 'text-white hover:text-white/80' : 'text-foreground hover:text-primary/90';

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <div className={`flex items-center gap-1.5 cursor-pointer transition-colors font-medium ${textColor}`}>
        <span>Categories</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Level 1, 2, 3 Dropdowns Container */}
      {isOpen && categories.length > 0 && (
        <div className="absolute top-full left-0 mt-[1.1rem] flex shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md z-[60] bg-white">
          {/* Invisible bridge to prevent mouse leave when moving cursor down */}
          <div className="absolute -top-4 left-0 w-full h-4 bg-transparent" />
          
          {/* Level 1 Column */}
          <div className="w-64 border border-border rounded-l-md py-2 min-h-[300px]">
            {categories.map((l1) => (
              <Link 
                key={l1.id}
                href={`/shop?category=${l1.slug}`}
                onMouseEnter={() => { setActiveLevel1(l1.id); setActiveLevel2(null); }}
                className={`flex items-center justify-between px-4 py-1 text-sm transition-colors ${activeLevel1 === l1.id ? 'bg-accent/10 text-accent font-medium' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {l1.name}
                {l1.children && l1.children.length > 0 && <ChevronRight size={16} className={activeLevel1 === l1.id ? 'text-accent' : 'text-muted-foreground'} />}
              </Link>
            ))}
          </div>

          {/* Level 2 Column */}
          {activeLevel1 && (categories.find(c => c.id === activeLevel1)?.children?.length ?? 0) > 0 && (
            <div className="w-64 border-y border-r border-border py-2 min-h-full">
              {categories.find(c => c.id === activeLevel1)?.children?.map((l2) => (
                <Link 
                  key={l2.id}
                  href={`/shop?category=${l2.slug}`}
                  onMouseEnter={() => setActiveLevel2(l2.id)}
                  className={`flex items-center justify-between px-4 py-1 text-[13.5px] transition-colors ${activeLevel2 === l2.id ? 'bg-accent/10 text-accent font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {l2.name}
                  {l2.children && l2.children.length > 0 && <ChevronRight size={14} className={activeLevel2 === l2.id ? 'text-accent' : 'text-muted-foreground'} />}
                </Link>
              ))}
            </div>
          )}

          {/* Level 3 Column */}
          {activeLevel2 && (categories.find(c => c.id === activeLevel1)?.children?.find(c => c.id === activeLevel2)?.children?.length ?? 0) > 0 && (
            <div className="w-64 border-y border-r border-border rounded-r-md py-2 min-h-full">
              {categories.find(c => c.id === activeLevel1)?.children?.find(c => c.id === activeLevel2)?.children?.map((l3) => (
                <Link 
                  key={l3.id}
                  href={`/shop?category=${l3.slug}`}
                  className="block px-4 py-1 text-[13px] text-muted-foreground hover:bg-accent/10 hover:text-accent hover:font-medium transition-colors"
                >
                  {l3.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
