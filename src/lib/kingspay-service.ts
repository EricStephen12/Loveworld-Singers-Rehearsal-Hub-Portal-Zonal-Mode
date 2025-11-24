/**
 * KingsPay Goods & Services Integration
 * Payment gateway for Espees payments
 */

const KPAY_GS_API_HOST = 'https://api.kingspay-gs.com';
const KPAY_GS_WEB = 'https://kingspay-gs.com';

// Get secret key based on environment (test or production)
const getSecretKey = () => {
  const environment = process.env.NEXT_PUBLIC_KINGSPAY_ENVIRONMENT || 'test';
  
  if (environment === 'production') {
    const key = process.env.NEXT_PUBLIC_KINGSPAY_PRODUCTION_SECRET_KEY;
    if (!key) {
      throw new Error('KingsPay PRODUCTION secret key not configured');
    }
    console.log('🔐 Using PRODUCTION_SECRET_KEY');
    return key;
  } else {
    const key = process.env.NEXT_PUBLIC_KINGSPAY_TEST_SECRET_KEY;
    if (!key) {
      throw new Error('KingsPay TEST secret key not configured');
    }
    console.log('🔐 Using TEST_SECRET_KEY');
    return key;
  }
};

export interface PaymentInitializeParams {
  amount: number; // Amount in KOBE (cents) - e.g., 1000 = 10.00 ESP
  description: string;
  merchantCallbackUrl: string;
  merchantWebhookUrl: string;
  metadata?: Record<string, any>;
  email?: string;
}

export interface PaymentInitializeResponse {
  success: boolean;
  payment_id?: string;
  message?: string;
  error?: string;
}

export interface PaymentStatus {
  payment_id: string;
  amount: string;
  currency: string;
  description: string;
  environment: string;
  merchant_callback_url: string;
  metadata: Record<string, any>;
  status: 'INITIALIZED' | 'WAITING' | 'SUCCESS' | 'FAILED';
  merchant_name: string;
  payment_type: {
    type: string;
  };
}

/**
 * Initialize an Espees payment
 */
export async function initializeEspeesPayment(
  params: PaymentInitializeParams
): Promise<PaymentInitializeResponse> {
  try {
    console.log('🔐 Initializing KingsPay Espees payment:', {
      amount: params.amount,
      description: params.description
    });

    const response = await fetch(`${KPAY_GS_API_HOST}/api/payment/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getSecretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount.toString(),
        currency: 'ESP',
        description: params.description,
        merchant_callback_url: params.merchantCallbackUrl,
        merchant_webhook_url: params.merchantWebhookUrl,
        metadata: params.metadata || {},
        payment_type: 'espees',
        email: params.email,
      }),
    });

    const data = await response.json();

    if (response.ok && data.payment_id) {
      console.log('✅ Payment initialized successfully:', data.payment_id);
      return {
        success: true,
        payment_id: data.payment_id,
        message: data.message,
      };
    } else {
      console.error('❌ Payment initialization failed:', data);
      return {
        success: false,
        error: data.message || 'Failed to initialize payment',
      };
    }
  } catch (error) {
    console.error('❌ Error initializing payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get payment URL for customer to complete payment
 */
export function getPaymentUrl(paymentId: string): string {
  return `${KPAY_GS_WEB}/payment?id=${paymentId}`;
}

/**
 * Check payment status
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
  try {
    console.log('🔍 Checking payment status:', paymentId);

    const response = await fetch(`${KPAY_GS_API_HOST}/api/payment/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getSecretKey()}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Payment status retrieved:', data.status);
      return data;
    } else {
      console.error('❌ Failed to get payment status');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting payment status:', error);
    return null;
  }
}

/**
 * Cancel a payment
 */
export async function cancelPayment(paymentId: string): Promise<boolean> {
  try {
    console.log('❌ Cancelling payment:', paymentId);

    const response = await fetch(`${KPAY_GS_API_HOST}/api/payment/${paymentId}/cancel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getSecretKey()}`,
      },
    });

    if (response.ok) {
      console.log('✅ Payment cancelled successfully');
      return true;
    } else {
      console.error('❌ Failed to cancel payment');
      return false;
    }
  } catch (error) {
    console.error('❌ Error cancelling payment:', error);
    return false;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  try {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');
    
    return calculatedSignature === signature;
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Convert Espees amount to KOBE (cents)
 * Example: 10 ESP = 1000 KOBE
 */
export function espeesToKobe(espees: number): number {
  return Math.round(espees * 100);
}

/**
 * Convert KOBE (cents) to Espees
 * Example: 1000 KOBE = 10 ESP
 */
export function kobeToEspees(kobe: number): number {
  return kobe / 100;
}
