import React from 'react';
import { ArrowRight } from "lucide-react";

const features = [
  { id: 1, text: 'Fast Delivery', icon: '🚀' },
  { id: 2, text: 'Secure Payments', icon: '🔒' },
  { id: 3, text: '24/7 Support', icon: '🎧' },
  { id: 4, text: 'Quality Assured', icon: '⭐' },
  { id: 5, text: 'Easy Returns', icon: '🔄' },
  { id: 6, text: 'Corporate Deals', icon: '💼' },
  { id: 7, text: 'Fast Delivery', icon: '🚀' },
  { id: 8, text: 'Secure Payments', icon: '🔒' },
];

export const WhyChooseUsMarquee = () => {
  return (
    <section className="py-6 bg-white border-b border-border overflow-hidden">
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scrollLeft 15s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
        .marquee-mask {
          mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%);
          -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%);
        }
      `}</style>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center w-full relative gap-6">
          
          {/* Badge / Button on the left */}
          <div className="w-full md:w-auto bg-primary-50 text-primary-700 py-2.5 px-6 rounded-full font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap z-10 shrink-0 group cursor-pointer transition-colors hover:bg-primary-100">
            <span>Why Choose Smart24</span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </div>

          {/* Marquee Content */}
          <div className="flex-1 overflow-hidden relative w-full marquee-mask">
            <div className="flex gap-10 pr-8 animate-scroll-left">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2.5 whitespace-nowrap text-[15px] font-medium text-muted-foreground cursor-default hover:text-primary/90 transition-colors">
                  <span className="text-[18px]">{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
              {/* Duplicate for infinite scroll */}
              {features.map((feature) => (
                <div key={`${feature.id}-dup`} className="flex items-center gap-2.5 whitespace-nowrap text-[15px] font-medium text-muted-foreground cursor-default hover:text-primary/90 transition-colors">
                  <span className="text-[18px]">{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
