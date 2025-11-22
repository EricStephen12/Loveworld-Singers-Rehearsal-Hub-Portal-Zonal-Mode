// Subscription Tiers Configuration

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type PaymentMethod = 'espees';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface SubscriptionFeatures {
  maxMembers: number;
  audioLab: boolean;
  rehearsals: boolean;
  customSongs: boolean;
  analytics: boolean;
  aiTranslation: boolean;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: SubscriptionFeatures;
  description: string;
  popular?: boolean;
}

export interface PaymentRequest {
  id: string;
  zoneId: string;
  zoneName: string;
  coordinatorName: string;
  coordinatorEmail: string;
  amount: number;
  duration: 'monthly' | 'yearly';
  proofImageUrl: string;
  status: PaymentStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  approvedDuration?: number; // in months
  notes?: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: {
      monthly: 0,
      yearly: 0
    },
    features: {
      maxMembers: 20,
      audioLab: false,
      rehearsals: false,
      customSongs: false,
      analytics: false,
      aiTranslation: true
    },
    description: 'Perfect for small groups getting started'
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    price: {
      monthly: 5000,   // ₦5,000 per month
      yearly: 50000    // ₦50,000 per year (2 months free)
    },
    features: {
      maxMembers: -1, // -1 means unlimited members
      audioLab: true,
      rehearsals: true,
      customSongs: true,
      analytics: true,
      aiTranslation: true
    },
    description: 'Unlimited members and full access',
    popular: true
  }
};

// Espees Payment Configuration
export const ESPEES_CONFIG = {
  code: 'LWSRHP',
  name: 'Espees',
  description: 'LoveWorld Singers Rehearsal Hub Payment',
  instructions: [
    'Open your Espees app or visit Espees website',
    'Select "Send Money" or "Transfer"',
    'Enter Espees Code: LWSRHP',
    'Enter the exact amount shown above',
    'Add reference: Your Zone Name',
    'Complete the payment',
    'Take a screenshot of the successful transaction',
    'Upload the screenshot below'
  ]
};

// Feature descriptions
export const FEATURE_DESCRIPTIONS = {
  maxMembers: 'Maximum number of members in your zone',
  audioLab: 'Access to audio lab for song practice',
  rehearsals: 'Track rehearsal attendance and progress',
  customSongs: 'Create and manage your own songs',
  analytics: 'View detailed analytics and reports',
  aiTranslation: 'AI-powered lyrics translation'
};

// Helper function to display member limit
export function displayMemberLimit(tier: SubscriptionTier): string {
  const limit = SUBSCRIPTION_PLANS[tier].features.maxMembers;
  return limit === -1 ? 'Unlimited' : limit.toString();
}

// Helper function to format price in Naira
export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

// Helper function to calculate savings for yearly plan
export function calculateYearlySavings(): number {
  const monthlyTotal = SUBSCRIPTION_PLANS.premium.price.monthly * 12;
  const yearlyPrice = SUBSCRIPTION_PLANS.premium.price.yearly;
  return monthlyTotal - yearlyPrice;
}

// Helper function to check if feature is available
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: keyof SubscriptionFeatures
): boolean {
  return SUBSCRIPTION_PLANS[tier].features[feature] as boolean;
}

// Helper function to get member limit
export function getMemberLimit(tier: SubscriptionTier): number {
  const limit = SUBSCRIPTION_PLANS[tier].features.maxMembers;
  return limit === -1 ? Infinity : limit; // -1 becomes unlimited (Infinity)
}
