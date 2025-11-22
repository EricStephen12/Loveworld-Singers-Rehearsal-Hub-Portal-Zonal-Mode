'use client'

import { useZone } from '@/contexts/ZoneContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { 
  Users, Crown, Music, Calendar, TrendingUp, 
  Link as LinkIcon, Copy, CheckCircle, CreditCard,
  Shield, BarChart3
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ZoneInvitationService } from '@/lib/zone-invitation-service'
import Link from 'next/link'

export default function DashboardSection() {
  const { currentZone, isZoneCoordinator } = useZone()
  const { subscription, memberLimit, isFreeTier, isPremiumTier } = useSubscription()
  
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  useEffect(() => {
    loadData()
  }, [currentZone])

  const loadData = async () => {
    if (!currentZone) return

    setIsLoading(true)
    try {
      // Load members
      const zoneMembers = await ZoneInvitationService.getZoneMembers(currentZone.id)
      setMembers(zoneMembers)

      // Generate invite link
      const link = ZoneInvitationService.getZoneSignupLink(currentZone.invitationCode)
      setInviteLink(link)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Zone Dashboard</h1>
            {isZoneCoordinator && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Coordinator</span>
              </div>
            )}
          </div>
          <p className="text-gray-600">{currentZone?.name} - {currentZone?.region}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Members</p>
            <p className="text-3xl font-bold text-gray-900">
              {members.length}
              <span className="text-lg text-gray-500">/{memberLimit}</span>
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(members.length / memberLimit) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isPremiumTier ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                <Crown className={`w-6 h-6 ${isPremiumTier ? 'text-yellow-600' : 'text-gray-400'}`} />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Subscription</p>
            <p className="text-3xl font-bold text-gray-900">
              {isFreeTier ? 'Free' : 'Premium'}
            </p>
            {isFreeTier && (
              <Link 
                href="/subscription/plans"
                className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-semibold"
              >
                Upgrade Now →
              </Link>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Songs</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500 mt-2">Across all programs</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Praise Nights</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500 mt-2">Active programs</p>
          </div>
        </div>

        {/* Invite Link Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Zone Invitation Link</h2>
              <p className="text-sm text-gray-600">Share this link to invite new members</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 bg-white rounded-lg border border-green-200 mb-3">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
            />
            <button
              onClick={copyInviteLink}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
            >
              {copiedLink ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Invitation Code:</span>
            <span className="font-mono font-bold text-green-700 bg-white px-3 py-1 rounded-lg">
              {currentZone?.invitationCode}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/subscription/plans"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200 group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Subscription</h3>
            <p className="text-sm text-gray-600">Upgrade or manage your plan</p>
          </Link>

          <button
            onClick={() => {}}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200 group text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Members</h3>
            <p className="text-sm text-gray-600">View and manage zone members</p>
          </button>

          <button
            onClick={() => {}}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200 group text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-sm text-gray-600">Track zone performance</p>
          </button>
        </div>

        {/* Recent Members */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Members</h2>
            <span className="text-sm text-gray-600">{members.length} total</span>
          </div>

          <div className="space-y-3">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{member.userName}</p>
                    <p className="text-sm text-gray-600">{member.userEmail}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  member.role === 'coordinator'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {member.role === 'coordinator' ? '👔 Coordinator' : '👤 Member'}
                </span>
              </div>
            ))}
          </div>

          {members.length > 5 && (
            <button
              onClick={() => {}}
              className="w-full mt-4 py-3 text-purple-600 font-semibold hover:bg-purple-50 rounded-lg transition-colors"
            >
              View All Members →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
