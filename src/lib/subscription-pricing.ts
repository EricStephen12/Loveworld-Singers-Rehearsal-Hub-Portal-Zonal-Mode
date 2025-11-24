/**
 * Subscription Pricing Logic
 * Premium: 1 ESP per member with bulk discounts
 */

export interface PricingTier {
  name: string;
  pricePerMember: number; // in ESP
  discount: number; // percentage
  minMembers: number;
}

export const PRICING_TIERS: PricingTier[] = [
  { name: 'Standard', pricePerMember: 1, discount: 0, minMembers: 1 },
  { name: 'Bulk 100+', pricePerMember: 1, discount: 10, minMembers: 100 },
  { name: 'Bulk 200+', pricePerMember: 1, discount: 20, minMembers: 200 },
];

export const FREE_TIER_MEMBER_LIMIT = 10;

/**
 * Calculate subscription price based on member count
 */
export function calculateSubscriptionPrice(memberCount: number): {
  basePrice: number; // in ESP
  discount: number; // percentage
  discountAmount: number; // in ESP
  finalPrice: number; // in ESP
  priceInKobe: number; // in KOBE (cents)
  tier: PricingTier;
} {
  // Find applicable tier
  const tier = [...PRICING_TIERS]
    .reverse()
    .find(t => memberCount >= t.minMembers) || PRICING_TIERS[0];

  const basePrice = memberCount * tier.pricePerMember;
  const discountAmount = (basePrice * tier.discount) / 100;
  const finalPrice = basePrice - discountAmount;
  const priceInKobe = Math.round(finalPrice * 100); // Convert to KOBE

  return {
    basePrice,
    discount: tier.discount,
    discountAmount,
    finalPrice,
    priceInKobe,
    tier,
  };
}

/**
 * Calculate individual member subscription (1 ESP)
 */
export function calculateIndividualPrice(): {
  price: number; // in ESP
  priceInKobe: number; // in KOBE
} {
  return {
    price: 1,
    priceInKobe: 100, // 1 ESP = 100 KOBE
  };
}

/**
 * Check if zone is on free tier
 */
export function isFreeTier(memberCount: number): boolean {
  return memberCount <= FREE_TIER_MEMBER_LIMIT;
}

/**
 * Get pricing display text
 */
export function getPricingDisplay(memberCount: number): string {
  if (isFreeTier(memberCount)) {
    return 'Free (up to 10 members)';
  }

  const pricing = calculateSubscriptionPrice(memberCount);
  
  if (pricing.discount > 0) {
    return `${pricing.finalPrice} ESP (${pricing.discount}% discount applied)`;
  }
  
  return `${pricing.finalPrice} ESP`;
}
