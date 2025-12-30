import { NextRequest, NextResponse } from 'next/server'
import { initializeKingsPayPayment } from '@/lib/kingspay-service'
import { KINGSPAY_CONFIG } from '@/config/subscriptions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, description, zoneId, zoneName, userId, userEmail, duration } = body

    // Validate required fields
    if (!amount || !zoneId || !zoneName || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build callback and webhook URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/subscription/callback?zoneId=${zoneId}&userId=${userId}&duration=${duration}`
    const webhookUrl = `${baseUrl}/api/kingspay/webhook`

    // Initialize payment with KingsPay
    const result = await initializeKingsPayPayment({
      amount: amount, // Amount in KOBE (cents)
      currency: 'ESP',
      description: description || `LWSRH Premium Subscription - ${zoneName}`,
      merchant_callback_url: callbackUrl,
      merchant_webhook_url: webhookUrl,
      metadata: {
        zoneId,
        zoneName,
        userId,
        duration,
        product: 'premium_subscription'
      },
      payment_type: 'espees',
      email: userEmail
    })

    if (result.success && result.payment_id) {
      return NextResponse.json({
        success: true,
        payment_id: result.payment_id,
        message: result.message
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to initialize payment' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Error in KingsPay initialize API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
