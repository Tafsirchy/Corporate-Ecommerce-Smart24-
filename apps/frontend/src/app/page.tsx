import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Package, Truck, ShieldCheck, CreditCard } from "lucide-react";
import { HeroBentoAccordion, HeroAd } from "@/components/home/HeroBentoAccordion";
import { WhyChooseUsMarquee } from "@/components/home/WhyChooseUsMarquee";
import { OfferSlider } from "@/components/home/OfferSlider";
import { SpecialOfferBanner } from "@/components/home/SpecialOfferBanner";
import { FlashSale } from "@/components/home/FlashSale";
import { PremiumBentoCategories } from "@/components/home/PremiumBentoCategories";
import { JustForYou } from "@/components/home/JustForYou";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SubscriptionAd } from "@/components/home/SubscriptionAd";
import { OurClientsMarquee } from "@/components/home/OurClientsMarquee";
import { MembershipAd } from "@/components/home/MembershipAd";
import { CTA } from "@/components/CTA";
import {
  DEFAULT_SMART24_BUSINESS_CONFIG,
  parseSettingJson,
} from "@/lib/home-settings";
const DUMMY_ADS: HeroAd[] = [
  {
    id: "1",
    title: "Business Pantry Essentials",
    subtitle: "Stock up on premium coffee, tea, and snacks for your team.",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop",
    categoryUrl: "/shop/pantry"
  },
  {
    id: "2",
    title: "Office Electronics",
    subtitle: "Upgrade your workstations with top-tier monitors and accessories.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    categoryUrl: "/shop/electronics"
  },
  {
    id: "3",
    title: "Stationery Packages",
    subtitle: "Never run out of pens, paper, or sticky notes again.",
    imageUrl: "https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?q=80&w=1935&auto=format&fit=crop",
    categoryUrl: "/shop/stationery"
  },
  {
    id: "4",
    title: "Office Furniture",
    subtitle: "Ergonomic chairs and desks for maximum productivity.",
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop",
    categoryUrl: "/shop/furniture"
  }
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function OfferSliderSection() {
  let banners: any[] = [];
  let bizConfig = DEFAULT_SMART24_BUSINESS_CONFIG;
  try {
    const [bannersRes, bizRes] = await Promise.all([
      fetch(`${API_URL}/banners?activeOnly=true&type=MAIN_CAROUSEL`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/settings/home_smart24_business`, { next: { revalidate: 10 } }),
    ]);
    if (bannersRes.ok) banners = await bannersRes.json();
    if (bizRes.ok) {
      const setting = await bizRes.json();
      bizConfig = parseSettingJson(setting?.value, DEFAULT_SMART24_BUSINESS_CONFIG);
    }
  } catch (error) {
    console.error('Failed to fetch banners:', error);
  }
  return <OfferSlider banners={banners} initialBusinessConfig={bizConfig} />;
}

async function OurClientsSection() {
  let clients: any[] = [];
  try {
    const res = await fetch(`${API_URL}/clients?activeOnly=true&limit=50`, { next: { revalidate: 60 } });
    if (res.ok) {
      const cData = await res.json();
      clients = cData.data || cData || [];
    }
  } catch (error) {
    console.error('Failed to fetch clients:', error);
  }
  return <OurClientsMarquee clients={clients} />;
}

async function FlashSaleSection() {
  let flashSaleProducts: any[] = [];
  try {
    const res = await fetch(`${API_URL}/products?isFlashSale=true&limit=6`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      flashSaleProducts = data.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch flash sale products:', error);
  }
  return <FlashSale products={flashSaleProducts} />;
}

async function HeroSection() {
  let ads: HeroAd[] = DUMMY_ADS;
  try {
    const res = await fetch(`${API_URL}/hero-contents?activeOnly=true`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      const list = data?.data || data;
      if (Array.isArray(list) && list.length > 0) {
        ads = list.map((content: any) => ({
          id: content.id,
          title: content.title,
          subtitle: content.subtitle,
          imageUrl: content.imageUrl,
          categoryUrl: content.categoryUrl || '/shop',
        }));
      }
    }
  } catch (error) {
    console.error('Failed to fetch hero contents:', error);
  }
  return <HeroBentoAccordion ads={ads} />;
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="bg-muted border-b border-border">
        <Suspense fallback={<div className="container mx-auto px-4 py-6"><div className="h-[420px] rounded-2xl bg-muted/60 animate-pulse" /></div>}>
          <HeroSection />
        </Suspense>
      </div>

      {/* Features Section */}
      <WhyChooseUsMarquee />

      {/* Offer Slider */}
      <Suspense fallback={<div className="container mx-auto px-4 py-6"><div className="h-44 rounded-xl bg-muted animate-pulse" /></div>}>
        <OfferSliderSection />
      </Suspense>

      {/* Subscription Advertisement */}
      <SubscriptionAd />

      {/* Our Clients Marquee */}
      <Suspense fallback={<div className="container mx-auto px-4 py-6"><div className="h-24 rounded-xl bg-muted animate-pulse" /></div>}>
        <OurClientsSection />
      </Suspense>

      {/* Special Offer Banner before Business Collections */}
      <SpecialOfferBanner />

      {/* Flash Sale */}
      <Suspense fallback={<div className="container mx-auto px-4 py-8"><div className="h-64 rounded-xl bg-muted animate-pulse" /></div>}>
        <FlashSaleSection />
      </Suspense>

      {/* Membership Advertisement */}
      <MembershipAd />

      {/* Premium Categories Bento Box */}
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="h-64 rounded-xl bg-muted animate-pulse" />
          </div>
        }
      >
        <PremiumBentoCategories />
      </Suspense>

      {/* Just For You Products */}
      <JustForYou />

      {/* How it Works */}
      <HowItWorks />

      {/* CTA */}
      <CTA />
    </div>
  );
}
