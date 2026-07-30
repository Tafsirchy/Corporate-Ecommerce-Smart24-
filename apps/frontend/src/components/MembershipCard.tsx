'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Fingerprint, Crown, Shield, Star, Award, Zap, Diamond, Hexagon, Gem, Sparkles } from 'lucide-react';

interface MembershipCardProps {
  level: {
    id: string;
    name: string;
    requiredAmount: number;
    pointMultiplier: number;
    priority: number;
    benefits: string[];
  };
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  isCurrentTier?: boolean;
}

export const MembershipCard = ({ 
  level, 
  userName = "ERIC SMITH", 
  userEmail = "ericsmith@member.com", 
  userPhone = "+65 2558 2114 25",
  isCurrentTier = false 
}: MembershipCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const glareX = useTransform(mouseX, [-0.5, 0.5], ["-20%", "120%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["-20%", "120%"]);
  
  // For Signature Elite dynamic gold reflection
  const goldGlareOpacity = useTransform(mouseX, [-0.5, 0, 0.5], [0.3, 0.8, 0.3]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = (mouseXPos / width) - 0.5;
    const yPct = (mouseYPos / height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  // ==========================================
  // SIGNATURE ELITE UNIQUE DESIGN (ULTRA PREMIUM)
  // ==========================================
  if (level.name.toLowerCase().includes('signature elite')) {
    return (
      <div 
        className="relative w-full h-[230px] md:h-[250px] perspective-1200 group font-sans"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped(!isFlipped)} 
      >
        <style dangerouslySetInnerHTML={{__html: `
          .elite-spin-border {
            background: conic-gradient(from 0deg, transparent 0%, transparent 290deg, #ffdc73 330deg, #ffffff 360deg);
            animation: spin-border 4s linear infinite;
          }
          @keyframes spin-border {
            100% { transform: rotate(360deg); }
          }
          .elite-core {
            background: linear-gradient(135deg, #050505 0%, #111 50%, #000 100%);
            box-shadow: inset 0 0 40px rgba(0,0,0,0.8);
          }
          .damascus-overlay {
            background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 4px),
                              repeating-linear-gradient(-45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 4px);
            opacity: 0.3;
          }
          .holo-gold-text {
            background: linear-gradient(90deg, #aa771c 0%, #fcf6ba 25%, #d4af37 50%, #fbf5b7 75%, #aa771c 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            color: transparent;
            animation: holo-shine 4s linear infinite;
            filter: drop-shadow(0 5px 10px rgba(0,0,0,0.8));
          }
          @keyframes holo-shine {
            to { background-position: 200% center; }
          }
        `}} />

        <motion.div
          className="w-full h-full relative preserve-3d cursor-pointer shadow-[0_30px_60px_rgba(0,0,0,0.9)] rounded-xl"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          style={{ 
            rotateX: isHovered && !isFlipped ? rotateX : 0, 
            rotateY: isHovered && !isFlipped ? rotateY : (isFlipped ? 180 : 0) 
          }}
          transition={{ 
            rotateY: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 },
            rotateX: { type: "spring", stiffness: 300, damping: 30 }
          }}
        >
          {/* ======================= FRONT (SIGNATURE ELITE) ======================= */}
          <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden bg-[#111]">
            
            {/* Spinning Gold Light Edge */}
            <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 elite-spin-border"></div>
            
            {/* Inner Matte Core */}
            <div className="absolute inset-[2px] rounded-[10px] elite-core overflow-hidden preserve-3d z-10 flex flex-col items-center justify-center">
              
              <div className="absolute inset-0 damascus-overlay"></div>
              
              {/* Dynamic Glare */}
              <motion.div 
                 className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 z-20"
                 style={{
                   background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.8) 0%, transparent 50%)`
                 }}
              />

              {/* 3D PARALLAX ELEMENTS */}
              {/* Floating Base Graphic */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
                style={{ transform: "translateZ(20px)" }}
              >
                 <Gem className="w-64 h-64 text-[#d4af37]" strokeWidth={0.2} />
              </div>

              {/* Top Details - Floating */}
              <div 
                className="absolute top-6 w-full px-8 flex justify-between items-start"
                style={{ transform: "translateZ(40px)" }}
              >
                 <div className="flex flex-col">
                    <span className="text-[7px] md:text-[8px] font-black tracking-[0.5em] uppercase text-[#d4af37]">Smart24</span>
                    <span className="text-[5px] md:text-[6px] tracking-[0.6em] text-white/50 uppercase mt-1">Invitation Only</span>
                 </div>
                 
                 {/* 24k Gold EMV Chip */}
                 <div className="w-10 h-8 rounded-md bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] border border-white/40 flex flex-col justify-evenly p-1 shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
                   <div className="w-full h-[0.5px] bg-black/40"></div>
                   <div className="w-full h-[0.5px] bg-black/40"></div>
                   <div className="w-4 h-4 border-[0.5px] border-black/40 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                 </div>
              </div>

              {/* Huge Holographic Signature - Maximum Parallax */}
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ transform: "translateZ(80px)" }}
              >
                 <h2 className="font-serif italic text-5xl md:text-6xl holo-gold-text font-black tracking-tighter -rotate-6 scale-110">
                   Signature Elite
                 </h2>
                 <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#fcf6ba] to-transparent mt-2 shadow-[0_0_15px_rgba(252,246,186,1)]"></div>
              </div>

              {/* Bottom Details - Floating */}
              <div 
                className="absolute bottom-6 w-full px-8 flex justify-between items-end"
                style={{ transform: "translateZ(40px)" }}
              >
                 <span className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                   {userName}
                 </span>
                 {isCurrentTier && (
                   <span className="text-[6px] border border-[#d4af37]/40 px-3 py-1 rounded-sm font-bold tracking-[0.3em] uppercase text-[#d4af37] bg-black/50 backdrop-blur-md">
                     <Sparkles className="w-2 h-2 inline mr-1" /> Active
                   </span>
                 )}
              </div>
              
            </div>
          </div>

          {/* ======================= BACK (SIGNATURE ELITE) ======================= */}
          <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden bg-[#111] [transform:rotateY(180deg)]">
            
            {/* Spinning Gold Light Edge for Back too */}
            <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 elite-spin-border"></div>
            
            <div className="absolute inset-[2px] rounded-[10px] elite-core flex flex-col z-10 preserve-3d">
              
              <div className="absolute inset-0 damascus-overlay"></div>
              
              {/* Pure Gold Magnetic Strip */}
              <div className="w-full h-12 mt-6 relative shadow-[0_10px_20px_rgba(0,0,0,0.8)]" style={{ transform: "translateZ(20px)" }}>
                 <div className="absolute inset-0 bg-gradient-to-r from-[#aa771c] via-[#fcf6ba] to-[#aa771c]"></div>
                 <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_4px)] opacity-30"></div>
              </div>

              <div className="relative z-10 w-full flex-1 p-6 md:p-8 flex flex-col justify-between" style={{ transform: "translateZ(40px)" }}>
                
                <div className="flex justify-between items-start pt-2">
                   <div>
                     <h3 className="text-base font-bold tracking-[0.3em] uppercase text-[#d4af37] drop-shadow-lg">
                       {userName}
                     </h3>
                     <div className="w-8 h-[1px] bg-[#d4af37]/40 my-2"></div>
                     <p className="text-[8px] font-mono tracking-widest text-zinc-400 mt-1">{userEmail}</p>
                     <p className="text-[8px] font-mono tracking-widest text-zinc-400">{userPhone}</p>
                   </div>
                   
                   <div className="flex flex-col items-end gap-3">
                     <div className="text-right">
                       <p className="text-[6px] uppercase tracking-[0.4em] text-zinc-500 mb-0.5">Spend Target</p>
                       <p className="text-xs font-bold tracking-widest text-[#d4af37]">৳{level.requiredAmount.toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[6px] uppercase tracking-[0.4em] text-zinc-500 mb-0.5">Multiplier</p>
                       <p className="text-xs font-bold tracking-widest text-[#d4af37]">{level.pointMultiplier}X</p>
                     </div>
                   </div>
                </div>

                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 -rotate-6 opacity-60">
                   <span className="font-serif italic text-3xl holo-gold-text">Smart24</span>
                </div>

                <div className="mt-auto w-full text-center">
                  <p className="text-[5px] uppercase tracking-[0.5em] text-zinc-600">
                    Property of Smart24 Enterprise • Centurion Class
                  </p>
                </div>
              </div>

            </div>
          </div>

        </motion.div>
      </div>
    );
  }

  // ==========================================
  // STANDARD METALLIC DESIGN (Bronze -> Diamond)
  // ==========================================
  const getMetalTheme = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('bronze')) return {
      bg: 'from-[#b36d4b] via-[#e2a07c] to-[#7a4226]',
      foil: 'from-[#ffd5b8] via-[#ffffff] to-[#ffd5b8]',
      text: 'text-[#3d1c04]',
      engrave: 'text-shadow-light-metal',
      chip: 'bg-[#d68e65] border-[#a96240]',
    };
    if (n.includes('silver')) return {
      bg: 'from-[#c2c2c2] via-[#f0f0f0] to-[#8c8c8c]',
      foil: 'from-[#ffffff] via-[#f0f0f0] to-[#ffffff]',
      text: 'text-[#222222]',
      engrave: 'text-shadow-light-metal',
      chip: 'bg-[#e8e8e8] border-[#8c8c8c]',
    };
    if (n.includes('gold')) return {
      bg: 'from-[#c59b27] via-[#ffe347] to-[#8b6508]',
      foil: 'from-[#fff5a8] via-[#ffffff] to-[#fff5a8]',
      text: 'text-[#3e2b00]',
      engrave: 'text-shadow-light-metal',
      chip: 'bg-[#ffe347] border-[#c59b27]',
    };
    if (n.includes('platinum')) return {
      bg: 'from-[#dcdfe0] via-[#ffffff] to-[#a3a6a8]',
      foil: 'from-[#ffffff] via-[#e8f0f2] to-[#ffffff]',
      text: 'text-[#1a1a1a]',
      engrave: 'text-shadow-light-metal',
      chip: 'bg-[#ffffff] border-[#a3a6a8]',
    };
    if (n.includes('diamond')) return {
      bg: 'from-[#1a252f] via-[#2c3e50] to-[#0d131a]',
      foil: 'from-[#7fb3d5] via-[#ffffff] to-[#7fb3d5]',
      text: 'text-[#e0eaf5]',
      engrave: 'text-shadow-dark-metal',
      chip: 'bg-[#34495e] border-[#1c2833]',
    };
    
    return {
      bg: 'from-[#c59b27] via-[#ffe347] to-[#8b6508]',
      foil: 'from-[#fff5a8] via-[#ffffff] to-[#fff5a8]',
      text: 'text-[#3e2b00]',
      engrave: 'text-shadow-light-metal',
      chip: 'bg-[#ffe347] border-[#c59b27]',
    };
  };

  const getTierIcon = (name: string, className: string) => {
    const n = name.toLowerCase();
    const stroke = 0.5;
    if (n.includes('bronze')) return <Award className={className} strokeWidth={stroke} />;
    if (n.includes('silver')) return <Shield className={className} strokeWidth={stroke} />;
    if (n.includes('gold')) return <Star className={className} strokeWidth={stroke} />;
    if (n.includes('platinum')) return <Zap className={className} strokeWidth={stroke} />;
    if (n.includes('diamond')) return <Diamond className={className} strokeWidth={stroke} />;
    return <Crown className={className} strokeWidth={stroke} />;
  };

  const theme = getMetalTheme(level.name);
  const isDarkMetal = level.name.toLowerCase().includes('diamond');

  if (!mounted) return null;

  return (
    <div 
      className="relative w-full h-[230px] md:h-[250px] perspective-1200 group font-sans"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)} 
    >
      <style dangerouslySetInnerHTML={{__html: `
        .text-shadow-light-metal {
          text-shadow: 1px 1px 0px rgba(255,255,255,0.8), -1px -1px 0px rgba(0,0,0,0.3);
        }
        .text-shadow-dark-metal {
          text-shadow: 1px 1px 0px rgba(0,0,0,0.9), -1px -1px 0px rgba(255,255,255,0.15);
        }
        .icon-shadow-light {
          filter: drop-shadow(1px 1px 0px rgba(255,255,255,0.6)) drop-shadow(-1px -1px 0px rgba(0,0,0,0.2));
        }
        .icon-shadow-dark {
          filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.8)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.1));
        }
        .brushed-metal-texture {
          background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px),
                            repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 3px);
        }
        .foil-text {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
      `}} />

      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer shadow-2xl rounded-xl"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{ 
          rotateX: isHovered && !isFlipped ? rotateX : 0, 
          rotateY: isHovered && !isFlipped ? rotateY : (isFlipped ? 180 : 0) 
        }}
        transition={{ 
          rotateY: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 },
          rotateX: { type: "spring", stiffness: 300, damping: 30 }
        }}
      >
        {/* FRONT */}
        <div className={`absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br ${theme.bg} overflow-hidden border ${isDarkMetal ? 'border-white/10' : 'border-black/20'} shadow-[inset_0_0_15px_rgba(0,0,0,0.2)]`}>
          <div className="absolute inset-0 brushed-metal-texture mix-blend-overlay"></div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transform scale-110">
            <div className={`relative flex items-center justify-center opacity-[0.15] ${isDarkMetal ? 'icon-shadow-dark' : 'icon-shadow-light'}`}>
               <div className={`absolute w-44 h-44 md:w-56 md:h-56 rounded-full border-[0.5px] ${theme.text}`}></div>
               <div className={`absolute w-36 h-36 md:w-48 md:h-48 rounded-full border-[0.5px] border-dashed ${theme.text}`}></div>
               <Hexagon className={`absolute w-24 h-24 md:w-32 md:h-32 ${theme.text}`} strokeWidth={0.5} />
               {getTierIcon(level.name, `w-14 h-14 md:w-20 md:h-20 ${theme.text}`)}
            </div>
          </div>
          
          <motion.div 
             className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60"
             style={{
               background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.8) 0%, transparent 60%)`
             }}
          />

          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hexagons" width="20" height="34.64" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
                  <path d="M20 0L10 5.77L0 0M10 5.77V17.32M0 34.64L10 28.87L20 34.64M10 28.87V17.32M0 17.32L10 11.55L20 17.32" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)" className={isDarkMetal ? "text-white" : "text-black"} />
            </svg>
          </div>

          <div className="relative z-10 w-full h-full p-6 md:p-8 flex flex-col">
            <div className="flex justify-between items-start w-full">
               <div className="flex items-center gap-2">
                 <Fingerprint className={`w-8 h-8 ${theme.text} ${theme.engrave} opacity-80`} strokeWidth={1} />
                 <div className="flex flex-col">
                    <span className={`text-xl md:text-2xl font-black tracking-[0.3em] uppercase bg-gradient-to-r ${theme.foil} foil-text drop-shadow-sm`}>
                      SMART24
                    </span>
                    <span className={`text-[6px] md:text-[7px] font-bold tracking-[0.4em] uppercase ${theme.text} opacity-80 mt-0.5`}>
                      Business Member
                    </span>
                 </div>
               </div>

               {isCurrentTier && (
                 <div className={`px-2 py-0.5 border ${theme.text} border-opacity-30 rounded-sm`}>
                   <span className={`text-[7px] font-bold tracking-widest uppercase ${theme.text} ${theme.engrave}`}>
                     Active
                   </span>
                 </div>
               )}
            </div>

            <div className="mt-8 mb-auto">
               <div className={`w-12 h-10 rounded-md ${theme.chip} border-2 opacity-90 flex flex-col justify-evenly p-1 shadow-inner relative overflow-hidden`}>
                 <div className="w-full h-[1px] bg-black/20 absolute top-1/3 left-0"></div>
                 <div className="w-full h-[1px] bg-black/20 absolute bottom-1/3 left-0"></div>
                 <div className="w-[1px] h-full bg-black/20 absolute top-0 left-1/3"></div>
                 <div className="w-[1px] h-full bg-black/20 absolute top-0 right-1/3"></div>
               </div>
            </div>

            <div className="flex flex-col items-end w-full">
               <span className={`text-2xl md:text-3xl font-black tracking-[0.2em] uppercase ${theme.text} ${theme.engrave} transform scale-y-110`}>
                 {level.name}
               </span>
               <div className={`h-[1px] w-24 bg-gradient-to-l from-transparent via-current to-transparent opacity-50 mt-1 ${theme.text}`}></div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className={`absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-tl ${theme.bg} overflow-hidden border ${isDarkMetal ? 'border-white/10' : 'border-black/20'} shadow-[inset_0_0_15px_rgba(0,0,0,0.2)] [transform:rotateY(180deg)] flex flex-col`}>
          <div className="absolute inset-0 brushed-metal-texture mix-blend-overlay"></div>
          <div className={`w-full h-12 mt-6 ${isDarkMetal ? 'bg-black/80' : 'bg-[#1a1a1a]'} border-y border-white/5 shadow-inner`}></div>

          <div className="relative z-10 w-full flex-1 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start pt-2">
               <div>
                 <h3 className={`text-base md:text-lg font-bold tracking-[0.3em] uppercase ${theme.text} ${theme.engrave}`}>
                   {userName}
                 </h3>
                 <p className={`text-[8px] md:text-[9px] font-mono tracking-widest ${theme.text} opacity-80 mt-1`}>{userEmail}</p>
                 <p className={`text-[8px] md:text-[9px] font-mono tracking-widest ${theme.text} opacity-80`}>{userPhone}</p>
               </div>
               <div className="flex flex-col items-end gap-2">
                 <div className="text-right">
                   <p className={`text-[6px] uppercase tracking-[0.3em] ${theme.text} opacity-60 mb-0.5`}>Spend Target</p>
                   <p className={`text-xs font-bold tracking-widest ${theme.text} ${theme.engrave}`}>৳{level.requiredAmount.toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                   <p className={`text-[6px] uppercase tracking-[0.3em] ${theme.text} opacity-60 mb-0.5`}>Multiplier</p>
                   <p className={`text-xs font-bold tracking-widest ${theme.text} ${theme.engrave}`}>{level.pointMultiplier}X</p>
                 </div>
               </div>
            </div>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 -rotate-6 opacity-70">
               <span className={`font-serif italic text-4xl bg-gradient-to-r ${theme.foil} foil-text drop-shadow-md`}>Smart24</span>
            </div>

            <div className="mt-auto w-full text-center">
              <p className={`text-[6px] uppercase tracking-[0.3em] ${theme.text} opacity-50`}>
                Property of Smart24 Enterprise • Click to Flip
              </p>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
