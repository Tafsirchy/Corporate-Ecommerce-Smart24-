'use client';

import React, { useRef, useState, useEffect } from 'react';

interface ScrollFadeProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export function ScrollFade({ children, className = '', as: Component = 'div', ...props }: ScrollFadeProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const [fadeClass, setFadeClass] = useState('');

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      // Determine if scrolling is horizontal or vertical based on existing classes
      const isVertical = className.includes('overflow-y-auto') || className.includes('overflow-y-scroll');
      
      if (isVertical) {
        const hasVerticalScrollbar = el.scrollHeight > el.clientHeight;
        if (!hasVerticalScrollbar) {
          setFadeClass('');
          return;
        }

        const isAtTop = el.scrollTop <= 0;
        const isAtBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;

        if (isAtTop && isAtBottom) setFadeClass('');
        else setFadeClass('scroll-fade-y'); // Simplified for vertical (fades both top/bottom) - we could add scroll-fade-top/bottom if needed
      } else {
        const hasHorizontalScrollbar = el.scrollWidth > el.clientWidth;
        if (!hasHorizontalScrollbar) {
          setFadeClass('');
          return;
        }

        const isAtLeft = el.scrollLeft <= 0;
        const isAtRight = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth;

        if (isAtLeft && isAtRight) {
          setFadeClass('');
        } else if (isAtLeft) {
          setFadeClass('scroll-fade-right');
        } else if (isAtRight) {
          setFadeClass('scroll-fade-left');
        } else {
          setFadeClass('scroll-fade-x');
        }
      }
    };

    handleScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });
    
    // MutationObserver to detect content changes
    const observer = new MutationObserver(handleScroll);
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    window.addEventListener('resize', handleScroll);
    
    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer.disconnect();
    };
  }, [className]);

  // Remove any statically applied scroll-fade classes from the passed className
  // to avoid conflicts with our dynamic class
  const cleanClassName = className
    .replace(/\bscroll-fade-(x|y|right|left)\b/g, '')
    .trim();

  return (
    <Component 
      ref={scrollRef as any} 
      className={`${cleanClassName} no-scrollbar ${fadeClass}`.trim()} 
      {...props}
    >
      {children}
    </Component>
  );
}
