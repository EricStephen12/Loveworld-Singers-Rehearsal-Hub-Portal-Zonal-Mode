import { NextRequest, NextResponse } from 'next/server';
import { verifyKingsPayWebhookSignature } from '@/lib/kingspay-service';
import { FirebaseDatabaseService } from '@/lib/firebase-database';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-kingspay-signature');
    const body = await request.text();
    const data = JSON.parse(body);

    // Verify webhook signature
    const environment = process.env.NEXT_PUBLIC_KINGSPAY_ENVIRONMENT || 'test';
    const secretKey = environment === 'production'
      ? process.env.NEXT_PUBLIC_KINGSPAY_PRODUCTION_SECRET_KEY || ''
      : process.env.NEXT_PUBLIC_KINGSPAY_TEST_SECRET_KEY || '';

    if (signature && !verifyKingsPayWebhookSignature(signature, body, secretKey)) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }


    // Handle payment.succeeded event
    if (data.event === 'payment.succeeded') {
      const paymentData = data.data;


      // Store payment record in Firebase
      try {
        await FirebaseDatabaseService.createDocument('payments', paymentData.payment_id, {
          payment_id: paymentData.payment_id,
          payment_code: paymentData.payment_code,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          description: paymentData.description,
          metadata: paymentData.metadata,
          payment_type: paymentData.payment_type,
          environment: paymentData.environment,
          timestamp_utc: paymentData.timestamp_utc,
          processed_at: new Date().toISOString(),
        });


        // Handle different subscription types
        const subscriptionType = paymentData.metadata?.type;

        if (subscriptionType === 'zone_subscription') {
          // Zone subscription (Coordinator pays for entire zone)
          const { zoneId, coordinatorId, memberCount } = paymentData.metadata;

          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year subscription

          await FirebaseDatabaseService.updateDocument('zone_subscriptions', zoneId, {
            status: 'active',
            plan: 'premium',
            memberCount,
            paymentId: paymentData.payment_id,
            amountPaid: paymentData.amount,
            currency: paymentData.currency,
            paidBy: coordinatorId,
            paidAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
            updatedAt: new Date().toISOString(),
          });


        } else if (subscriptionType === 'individual_subscription') {
          // Individual subscription (Member pays for themselves)
          const { userId } = paymentData.metadata;

          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year subscription

          const subscriptionId = userId;
          await FirebaseDatabaseService.updateDocument('individual_subscriptions', subscriptionId, {
            status: 'active',
            paymentId: paymentData.payment_id,
            amountPaid: paymentData.amount,
            currency: paymentData.currency,
            paidAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
            updatedAt: new Date().toISOString(),
          });

        }
      } catch (error) {
        console.error('❌ Error processing payment webhook:', error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
