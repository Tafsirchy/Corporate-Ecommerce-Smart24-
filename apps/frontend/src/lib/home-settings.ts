export interface WhyChooseFeature {
  id: string;
  icon: string;
  text: string;
  isActive: boolean;
}

export interface WhyChooseConfig {
  badgeText: string;
  features: WhyChooseFeature[];
}

export interface Smart24BusinessConfig {
  // OfferSlider right-hand card
  sliderCardTitle: string;
  sliderCardBadge: string;
  sliderCardSubtitle: string;
  sliderCardImageUrl: string;
  sliderHighlight1: string;
  sliderHighlight2: string;
  sliderPrimaryCtaLabel: string;
  sliderPrimaryCtaUrl: string;
  sliderSecondaryCtaLabel: string;
  sliderSecondaryCtaUrl: string;
  sliderFooterNote: string;
  // SubscriptionAd section
  adBadge: string;
  adHeading: string;
  adDescription: string;
  adPrimaryCtaLabel: string;
  adPrimaryCtaUrl: string;
  adSecondaryCtaLabel: string;
  adSecondaryCtaUrl: string;
  adShow: boolean;
}

export interface FlashSaleConfig {
  title: string;
  isActive: boolean;
  endsAt: string; // ISO date string
}

export const DEFAULT_WHY_CHOOSE_CONFIG: WhyChooseConfig = {
  badgeText: 'Why Choose Smart24',
  features: [
    { id: '1', text: 'Fast Delivery', icon: '🚀', isActive: true },
    { id: '2', text: 'Secure Payments', icon: '🔒', isActive: true },
    { id: '3', text: '24/7 Support', icon: '🎧', isActive: true },
    { id: '4', text: 'Quality Assured', icon: '⭐', isActive: true },
    { id: '5', text: 'Easy Returns', icon: '🔄', isActive: true },
    { id: '6', text: 'Business Deals', icon: '💼', isActive: true },
  ],
};

export const DEFAULT_SMART24_BUSINESS_CONFIG: Smart24BusinessConfig = {
  sliderCardTitle: 'Smart24 Business',
  sliderCardBadge: 'Trusted by 500+ Brands',
  sliderCardSubtitle: 'Exclusive Benefits',
  sliderCardImageUrl: '',
  sliderHighlight1: 'Free Bulk Delivery',
  sliderHighlight2: 'Flexible Payments',
  sliderPrimaryCtaLabel: 'Request Quote',
  sliderPrimaryCtaUrl: '/contact',
  sliderSecondaryCtaLabel: 'Browse Catalog',
  sliderSecondaryCtaUrl: '/shop',
  sliderFooterNote: 'Need customized supplies?',
  adBadge: 'Smart24 Business',
  adHeading: 'Automate your office supplies.',
  adDescription:
    'Set up recurring monthly deliveries for pantry items, stationery, and tech gear. Never run out of essentials again.',
  adPrimaryCtaLabel: 'Build Custom Plan',
  adPrimaryCtaUrl: '/subscriptions/builder',
  adSecondaryCtaLabel: 'View All Plans',
  adSecondaryCtaUrl: '/subscriptions',
  adShow: true,
};

export const DEFAULT_FLASH_SALE_CONFIG: FlashSaleConfig = {
  title: 'Flash Sale',
  isActive: true,
  endsAt: '',
};

export function parseSettingJson<T>(rawValue: string | undefined | null, fallback: T): T {
  if (!rawValue) return fallback;
  try {
    const parsed = JSON.parse(rawValue);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

