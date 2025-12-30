import { NextRequest, NextResponse } from 'next/server'
import { verifyKingsPayWebhookSignature } from '@/lib/kingspay-service'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-kingspay-signature')
    const body = await request.text()
    const payload = JSON.parse(body)

    // Verify webhook signature
    const secretKey = process.env.KINGSPAY_SECRET_KEY || process.env.NEXT_PUBLIC_KINGSPAY_SECRET_KEY
    
    if (!secretKey) {
      console.error('❌ KingsPay secret key not configured')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    if (signature && !verifyKingsPayWebhookSignature(signature, body, secretKey)) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Handle payment.succeeded event
    if (payload.event === 'payment.succeeded') {
      const { data } = payload
      const { metadata, payment_id, amount, status } = data

      if (status === 'SUCCESS' && metadata) {
        const { zoneId, userId, duration } = metadata

        // Calculate subscription end date
        const months = duration === 'yearly' ? 12 : 1
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + months)

        // Update zone subscription in Firebase
        try {
          await FirebaseDatabaseService.updateDocument('zones', zoneId, {
            subscriptionTier: 'premium',
            subscriptionStatus: 'active',
            subscriptionStartDate: new Date().toISOString(),
            subscriptionEndDate: endDate.toISOString(),
            lastPaymentId: payment_id,
            lastPaymentAmount: amount,
            lastPaymentDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })

          console.log(`✅ Zone ${zoneId} upgraded to premium via KingsPay payment ${payment_id}`)

          // TODO: Send notification to zone coordinator
          // TODO: Log the transaction

          return NextResponse.json({ success: true, message: 'Subscription activated' })
        } catch (error) {
          console.error('❌ Error updating zone subscription:', error)
          return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook received' })
  } catch (error) {
    console.error('❌ Error processing KingsPay webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
