'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { SUBSCRIPTION_PLANS, formatPrice, ESPEES_CONFIG } from '@/config/subscriptions'
import { Check, CreditCard, Shield, Crown, X, Upload, Copy, CheckCircle, AlertCircle, Home as HomeIcon, User as UserIcon, Sparkles } from 'lucide-react'
import { ScreenHeader } from '@/components/ScreenHeader'


export default function SubscriptionPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { currentZone } = useZone()

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'plans' | 'success'>('plans')

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

      console.log('💎 Initializing payment with payload:', payload)

      const response = await fetch('/api/kingspay/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      console.log('💎 API Response Status:', response.status)

      let data
      const responseText = await response.text()
      console.log('💎 API Response Text:', responseText)

      try {
        data = JSON.parse(responseText)
      } catch (parseErr) {
        console.error('💎 Failed to parse API response:', parseErr)
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

  if (!currentZone) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <ScreenHeader
        title={step === 'plans' ? 'Upgrade to Premium' : 'Success'}
        showBackButton={true}
        onBackClick={() => step === 'plans' ? router.push('/home') : setStep('plans')}
        rightImageSrc="/logo.png"
      />

      {/* Main Content */}
      <div className="px-4 py-6">
        {step === 'plans' && (
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Go Premium</h2>
              <p className="text-gray-600 text-lg">
                Unlock the full power of Loveworld Singers Rehearsal Hub.
              </p>
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

            <button
              onClick={() => router.push('/home')}
              className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-purple-600 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <HomeIcon className="w-6 h-6" />
              TAKE ME HOME
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

