import { NextRequest, NextResponse } from 'next/server';
import { PaymentRecordsService } from '@/lib/payment-records-service';

/**
 * GET /api/payments/history?userId={userId}
 * Get payment history for a specific user
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId parameter is required' },
                { status: 400 }
            );
        }

        const paymentHistory = await PaymentRecordsService.getUserPaymentHistory(userId);

        return NextResponse.json({
            success: true,
            payments: paymentHistory,
            count: paymentHistory.length
        });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment history' },
            { status: 500 }
        );
    }
}
