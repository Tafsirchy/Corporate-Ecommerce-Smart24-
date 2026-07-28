import Link from "next/link";
import { ArrowRight, Package, Truck, ShieldCheck, CreditCard } from "lucide-react";
import { HeroBentoAccordion, HeroAd } from "@/components/HeroBentoAccordion";
import { WhyChooseUsMarquee } from "@/components/WhyChooseUsMarquee";
import { OfferSlider } from "@/components/OfferSlider";
import { SpecialOfferBanner } from "@/components/SpecialOfferBanner";
import { FlashSale } from "@/components/FlashSale";
import { PremiumBentoCategories } from "@/components/PremiumBentoCategories";
import { JustForYou } from "@/components/JustForYou";
import { HowItWorks } from "@/components/HowItWorks";

const DUMMY_ADS: HeroAd[] = [
  {
    id: "1",
    title: "Corporate Pantry Essentials",
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

      {/* Special Offer Banner before Corporate Collections */}
      <SpecialOfferBanner />

      {/* Flash Sale */}
      <FlashSale />

      {/* Premium Categories Bento Box */}
      <PremiumBentoCategories />

      {/* Just For You Products */}
      <JustForYou />

      {/* How it Works */}
      <HowItWorks />
    </div>
  );
}
