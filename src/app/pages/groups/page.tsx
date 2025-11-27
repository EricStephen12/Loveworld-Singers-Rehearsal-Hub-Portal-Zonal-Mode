'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { useChat } from './_context/ChatContext'
import { ArrowLeft, MessageCircle, Users, Search, Plus, UserPlus } from 'lucide-react'
import { 
  ChatSidebar,
  ChatContainer,
  NoChatSelected,
  UserSearchModal,
  CreateGroupModal,
  FriendRequestsModal
} from './_components'


export default function GroupsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentZone, userZones, isLoading: zoneLoading } = useZone()
  const { selectedChat } = useChat()
  

  
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showFriendRequests, setShowFriendRequests] = useState(false)


  // Don't show anything if no user - prevents redirect
  if (!user) return null

  if (zoneLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading zone information...</p>
        </div>
      </div>
    )
  }

  if (!currentZone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Zone Membership</h2>
          <p className="text-gray-600 mb-4">You need to join a zone to access chat</p>
          <button
            onClick={() => router.push('/pages/join-zone')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Join Zone
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">

      {/* Header */}
      <div 
        className={`flex-shrink-0 p-3 sm:p-4 text-white shadow-lg ${selectedChat ? 'hidden md:block' : ''}`}
        style={{ 
          background: currentZone?.themeColor 
            ? `linear-gradient(135deg, ${currentZone.themeColor} 0%, ${adjustColor(currentZone.themeColor, -20)} 100%)`
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors touch-target flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Messages</h1>
              <p className="text-xs sm:text-sm opacity-90 truncate">
                {currentZone ? `${currentZone.name}` : 'Chat with zone members'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Search Users */}
            <button
              onClick={() => setShowUserSearch(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors touch-target"
              aria-label="Search users"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* Create Group */}
            <button
              onClick={() => setShowCreateGroup(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors touch-target"
              aria-label="Create group"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Hide on mobile when chat is selected */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 bg-white ${selectedChat ? 'hidden md:block' : 'block'}`}>
          <ChatSidebar />
        </div>

        {/* Chat Area - Show on mobile when chat is selected, full width on mobile */}
        <div className={`flex-1 ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
          {selectedChat ? (
            <ChatContainer onOpenFriendRequests={() => setShowFriendRequests(true)} />
          ) : (
            <NoChatSelected />
          )}
        </div>
      </div>

      {/* Modals */}
      <UserSearchModal 
        isOpen={showUserSearch} 
        onClose={() => setShowUserSearch(false)} 
      />
      
      <CreateGroupModal 
        isOpen={showCreateGroup} 
        onClose={() => setShowCreateGroup(false)} 
      />

      <FriendRequestsModal
        isOpen={showFriendRequests}
        onClose={() => setShowFriendRequests(false)}
      />
      

    </div>
  )
}

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number) => {
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
