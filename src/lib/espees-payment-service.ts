// Espees Manual Payment Service

import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { PaymentRequest, PaymentStatus } from '@/config/subscriptions'

export interface PaymentSubmissionData {
  zoneId: string;
  zoneName: string;
  coordinatorName: string;
  coordinatorEmail: string;
  amount: number;
  duration: 'monthly' | 'yearly';
  proofImageUrl: string;
}

export class EspeesPaymentService {
  
  /**
   * Submit payment proof for review
   */
  static async submitPaymentProof(data: PaymentSubmissionData): Promise<{ success: boolean; error?: string; paymentId?: string }> {
    try {
      console.log('📤 [submitPaymentProof] Starting submission:', data.zoneId)
      
      const paymentId = `pay_${Date.now()}_${data.zoneId}`
      
      const paymentRequest: PaymentRequest = {
        id: paymentId,
        zoneId: data.zoneId,
        zoneName: data.zoneName,
        coordinatorName: data.coordinatorName,
        coordinatorEmail: data.coordinatorEmail,
        amount: data.amount,
        duration: data.duration,
        proofImageUrl: data.proofImageUrl,
        status: 'pending',
        submittedAt: new Date()
      }
      
      console.log('💾 [submitPaymentProof] Saving to payment_requests collection:', paymentRequest)
      
      // Save payment request to Firebase
      await FirebaseDatabaseService.createDocument('payment_requests', paymentId, paymentRequest)
      
      console.log('✅ [submitPaymentProof] Payment request saved to Firebase')
      
      // Update zone status to pending
      await FirebaseDatabaseService.updateDocument('zones', data.zoneId, {
        subscriptionStatus: 'pending',
        pendingPaymentId: paymentId,
        updatedAt: new Date()
      })
      
      console.log('✅ [submitPaymentProof] Zone status updated. Payment ID:', paymentId)
      
      return {
        success: true,
        paymentId
      }
    } catch (error) {
      console.error('❌ [submitPaymentProof] Error:', error)
      return {
        success: false,
        error: 'Failed to submit payment proof. Please try again.'
      }
    }
  }
  
  /**
   * Get payment request by ID
   */
  static async getPaymentRequest(paymentId: string): Promise<PaymentRequest | null> {
    try {
      const payment = await FirebaseDatabaseService.getDocument('payment_requests', paymentId)
      return payment as PaymentRequest || null
    } catch (error) {
      console.error('Error getting payment request:', error)
      return null
    }
  }
  
  /**
   * Get all pending payment requests (for admin)
   */
  static async getPendingPayments(): Promise<PaymentRequest[]> {
    try {
      console.log('🔍 [getPendingPayments] Querying payment_requests collection...')
      const payments = await FirebaseDatabaseService.getDocuments('payment_requests', [
        { field: 'status', operator: '==', value: 'pending' }
      ])
      
      console.log('📊 [getPendingPayments] Raw payments from Firebase:', payments.length, payments)
      
      const mapped = payments.map((p: any) => {
        console.log('📝 Payment:', {
          id: p.id,
          zoneName: p.zoneName,
          status: p.status,
          amount: p.amount,
          submittedAt: p.submittedAt
        })
        return p as PaymentRequest
      })
      
      const sorted = mapped.sort((a: PaymentRequest, b: PaymentRequest) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
      
      console.log('✅ [getPendingPayments] Returning', sorted.length, 'pending payments')
      return sorted
    } catch (error) {
      console.error('❌ [getPendingPayments] Error:', error)
      return []
    }
  }
  
  /**
   * Approve payment and activate subscription
   */
  static async approvePayment(
    paymentId: string, 
    approvedBy: string, 
    customDurationMonths?: number,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('✅ Approving payment:', paymentId)
      
      const payment = await this.getPaymentRequest(paymentId)
      if (!payment) {
        return { success: false, error: 'Payment request not found' }
      }
      
      // Calculate subscription end date
      const durationMonths = customDurationMonths || (payment.duration === 'yearly' ? 12 : 1)
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths)
      
      // Update payment request
      await FirebaseDatabaseService.updateDocument('payment_requests', paymentId, {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: approvedBy,
        approvedDuration: durationMonths,
        notes: notes || ''
      })
      
      // Update zone subscription
      await FirebaseDatabaseService.updateDocument('zones', payment.zoneId, {
        subscriptionTier: 'premium',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionExpiresAt: expiresAt,
        subscriptionAmount: payment.amount,
        maxMembers: 500,
        pendingPaymentId: null,
        updatedAt: new Date()
      })
      
      console.log('✅ Payment approved and subscription activated')
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error approving payment:', error)
      return {
        success: false,
        error: 'Failed to approve payment. Please try again.'
      }
    }
  }
  
  /**
   * Reject payment
   */
  static async rejectPayment(
    paymentId: string, 
    rejectedBy: string, 
    notes: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('❌ Rejecting payment:', paymentId)
      
      const payment = await this.getPaymentRequest(paymentId)
      if (!payment) {
        return { success: false, error: 'Payment request not found' }
      }
      
      // Update payment request
      await FirebaseDatabaseService.updateDocument('payment_requests', paymentId, {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: rejectedBy,
        notes
      })
      
      // Reset zone status
      await FirebaseDatabaseService.updateDocument('zones', payment.zoneId, {
        subscriptionStatus: 'active', // Keep current status
        pendingPaymentId: null,
        updatedAt: new Date()
      })
      
      console.log('❌ Payment rejected')
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error rejecting payment:', error)
      return {
        success: false,
        error: 'Failed to reject payment. Please try again.'
      }
    }
  }
  
  /**
   * Check if zone has pending payment
   */
  static async hasPendingPayment(zoneId: string): Promise<boolean> {
    try {
      const payments = await FirebaseDatabaseService.getDocuments('payment_requests', [
        { field: 'zoneId', operator: '==', value: zoneId },
        { field: 'status', operator: '==', value: 'pending' }
      ])
      
      return payments.length > 0
    } catch (error) {
      console.error('Error checking pending payment:', error)
      return false
    }
  }
  
  /**
   * Get payment history for a zone
   */
  static async getZonePaymentHistory(zoneId: string): Promise<PaymentRequest[]> {
    try {
      const payments = await FirebaseDatabaseService.getDocuments('payment_requests', [
        { field: 'zoneId', operator: '==', value: zoneId }
      ])
      
      return payments.map((p: any) => p as PaymentRequest).sort((a: PaymentRequest, b: PaymentRequest) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
    } catch (error) {
      console.error('Error getting payment history:', error)
      return []
    }
  }
}