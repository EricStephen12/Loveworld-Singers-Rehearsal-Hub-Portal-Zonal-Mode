import { KINGSPAY_CONFIG } from '@/config/subscriptions'

export interface KingsPayInitializeParams {
  amount: number
  currency: string
  description: string
  merchant_callback_url: string
  merchant_webhook_url: string
  metadata?: Record<string, any>
  payment_type: 'espees'
  email?: string
}

export interface KingsPayInitializeResponse {
  success: boolean
  payment_id?: string
  message?: string
  error?: string
}

export interface KingsPayPaymentStatus {
  amount: string
  currency: string
  description: string
  environment: string
  merchant_callback_url: string
  metadata: Record<string, any>
  status: 'INITIALIZED' | 'WAITING' | 'SUCCESS' | 'FAILED'
  merchant_name: string
  payment_id: string
  payment_type: { type: string }
}

export async function initializeKingsPayPayment(
  params: KingsPayInitializeParams
): Promise<KingsPayInitializeResponse> {
  try {
    const secretKey = process.env.NEXT_PUBLIC_KINGSPAY_SECRET_KEY
    
    if (!secretKey) {
      console.error('KingsPay secret key not configured')
      return { success: false, error: 'Payment system not configured' }
    }

    const response = await fetch(`${KINGSPAY_CONFIG.apiUrl}/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    const data = await response.json()

    if (response.ok && data.payment_id) {
      return { success: true, payment_id: data.payment_id, message: data.message }
    }
    return { success: false, error: data.message || 'Failed to initialize payment' }
  } catch (error) {
    console.error('Error initializing KingsPay payment:', error)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

export async function getKingsPayPaymentStatus(
  paymentId: string
): Promise<KingsPayPaymentStatus | null> {
  try {
    const response = await fetch(`${KINGSPAY_CONFIG.apiUrl}/${paymentId}`)
    if (response.ok) return await response.json()
    return null
  } catch (error) {
    console.error('Error getting payment status:', error)
    return null
  }
}

export async function cancelKingsPayPayment(
  paymentId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${KINGSPAY_CONFIG.apiUrl}/${paymentId}/cancel`)
    
    if (response.ok) {
      const data = await response.json()
      return { success: true, message: data.message }
    }
    return { success: false, message: 'Failed to cancel payment' }
  } catch (error) {
    console.error('Error canceling payment:', error)
    return { success: false, message: 'Network error' }
  }
}

export function getKingsPayPaymentUrl(paymentId: string): string {
  return `${KINGSPAY_CONFIG.paymentUrl}?id=${paymentId}`
}

export function verifyKingsPayWebhookSignature(
  signature: string,
  payload: string,
  secretKey: string
): boolean {
  try {
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', secretKey)
    hmac.update(payload)
    const expectedSignature = hmac.digest('hex')
    return signature === expectedSignature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}
