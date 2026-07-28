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
    <div className="w-full bg-white p-5 rounded-xl border border-border shadow-sm mt-6">
      <h2 className="text-[15px] font-bold text-foreground mb-3 font-serif">Price</h2>
      <div className="flex items-center gap-2">
        <input 
          type="number"
          placeholder="Min"
          value={minStr}
          onChange={e => setMinStr(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-[70px] flex-1 px-3 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-primary-500"
          min="0"
        />
        <span className="text-muted-foreground">-</span>
        <input 
          type="number"
          placeholder="Max"
          value={maxStr}
          onChange={e => setMaxStr(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-[70px] flex-1 px-3 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-primary-500"
          min="0"
        />
        <button 
          onClick={handleApply}
          className="bg-accent text-white p-2 rounded hover:bg-accent/90 transition-colors shrink-0 flex items-center justify-center"
          aria-label="Apply price filter"
        >
          <Play size={14} className="fill-current ml-0.5" />
        </button>
      </div>
    </div>
  );
}
