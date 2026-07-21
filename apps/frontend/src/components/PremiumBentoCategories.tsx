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
      className={`group relative overflow-hidden rounded-[24px] bg-[#f0f0f0] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col p-5 md:p-6 ${className}`}
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
          <img 
            src={imageUrl} 
            alt={typeof title === 'string' ? title : subtitle}
            className={`object-contain transition-transform duration-700 group-hover:scale-105 mix-blend-multiply ${imageClassName}`}
          />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-20 flex flex-col h-full ${isLarge ? 'text-white' : 'text-gray-900'} w-full`}>
        <h3 className={`font-bold tracking-tight leading-none mb-1 ${isLarge ? 'text-3xl md:text-4xl lg:text-5xl max-w-[80%]' : 'text-xl lg:text-2xl uppercase max-w-[70%]'}`}>
          {title}
        </h3>
        <p className={`font-medium mb-auto mt-1 ${isLarge ? 'text-xs md:text-sm text-gray-200 tracking-wider uppercase mb-3 order-first' : 'text-xs text-gray-600'}`}>
          {subtitle}
        </p>

        <div className={`mt-auto pt-6`}>
          <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            isLarge 
              ? 'bg-white text-black hover:bg-gray-100' 
              : 'bg-transparent border border-gray-900 text-gray-900 group-hover:bg-gray-900 group-hover:text-white'
          }`}>
            {buttonText}
          </span>
        </div>
      </div>
    </Link>
  );
};

export const PremiumBentoCategories = () => {
  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
              Corporate Collections
            </h2>
            <p className="text-gray-500 mt-1 font-medium text-sm">Curated office goods & supplies for the modern workplace</p>
          </div>
          <Link href="/shop" className="hidden md:inline-flex items-center justify-center px-5 py-2 border-2 border-gray-900 rounded-full text-sm font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
            View All
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 auto-rows-[180px]">
          
          {/* Card A: 2x2 Large */}
          <BentoCard
            title={<>Elevate your<br/>workspace.</>}
            subtitle="SPRING COLLECTION 2024"
            buttonText="Shop Now"
            imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
            href="/shop/office-setup"
            className="md:col-span-2 md:row-span-2"
            isLarge={true}
          />

          {/* Card B: 1x1 Top Right */}
          <BentoCard
            title="SMART DEVICES"
            subtitle="Connected Living"
            buttonText="Explore"
            imageUrl="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2000&auto=format&fit=crop&bg=ffffff"
            href="/shop/smart-devices"
            imageClassName="w-3/4 h-3/4 object-right-bottom"
          />

          {/* Card C: 1x2 Middle Right */}
          <BentoCard
            title="FURNITURE"
            subtitle="Timeless Pieces"
            buttonText="Shop Sofa"
            imageUrl="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2000&auto=format&fit=crop&bg=ffffff"
            href="/shop/furniture"
            className="md:col-start-2 lg:col-start-3 md:row-start-3 lg:row-start-2 md:row-span-2 lg:row-span-2"
            imageClassName="w-[90%] h-[70%] object-bottom pb-2"
          />

          {/* Card D: 1x1 */}
          <BentoCard
            title="DESIGN LAMPS"
            subtitle="Stylish pendant"
            buttonText="Discover"
            imageUrl="https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?q=80&w=2000&auto=format&fit=crop&bg=ffffff"
            href="/shop/lighting"
            className="lg:col-start-1 lg:row-start-3"
            imageClassName="w-2/3 h-2/3 object-right-bottom mb-2"
          />

          {/* Card E: 1x1 */}
          <BentoCard
            title="PREMIUM TECH"
            subtitle="Noise-canceling"
            buttonText="Shop Audio"
            imageUrl="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=2000&auto=format&fit=crop&bg=ffffff"
            href="/shop/audio"
            className="lg:col-start-2 lg:row-start-3"
            imageClassName="w-2/3 h-2/3 object-right-bottom"
          />

          {/* Card F: 1x1 */}
          <BentoCard
            title="PANTRY WARE"
            subtitle="Quality essentials"
            buttonText="Browse"
            imageUrl="https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2000&auto=format&fit=crop&bg=ffffff"
            href="/shop/pantry"
            className="lg:col-start-1 lg:row-start-4"
            imageClassName="w-2/3 h-2/3 object-right-bottom"
          />

          {/* Card G: 1x1 */}
          <BentoCard
            title="APPAREL"
            subtitle="Quality linen shirt"
            buttonText="New Arrivals"
            imageUrl="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2000&auto=format&fit=crop&bg=ffffff"
            href="/shop/apparel"
            className="lg:col-start-2 lg:row-start-4"
            imageClassName="w-2/3 h-2/3 object-right-bottom"
          />

          {/* Card H: 1x1 */}
          <BentoCard
            title="HOME DECOR"
            subtitle="Premium lifestyle"
            buttonText="View Collection"
            imageUrl="https://images.unsplash.com/photo-1600164318353-847e0bc27833?q=80&w=2000&auto=format&fit=crop&bg=ffffff"
            href="/shop/decor"
            className="lg:col-start-3 lg:row-start-4"
            imageClassName="w-3/4 h-3/4 object-right-bottom"
          />

        </div>
      </div>
    </section>
  );
};
