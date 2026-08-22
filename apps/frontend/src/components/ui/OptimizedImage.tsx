'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { RefreshCcw } from 'lucide-react';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'> {
  src: string | undefined | null;
  alt: string; // Enforce alt tag
  width?: number | `${number}`;
  height?: number | `${number}`;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  // If true, fills the parent container. Parent MUST have position: relative
  fill?: boolean;
}

// A generic embedded SVG placeholder that will never 404
const GENERIC_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30 70l15-20 10 10 20-30 15 40z' fill='%23ccc'/%3E%3Ccircle cx='35' cy='35' r='10' fill='%23ccc'/%3E%3C/svg%3E";

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  containerClassName = '',
  fill = false,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If no source is provided or if it errors, use fallback
  const imageSrc = !src || hasError ? GENERIC_PLACEHOLDER : src;

  // Next.js requires either width/height or fill. 
  // If fill is not explicitly passed but width/height are missing, we default to fill.
  const isFill = fill || (!width && !height);

  return (
    <div 
      className={`relative bg-[#f0f0f0] overflow-hidden ${isLoading && !hasError ? 'animate-pulse' : ''} ${containerClassName}`} 
      style={{ 
        minHeight: isFill ? undefined : (height || 200),
        width: isFill ? '100%' : (width || 'auto'),
        height: isFill ? '100%' : (height || 'auto'),
      }}
    >
      <Image
        src={imageSrc}
        alt={alt || "Image"} // Fallback alt to prevent screen reader breaking
        priority={priority}
        width={isFill ? undefined : Number(width)}
        height={isFill ? undefined : Number(height)}
        fill={isFill}
        className={`object-cover object-center ${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ imageRendering: 'auto' }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        sizes={isFill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
        {...rest}
      />
      {hasError && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors z-10"
          onClick={() => {
            setHasError(false);
            setIsLoading(true);
          }}
          title="Click to retry loading image"
        >
          <RefreshCcw className="w-5 h-5 text-gray-500 mb-1" />
          <span className="text-[10px] text-gray-500 font-medium">Retry</span>
        </div>
      )}
    </div>
  );
};
