'use client'

import React, { useState, useEffect } from 'react'
import { Bell, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'
import { getAllMessages, AdminMessage } from '@/lib/simple-notifications-service'
import { useAuth } from '@/hooks/useAuth'

export default function NotificationsPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { user, profile } = useAuth()

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setLoading(true)
    const msgs = await getAllMessages()
    setMessages(msgs)
    setLoading(false)
  }

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <ScreenHeader
        title="Messages"
        onMenuClick={() => setIsMenuOpen(true)}
      />

      <SharedDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={getMenuItems(() => setIsMenuOpen(false))}
      />

      <div className="pt-16 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-3">
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
            ) : messages.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No messages yet</h3>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bell className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1">{msg.title}</h3>
                      <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{msg.message}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{msg.sentBy}</span>
                        <span>•</span>
                        <span>{formatDate(msg.sentAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
