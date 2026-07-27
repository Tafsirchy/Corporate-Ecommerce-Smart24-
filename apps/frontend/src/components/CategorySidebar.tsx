'use client';
import { useState } from 'react';
import Link from 'next/link';

export interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

export function CategorySidebar({ categories, basePath = '/shop' }: { categories: Category[], basePath?: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const visibleCategories = showAll ? categories : categories.slice(0, 10);

  const renderTree = (cats: Category[], level: number = 1) => {
    return (
      <ul className={`space-y-0.5 ${level > 1 ? 'ml-3 mt-1 border-l border-gray-100 pl-3' : ''}`}>
        {cats.map((cat) => {
          const hasChildren = cat.children && cat.children.length > 0;
          const isExpanded = !!expanded[cat.id];

          return (
            <li key={cat.id}>
              <div className="flex items-center justify-between group">
                <Link 
                  href={`${basePath}?category=${cat.slug}`}
                  onClick={() => setExpanded(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                  className={`block py-1 flex-1 transition-colors text-[13px] hover:text-primary-600 ${level === 1 ? 'text-gray-700' : 'text-gray-500'}`}
                >
                  {cat.name}
                </Link>
                {hasChildren && (
                  <button 
                    onClick={(e) => toggleExpand(cat.id, e)}
                    className="p-1 text-gray-400 hover:text-gray-700 focus:outline-none"
                  >
                    <svg 
                      className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
              {hasChildren && isExpanded && renderTree(cat.children!, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="w-full bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
      <h2 className="text-[15px] font-bold text-gray-900 mb-3 font-serif">Categories</h2>
      {renderTree(visibleCategories)}
      
      {!showAll && categories.length > 10 && (
        <button 
          onClick={() => setShowAll(true)}
          className="mt-3 text-[13px] text-primary-600 hover:text-primary-700 font-medium w-full text-left"
        >
          See more...
        </button>
      )}
    </div>
  );
}
