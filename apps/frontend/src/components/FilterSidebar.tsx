'use client';
import { useState } from 'react';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterSidebarProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  limit?: number;
}

export function FilterSidebar({ title, options, selectedValues, onChange, limit = 10 }: FilterSidebarProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleOptions = showAll ? options : options.slice(0, limit);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="w-full bg-white p-5 rounded-xl border border-gray-100 shadow-sm mt-6">
      <h2 className="text-[15px] font-bold text-gray-900 mb-3 font-serif">{title}</h2>
      <div className="space-y-2">
        {visibleOptions.map(option => (
          <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={selectedValues.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition cursor-pointer appearance-none checked:bg-primary-600 checked:border-primary-600 border"
              />
              {selectedValues.includes(option.value) && (
                <svg className="absolute w-3 h-3 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              )}
            </div>
            <span className="text-[13px] text-gray-600 group-hover:text-primary-600 transition-colors">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {!showAll && options.length > limit && (
        <button 
          onClick={() => setShowAll(true)}
          className="mt-4 text-[13px] text-primary-600 hover:text-primary-700 font-medium w-full text-left"
        >
          See more...
        </button>
      )}
      {showAll && options.length > limit && (
        <button 
          onClick={() => setShowAll(false)}
          className="mt-4 text-[13px] text-primary-600 hover:text-primary-700 font-medium w-full text-left"
        >
          See less...
        </button>
      )}
    </div>
  );
}
