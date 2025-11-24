/**
 * Subscription Management Service
 * Handles zone and individual subscriptions
 */

import { FirebaseDatabaseService } from './firebase-database';
import { initializeKingsPayPayment, getKingsPayPaymentUrl } from './kingspay-service';
import { calculateSubscriptionPrice, calculateIndividualPrice } from './subscription-pricing';

export interface ZoneSubscription {
  id: string;
  zoneId: string;
  status: 'free' | 'active' | 'expired' | 'pending';
  plan: 'free' | 'premium';
  memberCount: number;
  amountPaid?: number; // in KOBE
  currency?: string;
  paymentId?: string;
  paidBy?: string; // userId of coordinator who paid
  paidAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndividualSubscription {
  id: string;
  userId: string;
  zoneId: string;
  status: 'active' | 'expired' | 'pending';
  amountPaid: number; // in KOBE
  currency: string;
  paymentId: string;
  paidAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Initialize zone subscription payment (Coordinator pays for entire zone)
 */
export async function initializeZoneSubscription(
  zoneId: string,
  memberCount: number,
  coordinatorId: string,
  coordinatorEmail?: string
): Promise<{ success: boolean; payment_url?: string; error?: string }> {
  try {
    const pricing = calculateSubscriptionPrice(memberCount);
    
    console.log('💳 Initializing zone subscription:', {
      zoneId,
      memberCount,
      finalPrice: pricing.finalPrice,
      priceInKobe: pricing.priceInKobe,
      discount: pricing.discount,
    });

    // Initialize payment
    const result = await initializeKingsPayPayment({
      amount: pricing.priceInKobe,
      currency: 'ESP',
      description: `Premium Subscription - ${memberCount} members`,
      merchant_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/callback`,
      merchant_webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      payment_type: 'espees',
      metadata: {
        type: 'zone_subscription',
        zoneId,
        memberCount,
        coordinatorId,
        basePrice: pricing.basePrice,
        discount: pricing.discount,
        finalPrice: pricing.finalPrice,
      },
      email: coordinatorEmail,
    });

    if (result.success && result.payment_id) {
      // Create pending subscription record
      await FirebaseDatabaseService.createDocument('zone_subscriptions', zoneId, {
        zoneId,
        status: 'pending',
        plan: 'premium',
        memberCount,
        paymentId: result.payment_id,
        paidBy: coordinatorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        payment_url: getKingsPayPaymentUrl(result.payment_id),
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to initialize payment',
      };
    }
  } catch (error) {
    console.error('❌ Error initializing zone subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Initialize individual subscription payment (Member pays for themselves)
 */
export async function initializeIndividualSubscription(
  userId: string,
  zoneId: string,
  userEmail?: string
): Promise<{ success: boolean; payment_url?: string; error?: string }> {
  try {
    const pricing = calculateIndividualPrice();
    
    console.log('💳 Initializing individual subscription:', {
      userId,
      zoneId,
      price: pricing.price,
      priceInKobe: pricing.priceInKobe,
    });

    // Initialize payment
    const result = await initializeKingsPayPayment({
      amount: pricing.priceInKobe,
      currency: 'ESP',
      description: 'Premium Subscription - Individual',
      merchant_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/callback`,
      merchant_webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      payment_type: 'espees',
      metadata: {
        type: 'individual_subscription',
        userId,
        zoneId,
        price: pricing.price,
      },
      email: userEmail,
    });

    if (result.success && result.payment_id) {
      // Create pending subscription record
      const subscriptionId = `${userId}_${zoneId}`;
      await FirebaseDatabaseService.createDocument('individual_subscriptions', subscriptionId, {
        userId,
        zoneId,
        status: 'pending',
        paymentId: result.payment_id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        payment_url: getKingsPayPaymentUrl(result.payment_id),
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to initialize payment',
      };
    }
  } catch (error) {
    console.error('❌ Error initializing individual subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get zone subscription status
 */
export async function getZoneSubscription(zoneId: string): Promise<ZoneSubscription | null> {
  try {
    const doc = await FirebaseDatabaseService.getDocument('zone_subscriptions', zoneId);
    return doc as ZoneSubscription | null;
  } catch (error) {
    console.error('Error getting zone subscription:', error);
    return null;
  }
}

/**
 * Get individual subscription status
 */
export async function getIndividualSubscription(
  userId: string,
  zoneId: string
): Promise<IndividualSubscription | null> {
  try {
    const subscriptionId = `${userId}_${zoneId}`;
    const doc = await FirebaseDatabaseService.getDocument('individual_subscriptions', subscriptionId);
    return doc as IndividualSubscription | null;
  } catch (error) {
    console.error('Error getting individual subscription:', error);
    return null;
  }
}

/**
 * Check if user has premium access (either zone or individual)
 */
export async function hasPremiumAccess(userId: string, zoneId: string): Promise<boolean> {
  try {
    // Check zone subscription
    const zoneSubscription = await getZoneSubscription(zoneId);
    if (zoneSubscription?.status === 'active') {
      return true;
    }

    // Check individual subscription
    const individualSubscription = await getIndividualSubscription(userId, zoneId);
    if (individualSubscription?.status === 'active') {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
}
