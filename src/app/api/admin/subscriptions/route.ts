import { NextRequest, NextResponse } from 'next/server';
import { PaymentRecordsService, SubscriptionAuditService } from '@/lib/payment-records-service';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { isHQAdminEmail } from '@/config/roles';

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions with filters (HQ Admin only)
 */
export async function GET(request: NextRequest) {
    try {
        // Check admin authorization
        const authHeader = request.headers.get('authorization');
        const userEmail = request.headers.get('x-user-email');

        if (!userEmail || !isHQAdminEmail(userEmail)) {
            return NextResponse.json(
                { error: 'Unauthorized. HQ Admin access required.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') as any;
        const subscriptionType = searchParams.get('type') as any;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Get all payment records with filters
        const payments = await PaymentRecordsService.getAllPaymentRecords({
            status,
            subscriptionType,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });

        // Get subscription details
        const subscriptions = await Promise.all(
            payments.map(async (payment) => {
                let subscriptionData = null;

                if (payment.subscriptionType === 'zone' && payment.metadata?.zoneId) {
                    subscriptionData = await FirebaseDatabaseService.getDocument(
                        'zone_subscriptions',
                        payment.metadata.zoneId
                    );
                } else if (payment.subscriptionType === 'individual') {
                    subscriptionData = await FirebaseDatabaseService.getDocument(
                        'individual_subscriptions',
                        payment.userId
                    );
                }

                return {
                    payment,
                    subscription: subscriptionData
                };
            })
        );

        return NextResponse.json({
            success: true,
            subscriptions,
            count: subscriptions.length
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscriptions' },
            { status: 500 }
        );
    }
}
