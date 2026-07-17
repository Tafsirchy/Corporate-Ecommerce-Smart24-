'use client';
import Link from 'next/link';

export interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

export function CategorySidebar({ categories }: { categories: Category[] }) {
  return (
    <div className="w-full max-w-xs bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link 
              href={`/shop?category=${category.slug}`}
              className="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              {category.name}
            </Link>
            {category.children && category.children.length > 0 && (
              <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link 
                      href={`/shop?category=${child.slug}`}
                      className="block py-1.5 px-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
