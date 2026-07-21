'use client';
import { useState } from 'react';
import { Play } from 'lucide-react';

interface PriceFilterProps {
  onApply: (min: number | null, max: number | null) => void;
  minPrice: number | null;
  maxPrice: number | null;
}

export function PriceFilter({ onApply, minPrice, maxPrice }: PriceFilterProps) {
  const [minStr, setMinStr] = useState(minPrice ? minPrice.toString() : '');
  const [maxStr, setMaxStr] = useState(maxPrice ? maxPrice.toString() : '');

  const handleApply = () => {
    const min = minStr ? parseFloat(minStr) : null;
    const max = maxStr ? parseFloat(maxStr) : null;
    onApply(min, max);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="w-full bg-white p-5 rounded-xl border border-gray-100 shadow-sm mt-6">
      <h2 className="text-[15px] font-bold text-gray-900 mb-3 font-serif">Price</h2>
      <div className="flex items-center gap-2">
        <input 
          type="number"
          placeholder="Min"
          value={minStr}
          onChange={e => setMinStr(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-[70px] flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-primary-500"
          min="0"
        />
        <span className="text-gray-400">-</span>
        <input 
          type="number"
          placeholder="Max"
          value={maxStr}
          onChange={e => setMaxStr(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-[70px] flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-primary-500"
          min="0"
        />
        <button 
          onClick={handleApply}
          className="bg-[#f57224] text-white p-2 rounded hover:bg-orange-600 transition-colors shrink-0 flex items-center justify-center"
          aria-label="Apply price filter"
        >
          <Play size={14} className="fill-current ml-0.5" />
        </button>
      </div>
    </div>
  );
}
