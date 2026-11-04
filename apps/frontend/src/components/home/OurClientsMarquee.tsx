'use client';

import React from 'react';
import Link from 'next/link';

export interface ClientLogoItem {
  id?: string;
  name: string;
  slug?: string;
  logoUrl: string;
  websiteUrl?: string;
}

const DEFAULT_CLIENTS: ClientLogoItem[] = [
  {
    name: 'Grameenphone Ltd.',
    slug: 'grameenphone-ltd',
    logoUrl: '/clients/grameenphone.svg',
  },
  {
    name: 'BRAC Bank PLC',
    slug: 'brac-bank-plc',
    logoUrl: '/clients/brac-bank.svg',
  },
  {
    name: 'Square Pharmaceuticals Ltd.',
    slug: 'square-pharmaceuticals-ltd',
    logoUrl: '/clients/square.svg',
  },
  {
    name: 'Dhaka University',
    slug: 'dhaka-university',
    logoUrl: '/clients/dhaka-university.svg',
  },
  {
    name: 'Walton Hi-Tech Industries PLC',
    slug: 'walton-hi-tech-industries',
    logoUrl: '/clients/walton.svg',
  },
  {
    name: 'bKash Limited',
    slug: 'bkash-limited',
    logoUrl: '/clients/bkash.svg',
  },
  {
    name: 'Unilever Bangladesh',
    slug: 'unilever-bangladesh',
    logoUrl: '/clients/unilever.svg',
  },
  {
    name: 'Robi Axiata Limited',
    slug: 'robi-axiata-limited',
    logoUrl: '/clients/robi.svg',
  },
  {
    name: 'Beximco Group',
    slug: 'beximco-group',
    logoUrl: '/clients/beximco.svg',
  },
  {
    name: 'Standard Chartered Bangladesh',
    slug: 'standard-chartered-bangladesh',
    logoUrl: '/clients/standard-chartered.svg',
  },
];

interface OurClientsMarqueeProps {
  clients?: ClientLogoItem[];
}

export const OurClientsMarquee: React.FC<OurClientsMarqueeProps> = ({ clients }) => {
  // Use passed clients or fallback, ensuring valid logoUrls
  const displayClients =
    clients && clients.length > 0
      ? clients.map((c) => {
          let logo = c.logoUrl;
          if (!logo || logo.includes('wikimedia.org') || logo.includes('wikipedia.org')) {
            const fallback = DEFAULT_CLIENTS.find(
              (d) => d.slug === c.slug || d.name.toLowerCase() === c.name.toLowerCase()
            );
            if (fallback) logo = fallback.logoUrl;
          }
          return { ...c, logoUrl: logo || '/clients/grameenphone.svg' };
        })
      : DEFAULT_CLIENTS;

  return (
    <section className="py-8 sm:py-10 bg-white border-b border-gray-100 overflow-hidden select-none">
      <style>{`
        @keyframes clientMarqueeScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }
        .animate-client-marquee {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 1.5rem;
          animation: clientMarqueeScroll 32s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }
        @media (min-width: 640px) {
          .animate-client-marquee {
            gap: 2rem;
          }
        }
        .client-marquee-container:hover .animate-client-marquee {
          animation-play-state: paused;
        }
        .client-marquee-mask {
          mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%);
          -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%);
        }
      `}</style>

      {/* Header Label */}
      <div className="container mx-auto px-4 mb-5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100/80 text-gray-700 text-[11px] font-bold tracking-widest uppercase mb-1">
          <span>Our Corporate Clients</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Trusted by Bangladesh&apos;s leading enterprises, institutions, and growing businesses
        </p>
      </div>

      {/* Dual-Track GPU Accelerated Marquee: Zero Jitter / Pure 60fps Smooth */}
      <div className="w-full overflow-hidden relative client-marquee-mask client-marquee-container py-2 flex">
        {/* Track 1 */}
        <div className="animate-client-marquee pr-6 sm:pr-8">
          {displayClients.map((client, index) => (
            <Link
              key={`track1-${client.slug || index}`}
              href={client.slug ? `/clients/${client.slug}` : '/clients'}
              className="flex items-center justify-center h-16 sm:h-20 min-w-[160px] sm:min-w-[190px] px-6 sm:px-8 py-2.5 rounded-2xl bg-white hover:bg-gray-50/80 border border-gray-200/80 hover:border-gray-300 shadow-2xs hover:shadow-sm transition-all duration-300 group shrink-0 cursor-pointer"
              title={client.name}
            >
              <img
                src={client.logoUrl}
                alt={client.name}
                loading="eager"
                className="h-8 sm:h-10 md:h-11 w-auto max-w-[130px] sm:max-w-[160px] object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>

        {/* Track 2 (Identical mirror for infinite seamless glide) */}
        <div className="animate-client-marquee pr-6 sm:pr-8" aria-hidden="true">
          {displayClients.map((client, index) => (
            <Link
              key={`track2-${client.slug || index}`}
              href={client.slug ? `/clients/${client.slug}` : '/clients'}
              tabIndex={-1}
              className="flex items-center justify-center h-16 sm:h-20 min-w-[160px] sm:min-w-[190px] px-6 sm:px-8 py-2.5 rounded-2xl bg-white hover:bg-gray-50/80 border border-gray-200/80 hover:border-gray-300 shadow-2xs hover:shadow-sm transition-all duration-300 group shrink-0 cursor-pointer"
              title={client.name}
            >
              <img
                src={client.logoUrl}
                alt={client.name}
                loading="eager"
                className="h-8 sm:h-10 md:h-11 w-auto max-w-[130px] sm:max-w-[160px] object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
