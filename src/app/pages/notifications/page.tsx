'use client'

import React, { useState, useEffect } from 'react'
import { Bell, MessageSquare, Users, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'
import { getAllMessages, AdminMessage } from '@/lib/simple-notifications-service'
import { SubGroupDatabaseService } from '@/lib/subgroup-database-service'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'

interface CombinedNotification {
  id: string;
  title: string;
  message: string;
  sentBy?: string;
  sentAt: string;
  type: 'zone' | 'subgroup';
  subGroupName?: string;
  read?: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<CombinedNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'zone' | 'subgroup'>('all')
  const router = useRouter()
  const { user, profile } = useAuth()
  const { currentZone, isLoading: zoneLoading } = useZone()

  useEffect(() => {
    if (currentZone?.id && !zoneLoading && user?.uid) {
      loadNotifications()
    }
  }, [currentZone?.id, zoneLoading, user?.uid])

  const loadNotifications = async () => {
    if (!currentZone?.id || !user?.uid) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      // Load zone messages
      const zoneMessages = await getAllMessages(currentZone.id)
      const zoneMapped: CombinedNotification[] = zoneMessages.map(msg => ({
        id: msg.id,
        title: msg.title,
        message: msg.message,
        sentBy: msg.sentBy,
        sentAt: msg.sentAt,
        type: 'zone'
      }))
      
      // Load sub-group notifications
      const subGroupNotifs = await SubGroupDatabaseService.getUserNotifications(user.uid, 50)
      const subGroupMapped: CombinedNotification[] = subGroupNotifs.map(notif => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        sentAt: notif.createdAt?.toISOString?.() || new Date().toISOString(),
        type: 'subgroup',
        subGroupName: notif.subGroupName,
        read: notif.read
      }))
      
      // Combine and sort by date
      const combined = [...zoneMapped, ...subGroupMapped].sort((a, b) => 
        new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      )
      
      setNotifications(combined)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    return n.type === filter
  })
  
  // Check if user has any sub-group notifications
  const hasSubGroupNotifications = notifications.some(n => n.type === 'subgroup')
  const hasZoneNotifications = notifications.some(n => n.type === 'zone')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden">
      {/* Main Content with Apple-style reveal effect */}
      <div 
        className={`
          min-h-screen
          transition-all duration-300 ease-out
          ${isMenuOpen 
            ? 'translate-x-72 scale-[0.88] rounded-2xl shadow-2xl origin-left overflow-hidden' 
            : 'translate-x-0 scale-100 rounded-none'
          }
        `}
        onClick={() => isMenuOpen && setIsMenuOpen(false)}
      >
      <ScreenHeader
        title="Messages"
        onMenuClick={() => setIsMenuOpen(true)}
      />

      <div className="pt-16 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-3">
            {/* Filter Tabs - Only show if user has both types */}
            {hasSubGroupNotifications && hasZoneNotifications && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('zone')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === 'zone' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Zone
                </button>
                <button
                  onClick={() => setFilter('subgroup')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === 'subgroup' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  My Groups
                </button>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No messages yet</h3>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div key={notif.id} className={`bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow ${!notif.read && notif.type === 'subgroup' ? 'border-l-4 border-l-purple-500' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      notif.type === 'zone' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {notif.type === 'zone' ? (
                        <Building2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Users className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{notif.title}</h3>
                        {notif.type === 'subgroup' && notif.subGroupName && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {notif.subGroupName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{notif.message}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {notif.sentBy && <span>{notif.sentBy}</span>}
                        {notif.sentBy && <span>•</span>}
                        <span>{formatDate(notif.sentAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </div> {/* End Apple-style animated container */}

      <SharedDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={getMenuItems(() => setIsMenuOpen(false))}
      />
    </div>
  )
}
