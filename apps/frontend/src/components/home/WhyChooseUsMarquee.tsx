'use client';
import React, { useEffect, useState } from 'react';
import { ArrowRight } from "lucide-react";
import { apiClient } from '@/context/AuthContext';
import {
  DEFAULT_WHY_CHOOSE_CONFIG,
  WhyChooseConfig,
  parseSettingJson,
} from '@/lib/home-settings';

export const WhyChooseUsMarquee = () => {
  const [config, setConfig] = useState<WhyChooseConfig>(DEFAULT_WHY_CHOOSE_CONFIG);

  useEffect(() => {
    apiClient
      .get('/settings/home_why_choose', { cache: false })
      .then((res) => {
        if (res.data?.value) {
          setConfig(parseSettingJson(res.data.value, DEFAULT_WHY_CHOOSE_CONFIG));
        }
      })
      .catch(() => {});
  }, []);

  const activeFeatures = (config.features || []).filter((f) => f.isActive);
  if (activeFeatures.length === 0) return null;

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
          <div className="w-full md:w-auto bg-primary-50 text-primary-700 py-3 sm:py-2.5 px-6 rounded-full font-bold text-sm sm:text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap z-10 shrink-0 group cursor-pointer transition-all active:scale-95 hover:bg-primary-100">
            <span>{config.badgeText}</span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </div>

          {/* Marquee Content */}
          <div className="flex-1 overflow-hidden relative w-full marquee-mask">
            <div className="flex gap-10 pr-8 animate-scroll-left">
              {activeFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2.5 whitespace-nowrap text-base font-medium text-muted-foreground cursor-default hover:text-primary/90 transition-colors">
                  <span className="text-[18px]">{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
              {/* Duplicate for infinite scroll */}
              {activeFeatures.map((feature) => (
                <div key={`${feature.id}-dup`} className="flex items-center gap-2.5 whitespace-nowrap text-base font-medium text-muted-foreground cursor-default hover:text-primary/90 transition-colors">
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
