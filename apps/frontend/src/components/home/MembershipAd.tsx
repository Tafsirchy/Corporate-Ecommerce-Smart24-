'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/context/AuthContext';
import { MembershipCard } from '@/components/MembershipCard';

const DEFAULT_MEMBERSHIPS = [
  { id: '1', name: 'Platinum', requiredAmount: 100000, pointMultiplier: 1.5, priority: 4, benefits: [] },
  { id: '2', name: 'Diamond', requiredAmount: 500000, pointMultiplier: 2.0, priority: 5, benefits: [] },
  { id: '3', name: 'Signature Elite', requiredAmount: 1000000, pointMultiplier: 3.0, priority: 6, benefits: [] }
];

export const MembershipAd = () => {
  const [memberships, setMemberships] = useState(DEFAULT_MEMBERSHIPS);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await apiClient.get('/memberships');
        const dataList = response.data?.data || response.data;
        if (dataList && dataList.length > 0) {
          // Sort by requiredAmount desc to get the top tiers
          const topTiers = [...dataList].sort((a: any, b: any) => b.requiredAmount - a.requiredAmount).slice(0, 3);
          if (topTiers.length === 3) {
             setMemberships(topTiers);
          } else {
             // Fallback to default if there aren't at least 3 tiers
             setMemberships(DEFAULT_MEMBERSHIPS);
          }
        }
      } catch (error) {
        console.error("Failed to fetch memberships:", error);
      }
    };
    fetchMemberships();
  }, []);

  return (
    <section className="container mx-auto px-4 py-4 overflow-hidden">
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/10 shadow-2xl">
        
        {/* Golden Mesh Gradient Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[150%] rounded-full bg-gradient-to-b from-amber-500/20 to-orange-600/5 blur-[120px] mix-blend-screen transform rotate-12"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[100%] rounded-full bg-gradient-to-t from-yellow-500/10 to-transparent blur-[100px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 grid lg:grid-cols-12 gap-6 items-center p-6 md:px-10 md:py-6">
          
          {/* Left Content Area (Col Span 6) */}
          <div className="lg:col-span-6 space-y-6 z-40 relative">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Smart24 Elite Membership</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-500 leading-tight tracking-tight"
            >
              Elevate your business purchasing power.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base text-zinc-400 max-w-lg leading-relaxed"
            >
              Upgrade to Smart24 Elite. Unlock wholesale enterprise pricing, 24/7 priority support, and a dedicated account manager for your business.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Link href="/membership">
                <Button className="w-full sm:w-auto h-12 px-6 border-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1">
                  View Benefits
                </Button>
              </Link>
              <Link href="/membership/upgrade">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white font-bold text-sm transition-all hover:-translate-y-1 group">
                  Upgrade to Elite
                  <ChevronRight className="w-4 h-4 ml-1 text-zinc-400 group-hover:text-white transition-colors" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Visual Area (Col Span 6) - Stacked Cards */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[250px] md:min-h-[280px] mt-8 lg:mt-0">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px]"></div>
            
            {/* The Stacked Layout Container */}
            <div className="relative w-full max-w-[320px] h-[250px] md:h-[280px] flex items-center justify-center">
               
               {/* 3rd Card (Lowest, Top-Left) */}
               <motion.div 
                 initial={{ opacity: 0, x: -60, y: -40 }}
                 whileInView={{ opacity: 0.6, x: -40, y: -30 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 className="absolute z-10 w-64 md:w-72 transform scale-90"
               >
                  <div className="pointer-events-none brightness-75 blur-[1px]">
                     <MembershipCard level={memberships[2]} />
                  </div>
               </motion.div>

               {/* 2nd Card (Middle) */}
               <motion.div 
                 initial={{ opacity: 0, x: -30, y: -20 }}
                 whileInView={{ opacity: 0.9, x: -10, y: -10 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                 className="absolute z-20 w-64 md:w-72 transform scale-95 shadow-[0_15px_40px_rgba(0,0,0,0.6)] rounded-2xl"
               >
                  <div className="pointer-events-none brightness-90">
                     <MembershipCard level={memberships[1]} />
                  </div>
               </motion.div>

               {/* 1st Card (Top, Bottom-Right) */}
               <motion.div 
                 initial={{ opacity: 0, x: 0, y: 0 }}
                 whileInView={{ opacity: 1, x: 20, y: 10 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                 className="absolute z-30 w-64 md:w-72 shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-2xl"
               >
                  <div className="relative group hover:scale-105 transition-transform duration-500">
                     <MembershipCard level={memberships[0]} />
                     {/* Floating Glow on Top Card */}
                     <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>
                  </div>
               </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
