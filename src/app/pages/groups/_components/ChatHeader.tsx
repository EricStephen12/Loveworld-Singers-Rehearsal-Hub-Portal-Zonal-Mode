'use client'

import { useState, useEffect } from 'react'
import { useChat } from '../_context/ChatContext'
import { useAuth } from '@/contexts/AuthContext'
import { useZone } from '@/contexts/ZoneContext'
import { FirebaseChatService } from '../_lib/firebase-chat-service'
import { MoreVertical, Users, Settings, UserPlus, UserMinus, Shield, ArrowLeft } from 'lucide-react'

export default function ChatHeader() {
  const { selectedChat, setSelectedChat } = useChat()
  const { user } = useAuth()
  const { currentZone } = useZone()
  const [showMenu, setShowMenu] = useState(false)
  const [otherUserName, setOtherUserName] = useState<string | null>(null)

  if (!selectedChat) return null

  const isGroupChat = selectedChat.type === 'group'
  const isAdmin = selectedChat.admins?.includes(user?.uid || '') || false
  
  // Fetch other user's name for direct chats
  useEffect(() => {
    const fetchOtherUserName = async () => {
      if (!selectedChat || selectedChat.type === 'group' || !user) return
      
      const otherParticipantId = selectedChat.participants.find(id => id !== user.uid)
      if (!otherParticipantId) return
      
      // Use participant names mapping if available
      if (selectedChat.participantNames && selectedChat.participantNames[otherParticipantId]) {
        setOtherUserName(selectedChat.participantNames[otherParticipantId])
        return
      }
      
      // Fetch user name from database
      try {
        const userData = await FirebaseChatService.getUser(otherParticipantId)
        if (userData) {
          setOtherUserName(userData.fullName)
        }
      } catch (error) {
        console.error('Error fetching user name:', error)
      }
    }
    
    fetchOtherUserName()
  }, [selectedChat, user])

  const getOtherParticipantName = () => {
    if (isGroupChat) return selectedChat.name || 'Group Chat'
    return otherUserName || 'Loading...'
  }

  const getSubtitle = () => {
    if (isGroupChat) {
      return `${selectedChat.participants.length} members`
    } else {
      return 'Online'
    }
  }

  return (
    <div 
      className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm"
    >
      {/* Chat Info */}
      <div className="flex items-center gap-3">
        {/* Mobile Back Button */}
        <button
          onClick={() => setSelectedChat(null)}
          className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Back to chats"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Avatar */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
          style={{ backgroundColor: currentZone?.themeColor || '#10b981' }}
        >
          {isGroupChat ? (
            <Users className="w-5 h-5" />
          ) : (
            getOtherParticipantName()[0]?.toUpperCase() || '?'
          )}
        </div>
        
        {/* Name and Status */}
        <div>
          <h3 className="font-semibold text-gray-900">
            {getOtherParticipantName()}
          </h3>
          <p className="text-sm text-gray-600">
            {getSubtitle()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Add Friend button (for direct chats) - Hide text on mobile */}
        {!isGroupChat && (
          <button 
            className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
            onClick={() => {
              // TODO: Implement add friend functionality
              console.log('Add friend clicked')
            }}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Friend</span>
          </button>
        )}
        
        {/* Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {isGroupChat && isAdmin && (
                <>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Members
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Group Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Manage Admins
                  </button>
                  <hr className="my-2" />
                </>
              )}
              
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                <Users className="w-4 h-4" />
                View Members
              </button>
              
              {isGroupChat && (
                <button className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2">
                  <UserMinus className="w-4 h-4" />
                  Leave Group
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
