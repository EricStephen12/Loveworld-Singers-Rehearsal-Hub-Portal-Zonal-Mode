'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useZone } from '@/contexts/ZoneContext'
import { SUBSCRIPTION_PLANS, formatPrice, ESPEES_CONFIG } from '@/config/subscriptions'
import { Check, CreditCard, Shield, Crown, X, Upload, Copy, CheckCircle, AlertCircle } from 'lucide-react'

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { currentZone } = useZone()
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'plans' | 'payment' | 'upload' | 'success'>('plans')
  const [copied, setCopied] = useState(false)
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofImage(file)
      setError('')
    }
  }

  const handleSubmitProof = async () => {
    if (!proofImage || !user || !currentZone) return

    setIsUploading(true)
    setError('')

    try {
      // Upload proof image to Cloudinary or your storage
      const formData = new FormData()
      formData.append('file', proofImage)
      formData.append('zoneId', currentZone.id)
      formData.append('userId', user.uid)
      formData.append('plan', selectedPlan)
      formData.append('amount', SUBSCRIPTION_PLANS.premium.price[selectedPlan].toString())

      const response = await fetch('/api/subscription/submit-proof', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setStep('success')
      } else {
        setError(data.error || 'Failed to submit proof')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload proof. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handlePayWithKingsPay = async () => {
    if (!user || !currentZone) {
      setError('Please sign in to continue')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const amount = SUBSCRIPTION_PLANS.premium.price[selectedPlan]
      
      // Initialize payment with KingsPay
      const response = await fetch('/api/kingspay/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          description: `LWSRH Premium ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`,
          zoneId: currentZone.id,
          zoneName: currentZone.name,
          userId: user.uid,
          userEmail: user.email,
          duration: selectedPlan
        })
      })

      const data = await response.json()

      if (data.success && data.payment_id) {
        // Redirect to KingsPay payment page
        const paymentUrl = `https://kingspay-gs.com/payment?id=${data.payment_id}`
        window.location.href = paymentUrl
      } else {
        setError(data.error || 'Failed to initialize payment')
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

  const amount = SUBSCRIPTION_PLANS.premium.price[selectedPlan]
  
  // Get zone theme color and create variants
  const themeColor = currentZone.themeColor || '#3B82F6'
  const getColorClasses = (opacity = 100) => {
    const colorMap: Record<string, string> = {
      '#10B981': opacity === 100 ? 'bg-emerald-600 text-white border-emerald-600' : opacity === 50 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-100 text-emerald-600',
      '#3B82F6': opacity === 100 ? 'bg-blue-600 text-white border-blue-600' : opacity === 50 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-blue-100 text-blue-600',
      '#F59E0B': opacity === 100 ? 'bg-amber-600 text-white border-amber-600' : opacity === 50 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-100 text-amber-600',
      '#EF4444': opacity === 100 ? 'bg-red-600 text-white border-red-600' : opacity === 50 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-100 text-red-600',
      '#8B5CF6': opacity === 100 ? 'bg-violet-600 text-white border-violet-600' : opacity === 50 ? 'bg-violet-50 border-violet-200 text-violet-800' : 'bg-violet-100 text-violet-600',
      '#EC4899': opacity === 100 ? 'bg-pink-600 text-white border-pink-600' : opacity === 50 ? 'bg-pink-50 border-pink-200 text-pink-800' : 'bg-pink-100 text-pink-600',
      '#14B8A6': opacity === 100 ? 'bg-teal-600 text-white border-teal-600' : opacity === 50 ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-teal-100 text-teal-600',
      '#6366F1': opacity === 100 ? 'bg-indigo-600 text-white border-indigo-600' : opacity === 50 ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-indigo-100 text-indigo-600',
      '#F97316': opacity === 100 ? 'bg-orange-600 text-white border-orange-600' : opacity === 50 ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-orange-100 text-orange-600',
      '#84CC16': opacity === 100 ? 'bg-lime-600 text-white border-lime-600' : opacity === 50 ? 'bg-lime-50 border-lime-200 text-lime-800' : 'bg-lime-100 text-lime-600',
      '#06B6D4': opacity === 100 ? 'bg-cyan-600 text-white border-cyan-600' : opacity === 50 ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-cyan-100 text-cyan-600',
      '#A855F7': opacity === 100 ? 'bg-purple-600 text-white border-purple-600' : opacity === 50 ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-purple-100 text-purple-600',
      '#22D3EE': opacity === 100 ? 'bg-sky-600 text-white border-sky-600' : opacity === 50 ? 'bg-sky-50 border-sky-200 text-sky-800' : 'bg-sky-100 text-sky-600',
      '#FB923C': opacity === 100 ? 'bg-orange-500 text-white border-orange-500' : opacity === 50 ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-orange-100 text-orange-600',
      '#DC2626': opacity === 100 ? 'bg-red-700 text-white border-red-700' : opacity === 50 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-100 text-red-600',
      '#059669': opacity === 100 ? 'bg-emerald-700 text-white border-emerald-700' : opacity === 50 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-100 text-emerald-600',
      '#7C3AED': opacity === 100 ? 'bg-violet-700 text-white border-violet-700' : opacity === 50 ? 'bg-violet-50 border-violet-200 text-violet-800' : 'bg-violet-100 text-violet-600',
    }
    return colorMap[themeColor] || (opacity === 100 ? 'bg-blue-600 text-white border-blue-600' : opacity === 50 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-blue-100 text-blue-600')
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => step === 'plans' ? router.back() : setStep('plans')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          {step === 'plans' && 'Choose Plan'}
          {step === 'payment' && 'Payment Instructions'}
          {step === 'upload' && 'Upload Proof'}
          {step === 'success' && 'Success'}
        </h1>
        <div className="w-16"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {step === 'plans' && (
          <>
            {/* Header Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Enjoy the power of visual analytics, discover your data, build segmentation, predictive and prescriptive models.
              </p>
            </div>

            {/* Plan Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 p-1 rounded-full flex">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    selectedPlan === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  MONTHLY
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                    selectedPlan === 'yearly'
                      ? `${getColorClasses(100)} shadow-sm`
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  YEARLY
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Save ₦10k
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              {/* Free Plan */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 relative">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Perfect for small zones getting started with basic rehearsal management and song access.
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">₦0</span>
                    <span className="text-gray-600 ml-2">Per zone, forever</span>
                  </div>
                  <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                    Current Plan
                  </button>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Up to 20 members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Basic song access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">AI lyrics translation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Community support</span>
                  </div>
                </div>
              </div>

              {/* Premium Plan - Highlighted */}
              <div className={`relative rounded-2xl p-8 ${getColorClasses(50)} border-2 ${getColorClasses(100).includes('border') ? getColorClasses(100).split(' ').find(c => c.includes('border')) : 'border-blue-500'} transform scale-105 shadow-xl`}>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`px-4 py-2 ${getColorClasses(100)} rounded-full text-sm font-bold`}>
                    MOST POPULAR
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Complete solution for growing zones with unlimited members and advanced rehearsal management tools.
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(amount)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      Per zone, per {selectedPlan}, billed {selectedPlan === 'yearly' ? 'annually' : 'monthly'}
                    </span>
                  </div>
                  <button
                    onClick={() => setStep('payment')}
                    className={`w-full py-3 ${getColorClasses(100)} rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg`}
                  >
                    Upgrade to Premium
                  </button>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${getColorClasses(100).includes('text-white') ? 'text-white' : getColorClasses(100).split(' ').find(c => c.includes('text')) || 'text-blue-600'}`} />
                    <span className="text-gray-700">Unlimited members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${getColorClasses(100).includes('text-white') ? 'text-white' : getColorClasses(100).split(' ').find(c => c.includes('text')) || 'text-blue-600'}`} />
                    <span className="text-gray-700">Audio Lab access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${getColorClasses(100).includes('text-white') ? 'text-white' : getColorClasses(100).split(' ').find(c => c.includes('text')) || 'text-blue-600'}`} />
                    <span className="text-gray-700">Rehearsal tracking & analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${getColorClasses(100).includes('text-white') ? 'text-white' : getColorClasses(100).split(' ').find(c => c.includes('text')) || 'text-blue-600'}`} />
                    <span className="text-gray-700">Custom songs & playlists</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${getColorClasses(100).includes('text-white') ? 'text-white' : getColorClasses(100).split(' ').find(c => c.includes('text')) || 'text-blue-600'}`} />
                    <span className="text-gray-700">Priority support & training</span>
                  </div>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 relative">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Custom</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    For zones that want to pay for multiple years upfront with custom payment plans and additional savings.
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                    <span className="text-gray-600 ml-2">2+ years, contact for pricing</span>
                  </div>
                  <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                    Contact Us
                  </button>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">All Premium features</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">2+ years payment plans</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Additional bulk discounts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Flexible payment terms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Priority support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Espees Payment Info */}
            <div className={`${getColorClasses(50)} rounded-xl p-6 border ${getColorClasses(50).includes('border') ? getColorClasses(50).split(' ').find(c => c.includes('border')) : 'border-blue-200'} max-w-2xl mx-auto`}>
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className={`w-6 h-6 ${getColorClasses(100).includes('text-white') ? getColorClasses(100).split(' ').find(c => c.includes('text')) || 'text-blue-600' : getColorClasses(100).split(' ').find(c => c.includes('text')) || 'text-blue-600'}`} />
                <h3 className="font-bold text-gray-900 text-lg">Payment via {ESPEES_CONFIG.name}</h3>
              </div>
              <p className="text-gray-700 mb-2">
                Pay using Espees Code: <span className={`font-mono font-bold px-3 py-1 rounded ${getColorClasses(100)}`}>{ESPEES_CONFIG.code}</span>
              </p>
              <p className="text-gray-600 text-sm">
                All payments are manually verified within 10 minutes to 24 hours
              </p>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Zone</span>
                  <span className="font-medium">{currentZone.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium">Premium ({selectedPlan})</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>{formatPrice(amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Espees Code */}
            <div className={`mb-6 p-4 ${getColorClasses(50)} border rounded-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-1">Pay to {ESPEES_CONFIG.name} Code:</p>
                  <p className="text-2xl font-bold text-gray-900 font-mono">{ESPEES_CONFIG.code}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(ESPEES_CONFIG.code)}
                  className={`px-3 py-2 ${getColorClasses(100)} rounded-lg hover:opacity-90 transition-all flex items-center gap-2`}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 mb-6">
              {ESPEES_CONFIG.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${getColorClasses(100)} rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm">{instruction}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('upload')}
              className={`w-full py-4 ${getColorClasses(100)} rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2`}
            >
              <Upload className="w-5 h-5" />
              I've Made the Payment - Upload Proof
            </button>
          </>
        )}

        {step === 'upload' && (
          <>
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Screenshot
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="proof-upload"
                />
                <label htmlFor="proof-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload payment proof</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                </label>
              </div>
              
              {proofImage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">✓ {proofImage.name} selected</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitProof}
              disabled={!proofImage || isUploading}
              className={`w-full py-4 ${getColorClasses(100)} rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting Proof...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submit Payment Proof
                </>
              )}
            </button>
          </>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Payment Proof Submitted!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your payment proof has been submitted for review. We'll verify your payment within 10 minutes to 24 hours.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm">
                📧 You'll receive a notification once your payment is approved and your zone is upgraded to Premium.
              </p>
            </div>
            
            <button
              onClick={() => router.push('/home')}
              className={`w-full py-3 ${getColorClasses(100)} rounded-xl font-semibold hover:opacity-90 transition-all`}
            >
              Go to Home
            </button>
          </div>
        )}

        {/* Security Notice */}
        {step !== 'success' && (
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Your payment is secure and manually verified</span>
          </div>
        )}
      </div>
    </div>
  )
}
