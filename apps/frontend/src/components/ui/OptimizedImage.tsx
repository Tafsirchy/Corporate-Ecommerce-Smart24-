'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

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

  // If no source is provided or if it errors, use fallback
  const imageSrc = !src || hasError ? GENERIC_PLACEHOLDER : src;

  // Next.js requires either width/height or fill. 
  // If fill is not explicitly passed but width/height are missing, we default to fill.
  const isFill = fill || (!width && !height);

  return (
    <div 
      className={`relative bg-[#f0f0f0] overflow-hidden ${containerClassName}`} 
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
        className={`object-cover object-center ${className}`}
        style={{ imageRendering: 'auto' }}
        onError={() => setHasError(true)}
        sizes={isFill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
        {...rest}
      />
    </div>
  );
};
