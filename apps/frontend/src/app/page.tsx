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
import { MembershipAd } from "@/components/home/MembershipAd";
import { CTA } from "@/components/CTA";
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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="bg-muted border-b border-border">
        <HeroBentoAccordion ads={DUMMY_ADS} />
      </div>

      {/* Features Section */}
      <WhyChooseUsMarquee />

      {/* Offer Slider */}
      <OfferSlider />

      {/* Subscription Advertisement */}
      <SubscriptionAd />

      {/* Special Offer Banner before Business Collections */}
      <SpecialOfferBanner />

      {/* Flash Sale */}
      <FlashSale />

      {/* Membership Advertisement */}
      <MembershipAd />

      {/* Premium Categories Bento Box */}
      <PremiumBentoCategories />

      {/* Just For You Products */}
      <JustForYou />

      {/* How it Works */}
      <HowItWorks />

      {/* CTA */}
      <CTA />
    </div>
  );
}
