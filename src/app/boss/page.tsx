'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ZoneInvitationService } from '@/lib/zone-invitation-service'
import { Users, Eye, Crown, TrendingUp, Activity, BarChart3, CreditCard, CheckCircle, XCircle, Clock, Calendar, DollarSign, Image as ImageIcon } from 'lucide-react'
import AnalyticsPage from '../pages/admin/analytics/page'
import { EspeesPaymentService } from '@/lib/espees-payment-service'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

interface ZoneStats {
  id: string;
  name: string;
  slug: string;
  region: string;
  invitationCode: string;
  themeColor: string;
  memberCount: number;
  maxMembers: number;
  subscriptionTier: string;
  subscriptionStatus: string;
  coordinatorEmail?: string;
  coordinatorName?: string;
  members?: Array<{
    id: string;
    email: string;
    fullName: string;
    role: string;
  }>;
}

export default function BossPage() {
  const router = useRouter()
  const { profile, isLoading: authLoading } = useAuth()
  const [zones, setZones] = useState<ZoneStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [expandedZone, setExpandedZone] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'zones' | 'analytics' | 'submissions'>('zones')
  const [submissions, setSubmissions] = useState<any[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showPayments, setShowPayments] = useState(false)
  const [individualPremiumCount, setIndividualPremiumCount] = useState(0)
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [approvalDuration, setApprovalDuration] = useState<number>(1)
  const [rejectionNotes, setRejectionNotes] = useState('')

  const isBoss = profile?.role === 'boss' || profile?.email?.toLowerCase().startsWith('boss')

  useEffect(() => {
    // Use cached profile immediately - don't wait for authLoading
    if (!profile) {
      // Only redirect if auth is done loading and still no profile
      if (!authLoading) {
        router.push('/home')
      }
      return
    }

    if (!isBoss) {
      router.push('/home')
      return
    }

    loadZones()
    loadPendingPayments()
    loadIndividualPremiumCount()
  }, [profile, isBoss, router, authLoading])

  const loadIndividualPremiumCount = async () => {
    try {
      const subs = await FirebaseDatabaseService.getDocuments('individual_subscriptions', [
        { field: 'status', operator: '==', value: 'active' }
      ])
      setIndividualPremiumCount(subs.length)
    } catch (error) {
      console.error('Error loading premium count:', error)
    }
  }

  const loadPendingPayments = async () => {
    try {
      const payments = await EspeesPaymentService.getPendingPayments()
      setPendingPayments(payments)
    } catch (error) {
      console.error('❌ Error loading pending payments:', error)
    }
  }

  const handleApprovePayment = async (paymentId: string) => {
    if (!profile?.email) return

    const result = await EspeesPaymentService.approvePayment(
      paymentId,
      profile.email,
      approvalDuration
    )

    if (result.success) {
      alert('Payment approved successfully!')
      setSelectedPayment(null)
      loadPendingPayments()
      loadZones()
    } else {
      alert(result.error || 'Failed to approve payment')
    }
  }

  const handleRejectPayment = async (paymentId: string) => {
    if (!profile?.email || !rejectionNotes.trim()) {
      alert('Please provide rejection notes')
      return
    }

    const result = await EspeesPaymentService.rejectPayment(
      paymentId,
      profile.email,
      rejectionNotes
    )

    if (result.success) {
      alert('Payment rejected')
      setSelectedPayment(null)
      setRejectionNotes('')
      loadPendingPayments()
    } else {
      alert(result.error || 'Failed to reject payment')
    }
  }

  const loadZones = async () => {
    setIsLoading(true)
    try {
      const zonesData = await ZoneInvitationService.getAllZonesWithStats()

      // Load members for each zone
      const zonesWithMembers = await Promise.all(
        zonesData.map(async (zone: any) => {
          const members = await ZoneInvitationService.getZoneMembers(zone.id)
          return {
            ...zone,
            members: members.map((m: any) => ({
              id: m.id,
              email: m.userEmail || m.profile?.email || 'N/A',
              fullName: m.userName || m.profile?.fullName || 'Unknown',
              role: m.role || 'member'
            })),
            coordinatorEmail: zone.coordinatorEmail || members.find((m: any) => m.role === 'coordinator')?.userEmail,
            coordinatorName: zone.coordinatorName || members.find((m: any) => m.role === 'coordinator')?.userName
          }
        })
      )

      setZones(zonesWithMembers)
    } catch (error) {
      console.error('Error loading zones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique regions
  const regions = ['all', ...Array.from(new Set(zones.map(z => z.region)))]

  // Filter zones
  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.invitationCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRegion = selectedRegion === 'all' || zone.region === selectedRegion
    return matchesSearch && matchesRegion
  })

  // Calculate stats
  const totalMembers = zones.reduce((sum, z) => sum + z.memberCount, 0)
  const activeZones = zones.filter(z => z.subscriptionStatus === 'active').length
  const premiumZones = zones.filter(z => z.subscriptionTier === 'premium').length

  // Show loading only if no cached profile or data is loading
  if ((!profile && authLoading) || isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-purple-50 overflow-hidden">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 overflow-auto p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Zones List */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-purple-50 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Crown className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {showAnalytics ? 'Website Analytics' : showPayments ? 'Payment Requests' : 'Central Admin'}
                </h1>
                <p className="text-xs sm:text-sm text-purple-100 hidden sm:block">
                  {showAnalytics ? 'Track website performance and user behavior' : showPayments ? 'Review and approve payment submissions' : 'View all zones, members, and coordinators'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowPayments(false)
                  setShowAnalytics(false)
                }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm font-medium backdrop-blur-sm flex items-center gap-2 ${!showPayments && !showAnalytics ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
                  }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Zones</span>
              </button>
              <button
                onClick={() => {
                  setShowPayments(!showPayments)
                  setShowAnalytics(false)
                }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm font-medium backdrop-blur-sm flex items-center gap-2 relative ${showPayments ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
                  }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Payments</span>
                {pendingPayments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingPayments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setShowAnalytics(!showAnalytics)
                  setShowPayments(false)
                }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm font-medium backdrop-blur-sm flex items-center gap-2 ${showAnalytics ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
                  }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
              <button
                onClick={() => router.push('/home')}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium backdrop-blur-sm"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>00

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {showAnalytics ? (
          <AnalyticsPage />
        ) : showPayments ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Payment Requests</h2>
                <p className="text-gray-600">Review and approve zone subscription payments</p>
              </div>
              <button
                onClick={loadPendingPayments}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No pending payment requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Payment Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{payment.zoneName}</h3>
                            <p className="text-sm text-gray-600">{payment.coordinatorName} • {payment.coordinatorEmail}</p>
                          </div>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-500">Amount</p>
                              <p className="font-semibold text-gray-900">₦{payment.amount.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="font-semibold text-gray-900 capitalize">{payment.duration}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">
                          Submitted: {new Date(payment.submittedAt).toLocaleString()}
                        </p>

                        {/* Proof Image */}
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowImageModal(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">View Payment Proof</span>
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Review Actions</h4>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subscription Duration (months)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="24"
                              value={approvalDuration}
                              onChange={(e) => setApprovalDuration(parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          <button
                            onClick={() => handleApprovePayment(payment.id)}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve & Activate
                          </button>

                          <div>
                            <textarea
                              placeholder="Rejection notes (required)"
                              value={rejectionNotes}
                              onChange={(e) => setRejectionNotes(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                              rows={2}
                            />
                          </div>

                          <button
                            onClick={() => handleRejectPayment(payment.id)}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Payment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Image Modal */}
            {showImageModal && selectedPayment && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
                <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="absolute -top-10 right-0 text-white hover:text-gray-300 text-sm font-medium"
                  >
                    Close ✕
                  </button>
                  <img
                    src={selectedPayment.proofImageUrl}
                    alt="Payment Proof"
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                  <div className="mt-4 bg-white p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">{selectedPayment.zoneName}</p>
                    <p className="text-sm text-gray-600">Amount: ₦{selectedPayment.amount.toLocaleString()} • {selectedPayment.duration}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-gray-600 text-xs sm:text-sm">Total Zones</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{zones.length}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-gray-600 text-xs sm:text-sm">Active Zones</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeZones}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-gray-600 text-xs sm:text-sm">Total Members</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalMembers}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-gray-600 text-xs sm:text-sm">Individual Premium</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{individualPremiumCount}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search zones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="sm:w-48 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>
                      {region === 'all' ? 'All Regions' : region}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-gray-600">
                <span>Showing {filteredZones.length} of {zones.length} zones</span>
              </div>
            </div>

            {/* Zones List */}
            <div className="space-y-3 sm:space-y-4 pb-6">
              {filteredZones.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No zones found matching your search</p>
                </div>
              ) : (
                filteredZones.map(zone => (
                  <div key={zone.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                    <div className="p-4 sm:p-6">
                      {/* Zone Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: zone.themeColor }}
                            />
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{zone.name}</h3>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">{zone.region}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${zone.subscriptionTier === 'premium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {zone.subscriptionTier.toUpperCase()}
                          </span>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${zone.subscriptionStatus === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {zone.subscriptionStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Zone Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-600">
                            {zone.memberCount} / {zone.maxMembers} members
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <span className="text-xs sm:text-sm font-mono text-gray-900 truncate">
                            Code: {zone.invitationCode}
                          </span>
                        </div>
                      </div>

                      {/* Coordinator Info */}
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mb-4">
                        <p className="text-xs text-purple-600 mb-1">Zone Coordinator</p>
                        <p className="text-xs sm:text-sm font-semibold text-purple-900 truncate">
                          {zone.coordinatorName || zone.coordinatorEmail || 'Not assigned'}
                        </p>
                      </div>

                      {/* View Members Button */}
                      <button
                        onClick={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}
                        className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 active:bg-purple-300 transition-colors font-medium text-sm"
                      >
                        {expandedZone === zone.id ? '▲ Hide Members' : `▼ View Members (${zone.memberCount})`}
                      </button>

                      {/* Members List */}
                      {expandedZone === zone.id && zone.members && (
                        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                          <h4 className="font-semibold text-gray-900 text-sm mb-2 sticky top-0 bg-white py-2">
                            Zone Members ({zone.members.length})
                          </h4>
                          {zone.members.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No members yet</p>
                          ) : (
                            zone.members.map(member => (
                              <div key={member.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">{member.fullName}</p>
                                    <p className="text-xs text-gray-600 truncate">{member.email}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${member.role === 'coordinator'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {member.role}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}              
