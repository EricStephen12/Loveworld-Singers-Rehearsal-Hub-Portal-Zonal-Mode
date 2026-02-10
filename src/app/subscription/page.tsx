'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { SUBSCRIPTION_PLANS, formatPrice, ESPEES_CONFIG } from '@/config/subscriptions'
import { Check, CreditCard, Shield, Crown, X, Upload, Copy, CheckCircle, AlertCircle, Home as HomeIcon, User as UserIcon, Sparkles, Calendar, Trash2, Info } from 'lucide-react'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { cancelSubscription } from '@/lib/subscription-service'
import { useEffect } from 'react'


export default function SubscriptionPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { currentZone } = useZone()
  const {
    subscription,
    isIndividualPremium,
    isPremiumTier,
    isOfficialAccess,
    daysRemaining,
    refreshSubscription,
    isLoading: subLoading
  } = useSubscription()

  const [isProcessing, setIsProcessing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'plans' | 'success' | 'manage'>('plans')
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Load payment history when on manage view
  const loadPaymentHistory = async () => {
    if (!user) return

    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/payments/history?userId=${user.uid}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentHistory(data.payments || [])
      }
    } catch (error) {
      console.error('Error loading payment history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  // Keep state in sync with premium status
  useEffect(() => {
    if (!subLoading && isPremiumTier && step === 'plans') {
      setStep('manage')
    }
    // Load payment history when entering manage view
    if (step === 'manage' && isPremiumTier) {
      loadPaymentHistory()
    }
  }, [isPremiumTier, step, subLoading])

  const handlePayWithKingsPay = async () => {
    if (!user || !currentZone) {
      setError('Please sign in to continue')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const amount = 100 // Fixed 1 Espee for Individual

      // Initialize payment with KingsPay
      const payload = {
        amount,
        description: `LWSRH Premium Individual Subscription`,
        userId: user.uid,
        userEmail: user.email,
        duration: 'monthly',
        type: 'individual_subscription'
      }



      const response = await fetch('/api/kingspay/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })



      let data
      const responseText = await response.text()


      try {
        data = JSON.parse(responseText)
      } catch (parseErr) {
        console.error('Failed to parse API response:', parseErr)
        setError('Server returned an invalid response. Please check your connection.')
        setIsProcessing(false)
        return
      }

      if (data.success && data.payment_id) {
        // Redirect to KingsPay payment page
        const paymentUrl = `https://kingspay-gs.com/payment?id=${data.payment_id}`
        window.location.href = paymentUrl
      } else {
        const errorMsg = data.instruction
          ? `${data.error}. ${data.instruction}`
          : (data.error || 'Failed to initialize payment')
        setError(errorMsg)
        setIsProcessing(false)
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('An error occurred. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!user || !confirm('Are you sure you want to cancel your Premium subscription? Your access will be revoked immediately.')) {
      return
    }

    setIsCancelling(true)
    try {
      const result = await cancelSubscription(user.uid)
      if (result.success) {
        await refreshSubscription()
        setStep('plans')
        alert('Your subscription has been cancelled.')
      } else {
        setError(result.error || 'Failed to cancel subscription')
      }
    } catch (err) {
      console.error('Cancellation error:', err)
      setError('An error occurred while cancelling. Please contact support.')
    } finally {
      setIsCancelling(false)
    }
  }

  if (!currentZone || subLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold animate-pulse">Syncing Subscription...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <ScreenHeader
        title={step === 'plans' ? 'Upgrade to Premium' : step === 'success' ? 'Success' : 'Subscription'}
        showBackButton={true}
        onBackClick={() => router.push('/home')}
        rightImageSrc="/logo.png"
      />

      {/* Main Content */}
      <div className="px-4 py-6">
        {step === 'plans' && (
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Go Premium</h2>
              <p className="text-gray-600 text-lg mb-6">
                Unlock the full power of Loveworld Singers Rehearsal Hub.
              </p>

              {/* HQ / Admin Acknowledgement */}
              {isPremiumTier && !isIndividualPremium && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-md mx-auto flex items-start gap-4 text-left shadow-sm">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">Zone Premium Access</h4>
                    <p className="text-amber-800/70 text-xs mt-1 leading-relaxed">
                      You already have Premium features unlocked through your current Zone or administrative role. You don't need to purchase a plan, but you can still buy an individual subscription to maintain Premium status across all zones.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Card: Premium Individual */}
            <div className="max-w-md mx-auto mb-12 pt-4">
              <div className="relative rounded-[2.5rem] p-10 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 border-2 border-white/10 shadow-2xl flex flex-col group transition-all hover:border-purple-500/50">
                {/* Badge */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <div className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full text-[10px] font-black tracking-[0.2em] text-white shadow-xl flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    PREMIUM INDIVIDUAL
                  </div>
                </div>

                <div className="text-center mb-10 pt-4">
                  <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Full Access</h3>
                  <p className="text-purple-200/50 text-sm leading-relaxed">Everything you need to grow as a Loveworld Singer.</p>
                </div>

                <div className="text-center mb-10">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-black text-white tracking-tighter">1</span>
                    <div className="text-left">
                      <span className="block text-xl font-bold text-amber-400 leading-none">ESPEE</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Per Month</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 flex-1 mb-10">
                  {[
                    'AudioLab',
                    'Unlimited Account Access',
                    'Full Rehearsal Access',
                    'Custom Song Submission',
                    'Advanced Admin Analytics'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <span className="text-gray-300 font-medium text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePayWithKingsPay}
                  disabled={isProcessing}
                  className="w-full py-5 bg-white text-gray-950 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-900/40 flex items-center justify-center gap-3 group-hover:bg-purple-500 group-hover:text-white"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-3 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      PAY WITH ESPEES
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="max-w-md mx-auto mb-8 p-5 bg-red-50/50 border border-red-200/50 rounded-[2rem] flex items-start gap-4 backdrop-blur-sm">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-bold mb-1">Payment Initialization Failed</p>
                  <p className="text-red-600/70 text-xs leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex justify-center items-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Instant Activation</span>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-12 px-6 max-w-md mx-auto">
            <div className="relative mb-12">
              <div className="w-32 h-32 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30 rotate-12 transition-transform hover:rotate-0 duration-500">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-yellow-400 animate-pulse" />
            </div>

            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">
              BEYOND LIMITS!
            </h2>

            <p className="text-gray-600 mb-10 text-lg leading-relaxed font-medium">
              Your Individual Premium subscription is now active. The Hub is officially yours!
            </p>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-[2rem] p-8 mb-12 flex flex-col items-center text-center shadow-inner">
              <div className="w-16 h-16 bg-white p-4 rounded-2xl shadow-md mb-4 rotate-3">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h4 className="font-black text-purple-900 text-lg">Premium Active</h4>
                <p className="text-purple-700/60 text-sm mt-2 leading-relaxed">
                  Enjoy unrestricted access to the AudioLab, Custom Song Submission, and all Rehearsals.
                </p>
              </div>
            </div>

            {/* Payment History Section */}
            {isIndividualPremium && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mb-8">
                <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                  <p className="text-sm text-gray-500">View all your subscription payments</p>
                </div>

                <div className="p-8">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-3 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                  ) : paymentHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No payment history yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-8 px-8">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Period</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {paymentHistory.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 px-4">
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                              </td>
                              <td className="py-4 px-4">
                                <p className="text-sm font-bold text-gray-900">
                                  {payment.amount / 100} {payment.currency}
                                </p>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${payment.status === 'success'
                                  ? 'bg-green-100 text-green-700'
                                  : payment.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : payment.status === 'refunded'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                  {payment.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <p className="text-xs text-gray-500">
                                  {payment.subscriptionPeriod?.start && payment.subscriptionPeriod?.end ? (
                                    <>
                                      {new Date(payment.subscriptionPeriod.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      {' - '}
                                      {new Date(payment.subscriptionPeriod.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </>
                                  ) : 'N/A'}
                                </p>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/payments/receipt/${payment.id}`)
                                      if (response.ok) {
                                        const data = await response.json()
                                        const receiptWindow = window.open('', '_blank')
                                        if (receiptWindow) {
                                          receiptWindow.document.write(`
                                            <html>
                                              <head>
                                                <title>Receipt - ${payment.paymentCode || payment.id}</title>
                                                <style>
                                                  body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
                                                  h1 { color: #6366f1; }
                                                  .detail { margin: 10px 0; }
                                                  .label { font-weight: bold; }
                                                </style>
                                              </head>
                                              <body>
                                                <h1>Payment Receipt</h1>
                                                <div class="detail"><span class="label">Receipt ID:</span> ${data.receipt.paymentCode || data.receipt.id}</div>
                                                <div class="detail"><span class="label">Date:</span> ${new Date(data.receipt.createdAt).toLocaleString()}</div>
                                                <div class="detail"><span class="label">Amount:</span> ${data.receipt.amount / 100} ${data.receipt.currency}</div>
                                                <div class="detail"><span class="label">Status:</span> ${data.receipt.status}</div>
                                                <div class="detail"><span class="label">Subscription Type:</span> ${data.receipt.subscriptionType}</div>
                                                <div class="detail"><span class="label">Period:</span> ${new Date(data.receipt.subscriptionPeriod.start).toLocaleDateString()} - ${new Date(data.receipt.subscriptionPeriod.end).toLocaleDateString()}</div>
                                                <div class="detail"><span class="label">User:</span> ${data.receipt.userName} (${data.receipt.userEmail})</div>
                                              </body>
                                            </html>
                                          `)
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error fetching receipt:', error)
                                      alert('Failed to load receipt')
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ml-auto"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={() => router.push('/home')}
              className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-purple-600 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <HomeIcon className="w-6 h-6" />
              TAKE ME HOME
            </button>
          </div>
        )}

        {step === 'manage' && isPremiumTier && (
          <div className="max-w-2xl mx-auto py-8">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Crown className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Subscription Details</h2>
              <p className="text-gray-500">
                {isIndividualPremium ? 'You are a Premium Individual member' : 'You have Complimentary Premium access'}
              </p>
            </div>

            {/* Expiring Soon Alert */}
            {isIndividualPremium && daysRemaining !== null && daysRemaining <= 7 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-[2rem] p-6 mb-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-amber-900 mb-1">Subscription Expiring Soon</h3>
                    <p className="text-amber-800 text-sm mb-4">
                      Your Premium subscription expires in <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong>.
                      Renew now to maintain uninterrupted access.
                    </p>
                    <button
                      onClick={() => {
                        setStep('plans')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md"
                    >
                      Renew Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mb-8">
              <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Current Status</h3>
                    <p className="text-sm text-gray-500">
                      {isOfficialAccess ? 'Official Unlimited Plan' : 'Premium Individual Plan'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-amber-600">
                      {isOfficialAccess ? 'UNLIMITED' : '1 ESPEE'}
                    </p>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                      {isOfficialAccess ? 'OFFICIAL ACCESS' : 'RENEWAL ACTIVE'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Health</p>
                      <p className={`text-xs text-green-600 font-medium`}>
                        ACTIVE
                      </p>
                    </div>
                  </div>
                </div>

                {subscription && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Next Renewal</p>
                        <p className="text-xs text-gray-500">
                          {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}
                          {daysRemaining !== null && ` (${daysRemaining} days left)`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!subscription && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Access Basis</p>
                      <p className="text-xs text-gray-500">
                        Unlocked via {currentZone?.name || 'HQ Status'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {isIndividualPremium && (
                <div className="p-8 bg-red-50/30 border-t border-red-100/50">
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="w-full py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-300 transition-all active:scale-[0.98] shadow-sm"
                  >
                    {isCancelling ? (
                      <div className="w-5 h-5 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        CANCEL SUBSCRIPTION
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 mt-4 px-4">
                    Note: Access will be revoked immediately upon cancellation.
                  </p>
                </div>
              )}

              {!isIndividualPremium && (
                <div className="p-8 bg-green-50 border-t border-green-100/50">
                  <div className="flex items-center justify-center gap-3 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold">Full Access Granted by HQ</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/home')}
              className="w-full py-4 text-gray-500 font-bold flex items-center justify-center gap-2 hover:text-gray-900 transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              BACK TO HOME
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

