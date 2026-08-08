'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Repeat, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/context/AuthContext';

const DEFAULT_PACKAGES = [
  { 
    id: 1, 
    name: "Basic Office Supplies", 
    desc: "A monthly refill of essential office items like paper, pens, and notepads.",
    includes: ["Printer Paper A4 (x10)", "Ballpoint Pens Box (x5)"],
    price: "৳5000", 
    period: "/ month", 
  },
  { 
    id: 2, 
    name: "Premium Pantry Box", 
    desc: "Keep your team energized with a monthly supply of premium coffee, tea, and snacks.",
    includes: ["Premium Coffee Beans (x2)", "Assorted Tea Bags (x4)"],
    price: "৳12000", 
    period: "/ month", 
  },
  { 
    id: 3, 
    name: "Executive Tech Refresh", 
    desc: "Quarterly/Monthly tech accessories and premium lifestyle items for executives.",
    includes: ["Ergonomic Mouse (x1)", "Premium Notebook (x2)"],
    price: "৳25000", 
    period: "/ month", 
  },
  // Duplicates for seamless infinite marquee scroll
  { 
    id: 4, 
    name: "Basic Office Supplies", 
    desc: "A monthly refill of essential office items like paper, pens, and notepads.",
    includes: ["Printer Paper A4 (x10)", "Ballpoint Pens Box (x5)"],
    price: "৳5000", 
    period: "/ month", 
  },
  { 
    id: 5, 
    name: "Premium Pantry Box", 
    desc: "Keep your team energized with a monthly supply of premium coffee, tea, and snacks.",
    includes: ["Premium Coffee Beans (x2)", "Assorted Tea Bags (x4)"],
    price: "৳12000", 
    period: "/ month", 
  },
  { 
    id: 6, 
    name: "Executive Tech Refresh", 
    desc: "Quarterly/Monthly tech accessories and premium lifestyle items for executives.",
    includes: ["Ergonomic Mouse (x1)", "Premium Notebook (x2)"],
    price: "৳25000", 
    period: "/ month", 
  }
];

export const SubscriptionAd = () => {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await apiClient.get('/subscriptions/plans');
        const activePlans = (response.data?.data || response.data)?.filter((p: any) => p.isActive);
        
        if (activePlans && activePlans.length > 0) {
          const dbPackages = activePlans.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            desc: plan.description || "Premium business subscription package.",
            includes: plan.items?.length > 0 
              ? plan.items.map((item: any) => `${item.product?.name || 'Included Item'} (x${item.quantity})`) 
              : ["Premium Assorted Items"],
            price: `৳${plan.price}`,
            period: "/ month",
          }));
          
          // Ensure we have a decent number of packages to fill the screen
          let basePackages = [...dbPackages];
          while (basePackages.length < 4) {
            basePackages = [...basePackages, ...dbPackages];
          }
          // Duplicate exactly once for the perfect infinite scroll (two identical halves)
          const displayPackages = [...basePackages, ...basePackages];
          
          setPackages(displayPackages);
        }
      } catch (error) {
        console.error("Failed to fetch subscription packages:", error);
      }
    };

    fetchPackages();
  }, []);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-indigo-500/10 shadow-2xl flex flex-col xl:flex-row items-stretch">
        
        {/* Left Side: Deep Colorful Premium */}
        <div className="relative w-full xl:w-[35%] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 md:p-12 flex flex-col justify-center shrink-0 border-r border-indigo-500/20">
          {/* Subtle background noise/texture */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[9px] font-bold tracking-[0.2em] text-indigo-300 uppercase mb-6">
              <Repeat className="w-3 h-3" />
              <span>Smart24 Auto-Refill</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif italic tracking-tight mb-4 text-white drop-shadow-sm">
              Easy Restocking
            </h3>
            <p className="text-indigo-200/80 text-sm mb-10 leading-relaxed font-light max-w-sm">
              Get your office supplies delivered automatically with special business prices. A simple process made for modern companies.
            </p>
            
            <Link href="/subscriptions">
              <Button variant="outline" className="text-indigo-300 hover:bg-indigo-500 hover:border-indigo-500 hover:text-white border-indigo-400/30 font-medium rounded-none h-12 px-8 text-xs transition-all duration-300 group w-full sm:w-auto uppercase tracking-widest bg-transparent">
                Explore Plans
                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side: Minimalist Marquee */}
        <div className="relative w-full xl:w-[65%] bg-slate-950 py-12 flex items-center overflow-hidden min-h-[400px]">
          
          {/* Gradient masks for smooth fading on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 xl:w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 xl:w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
          
          {/* Animated Marquee */}
          <div className="flex items-center w-full">
            <motion.div 
              className="flex items-stretch w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              {packages.map((pkg: any, idx: number) => (
                <div key={`${pkg.id}-${idx}`} className="flex-shrink-0 pr-6">
                  <div 
                    className="w-[280px] md:w-[320px] h-full bg-indigo-950/30 border border-indigo-500/10 flex flex-col p-8 hover:border-indigo-400/30 hover:bg-indigo-900/20 transition-all duration-500 group relative"
                  >
                    <div className="relative z-10 flex-grow">
                      <h4 className="text-lg font-medium text-indigo-50 mb-3 tracking-wide">{pkg.name}</h4>
                      <p className="text-xs text-indigo-200/60 mb-8 leading-relaxed font-light line-clamp-3">{pkg.desc}</p>
                      
                      <div className="mb-6">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-indigo-400/70 mb-4 font-bold">Includes</p>
                        <ul className="space-y-3">
                          {pkg.includes.map((item: string, i: number) => (
                            <li key={i} className="text-xs text-indigo-100/70 flex items-start gap-3 font-light">
                              <span className="text-indigo-600/60 mt-1.5 h-[1px] w-3 bg-indigo-600/60 shrink-0"></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-auto pt-6 border-t border-indigo-500/10">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-light text-white tracking-tight">{pkg.price}</span>
                        <span className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-[0.2em]">{pkg.period}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
