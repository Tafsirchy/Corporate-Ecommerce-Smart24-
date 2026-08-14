import { OptimizedImage } from '@/components/ui/OptimizedImage';
import React from 'react';
import Link from 'next/link';

interface BentoCardProps {
  title: React.ReactNode;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
  href: string;
  className?: string;
  imageClassName?: string;
  isLarge?: boolean;
}

const BentoCard = ({ title, subtitle, buttonText, imageUrl, href, className, imageClassName, isLarge }: BentoCardProps) => {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[24px] bg-[#f0f0f0] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] flex flex-col p-5 md:p-6 ${className}`}
    >
      {/* Background Image Setup */}
      {isLarge ? (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* Dark gradient overlay for large card to make text readable */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 z-0 flex items-end justify-end p-3">
          <OptimizedImage src={imageUrl}
            alt={typeof title === 'string' ? title : subtitle}
            className={`object-contain transition-transform duration-700 group-hover:scale-105 mix-blend-multiply ${imageClassName}`} />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-20 flex flex-col h-full ${isLarge ? 'text-white' : 'text-foreground'} w-full`}>
        <h3 className={`font-bold tracking-tight leading-none mb-1 ${isLarge ? 'text-3xl md:text-4xl lg:text-5xl max-w-[80%]' : 'text-xl lg:text-2xl uppercase max-w-[60%] md:max-w-[70%]'}`}>
          {title}
        </h3>
        <p className={`font-medium mb-auto mt-1 ${isLarge ? 'text-sm md:text-sm text-gray-200 tracking-wider uppercase mb-3 order-first' : 'text-sm text-muted-foreground'}`}>
          {subtitle}
        </p>

        <div className={`mt-auto pt-6`}>
          <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isLarge
            ? 'bg-white text-black hover:bg-muted'
            : 'bg-transparent border border-gray-900 text-foreground group-hover:bg-primary group-hover:text-white'
            }`}>
            {buttonText}
          </span>
        </div>
      </div>
    </Link>
  );
};

// Default layout configuration for the 8 slots to preserve the premium bento grid exactly
const layoutConfig = [
  { position: 1, isLarge: true, className: "row-span-2 md:col-span-2 md:row-span-2", imageClassName: "" },
  { position: 2, isLarge: false, className: "", imageClassName: "w-full h-full object-right-bottom" },
  { position: 3, isLarge: false, className: "md:col-start-2 lg:col-start-3 md:row-start-3 lg:row-start-2 md:row-span-2 lg:row-span-2", imageClassName: "w-[85%] h-[85%] object-right-bottom pb-2" },
  { position: 4, isLarge: false, className: "lg:col-start-1 lg:row-start-3", imageClassName: "w-full h-full object-right-bottom" },
  { position: 5, isLarge: false, className: "lg:col-start-2 lg:row-start-3", imageClassName: "w-full h-full object-right-bottom" },
  { position: 6, isLarge: false, className: "lg:col-start-1 lg:row-start-4", imageClassName: "w-full h-full object-right-bottom" },
  { position: 7, isLarge: false, className: "lg:col-start-2 lg:row-start-4", imageClassName: "w-full h-full object-right-bottom" },
  { position: 8, isLarge: false, className: "lg:col-start-3 lg:row-start-4", imageClassName: "w-full h-full object-right-bottom" }
];

const fallbackData = [
  { position: 1, title: "ELECTRONICS", subtitle: "Tech & Gadgets", buttonText: "Shop Tech", targetUrl: "/shop?category=electronics", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800&h=600" },
  { position: 2, title: "ACCESSORIES", subtitle: "Premium Add-ons", buttonText: "Explore", targetUrl: "/shop?category=accessories", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 3, title: "MENS FASHION", subtitle: "Apparel & More", buttonText: "Shop Men's", targetUrl: "/shop?category=mens-fashion", imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 4, title: "EARBUDS", subtitle: "Wireless Audio", buttonText: "Discover", targetUrl: "/shop?category=earbuds", imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 5, title: "SMARTPHONES", subtitle: "Latest Tech", buttonText: "Shop Phones", targetUrl: "/shop?category=smartphones", imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 6, title: "WOMENS FASHION", subtitle: "Trendy Styles", buttonText: "Browse", targetUrl: "/shop?category=womens-fashion", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 7, title: "FURNITURE", subtitle: "Office & Home", buttonText: "New Arrivals", targetUrl: "/shop?category=furniture", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 8, title: "HOME LIFESTYLE", subtitle: "Decor & More", buttonText: "View Collection", targetUrl: "/shop?category=home-lifestyle", imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600&h=600" }
];

export async function PremiumBentoCategories() {
  let collections: any[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/business-collections`, { next: { revalidate: 60 } });
    if (res.ok) {
      collections = await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch business collections:', error);
  }

  // Merge fetched data with layout configuration. Use fallback data if DB data is missing for a slot.
  const cards = layoutConfig.map(config => {
    const fetchedData = collections.find(c => c.position === config.position);
    const fallback = fallbackData.find(f => f.position === config.position)!;

    return {
      ...config,
      title: fetchedData?.title || fallback.title,
      subtitle: fetchedData?.subtitle || fallback.subtitle,
      buttonText: fetchedData?.buttonText || fallback.buttonText,
      targetUrl: fetchedData?.targetUrl || fallback.targetUrl,
      imageUrl: fetchedData?.imageUrl || fallback.imageUrl,
    };
  });

  return (
    <section id="categories" className="py-8 md:py-12 bg-muted">
      <div className="container mx-auto px-4">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight uppercase">
              Business Collections
            </h2>
            <p className="text-muted-foreground mt-1 font-medium text-sm">Curated office goods & supplies for the modern workplace</p>
          </div>
          <Link href="/shop" className="hidden md:inline-flex items-center justify-center px-5 py-2 border-2 border-gray-900 rounded-full text-sm font-bold text-foreground hover:bg-primary hover:text-white transition-colors">
            View All
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 auto-rows-[200px] md:auto-rows-[180px]">
          {cards.map(card => (
            <BentoCard
              key={card.position}
              title={card.title}
              subtitle={card.subtitle}
              buttonText={card.buttonText}
              imageUrl={card.imageUrl}
              href={card.targetUrl}
              className={card.className}
              imageClassName={card.imageClassName}
              isLarge={card.isLarge}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
