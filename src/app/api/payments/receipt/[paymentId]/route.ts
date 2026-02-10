import { NextRequest, NextResponse } from 'next/server';
import { PaymentRecordsService } from '@/lib/payment-records-service';

/**
 * GET /api/payments/receipt/{paymentId}
 * Get receipt details for a specific payment
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ paymentId: string }> }
) {
    try {
        const { paymentId } = await params;

        if (!paymentId) {
            return NextResponse.json(
                { error: 'paymentId is required' },
                { status: 400 }
            );
        }

        const paymentRecord = await PaymentRecordsService.getPaymentRecord(paymentId);

        if (!paymentRecord) {
            return NextResponse.json(
                { error: 'Payment record not found' },
                { status: 404 }
            );
        }

        // Return receipt data
        return NextResponse.json({
            success: true,
            receipt: {
                id: paymentRecord.id,
                paymentCode: paymentRecord.paymentCode,
                transactionRef: paymentRecord.transactionRef,
                amount: paymentRecord.amount,
                currency: paymentRecord.currency,
                status: paymentRecord.status,
                paymentMethod: paymentRecord.paymentMethod,
                subscriptionType: paymentRecord.subscriptionType,
                subscriptionPeriod: paymentRecord.subscriptionPeriod,
                userName: paymentRecord.userName,
                userEmail: paymentRecord.userEmail,
                createdAt: paymentRecord.createdAt,
                processedAt: paymentRecord.processedAt,
                receiptUrl: paymentRecord.receiptUrl,
                metadata: paymentRecord.metadata
            }
        });
    } catch (error) {
        console.error('Error fetching payment receipt:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment receipt' },
            { status: 500 }
        );
    }
}
