'use client';
import { Star } from 'lucide-react';

interface RatingFilterProps {
  selectedRating: number | null;
  onChange: (rating: number | null) => void;
}

export function RatingFilter({ selectedRating, onChange }: RatingFilterProps) {
  const ratings = [5, 4, 3, 2, 1];

  const handleRatingClick = (rating: number) => {
    if (selectedRating === rating) {
      onChange(null); // Deselect if clicked again
    } else {
      onChange(rating);
    }
  };

  return (
    <div className="w-full bg-white p-5 rounded-xl border border-border shadow-sm mt-6">
      <h2 className="text-[15px] font-bold text-foreground mb-3 font-serif">Rating</h2>
      <div className="flex flex-col gap-2">
        {ratings.map((rating) => (
          <div 
            key={rating} 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => handleRatingClick(rating)}
          >
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={`${i < rating ? 'fill-accent text-accent' : 'fill-gray-200 text-gray-200'} mr-[2px]`} 
                />
              ))}
            </div>
            {rating < 5 && (
              <span className={`text-[13px] ${selectedRating === rating ? 'text-foreground font-semibold' : 'text-muted-foreground'} group-hover:text-foreground transition-colors`}>
                And Up
              </span>
            )}
            {selectedRating === rating && (
               <span className="text-[10px] bg-primary-50 text-primary/90 px-1.5 rounded ml-auto">Selected</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
