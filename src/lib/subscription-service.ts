import { BackendAPI } from './api-client';

/**
 * SUBSCRIPTION SERVICE (WEBSITE CLIENT)
 * All subscription verification is now handled by the Standalone Backend.
 * All logic for status checks and reconciliation is proxied.
 */

export interface ZoneSubscription {
  id: string;
  zoneId: string;
  status: 'free' | 'active' | 'expired' | 'pending';
  plan: 'free' | 'premium';
  expiresAt?: string;
}

export interface IndividualSubscription {
  id: string;
  userId: string;
  status: 'active' | 'expired' | 'pending';
  expiresAt: string;
}

// Check if user has premium access
export async function hasPremiumAccess(userId: string, zoneId?: string): Promise<boolean> {
  try {
    const response = await BackendAPI.subscriptions.check(userId, zoneId);
    return response.active === true;
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
}

// Initialize payment
export async function initializeIndividualSubscription(userId: string, zoneId: string, userEmail?: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, zoneId, userEmail, type: 'individual' })
  });
  return await response.json();
}

export async function initializeZoneSubscription(zoneId: string, memberCount: number, coordinatorId: string, coordinatorEmail?: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zoneId, memberCount, coordinatorId, coordinatorEmail, type: 'zone' })
  });
  return await response.json();
}

// Get subscription data
export async function getIndividualSubscription(userId: string): Promise<IndividualSubscription | null> {
  const response = await BackendAPI.subscriptions.check(userId);
  return response.data || null;
}

export async function getZoneSubscription(zoneId: string): Promise<ZoneSubscription | null> {
  const response = await BackendAPI.subscriptions.check('', zoneId);
  return response.data || null;
}

// Reconciliation
export async function syncPaymentStatus(userId: string, type: string, targetId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, type, targetId })
  });
  return await response.json();
}

// Cancel subscription (Restored)
export async function cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const result = await response.json();
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Cancel error:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
}
