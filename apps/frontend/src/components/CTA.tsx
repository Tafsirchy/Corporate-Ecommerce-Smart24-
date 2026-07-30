'use client';
import Link from 'next/link';
import { ArrowRight, Building2, PhoneCall } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"></div>
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-xl">
            <Building2 size={32} className="text-white" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Ready to streamline your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
              office supplies?
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Join hundreds of forward-thinking companies saving time, reducing costs, and automating their supply chain with Smart24.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup"
              className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto text-base font-bold rounded-xl text-slate-900 bg-white hover:bg-muted transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:-translate-y-1"
            >
              Create Business Account
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/contact"
              className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto text-base font-bold rounded-xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <PhoneCall size={20} className="opacity-80 group-hover:opacity-100" />
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
