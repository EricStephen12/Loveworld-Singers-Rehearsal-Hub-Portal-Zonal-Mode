'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ZoneInvitationService } from '@/lib/zone-invitation-service'
import { Users, Eye, Crown, TrendingUp, Activity, BarChart3, CreditCard, CheckCircle, XCircle, Clock, Calendar, DollarSign, Image as ImageIcon } from 'lucide-react'
import AnalyticsPage from '../pages/admin/analytics/page'
import { EspeesPaymentService } from '@/lib/espees-payment-service'

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
  const { profile } = useAuth()
  const [zones, setZones] = useState<ZoneStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [expandedZone, setExpandedZone] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showPayments, setShowPayments] = useState(false)
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [approvalDuration, setApprovalDuration] = useState<number>(1)
  const [rejectionNotes, setRejectionNotes] = useState('')

  useEffect(() => {
    // Check if user has boss role or is in boss zone
    const isBoss = profile?.role === 'boss' || profile?.email?.toLowerCase().startsWith('boss')
    if (!isBoss) {
      router.push('/home')
      return
    }
    
    loadZones()
    loadPendingPayments()
  }, [profile, router])

  const loadPendingPayments = async () => {
    try {
      const payments = await EspeesPaymentService.getPendingPayments()
      setPendingPayments(payments)
    } catch (error) {
      console.error('Error loading pending payments:', error)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading zones...</p>
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
                  setShowPayments(!showPayments)
                  setShowAnalytics(false)
                }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm font-medium backdrop-blur-sm flex items-center gap-2 relative ${
                  showPayments ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
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
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm font-medium backdrop-blur-sm flex items-center gap-2 ${
                  showAnalytics ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
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
                  <p className="text-gray-600 text-xs sm:text-sm">Premium Zones</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{premiumZones}</p>
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
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          zone.subscriptionTier === 'premium' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {zone.subscriptionTier.toUpperCase()}
                        </span>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          zone.subscriptionStatus === 'active' 
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
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                                  member.role === 'coordinator' 
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
