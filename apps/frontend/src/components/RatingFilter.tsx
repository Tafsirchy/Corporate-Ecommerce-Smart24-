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
    <div className="w-full bg-white p-5 rounded-xl border border-gray-100 shadow-sm mt-6">
      <h2 className="text-[15px] font-bold text-gray-900 mb-3 font-serif">Rating</h2>
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
                  className={`${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} mr-[2px]`} 
                />
              ))}
            </div>
            {rating < 5 && (
              <span className={`text-[13px] ${selectedRating === rating ? 'text-gray-900 font-semibold' : 'text-gray-500'} group-hover:text-gray-900 transition-colors`}>
                And Up
              </span>
            )}
            {selectedRating === rating && (
               <span className="text-[10px] bg-primary-50 text-primary-600 px-1.5 rounded ml-auto">Selected</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
