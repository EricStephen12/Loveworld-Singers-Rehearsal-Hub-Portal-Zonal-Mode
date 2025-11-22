   'use client'

import { useState } from 'react'
import { useChat } from '../_context/ChatContext'
import { useAuth } from '@/contexts/AuthContext'
import { useZone } from '@/contexts/ZoneContext'
import { MessageCircle, Users, Search, Clock, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Chat, formatTimestamp } from '../_lib/firebase-chat-service'

export default function ChatSidebar() {
  const { chats, selectedChat, setSelectedChat, isChatsLoading } = useChat()
  const { user } = useAuth()
  const { currentZone } = useZone()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter chats by search term
  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    if (chat.type === 'group') {
      return chat.name?.toLowerCase().includes(searchLower)
    } else {
      // For direct chats, search by participant name
      return chat.participants.some(participantId => {
        // This would need to be enhanced with actual user data
        return participantId.toLowerCase().includes(searchLower)
      })
    }
  })

  const formatLastMessageTime = (timestamp: any) => {
    try {
      const date = formatTimestamp(timestamp)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Just now'
      }
      
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return 'Just now'
    }
  }

  const getOtherParticipantName = (chat: Chat) => {
    if (chat.type === 'group') return chat.name || 'Group Chat'
    
    // For direct chats, get the other participant's name
    const otherParticipantId = chat.participants.find(id => id !== user?.uid)
    if (!otherParticipantId) return 'Unknown User'
    

    
    // Use participant names mapping if available
    if (chat.participantNames && chat.participantNames[otherParticipantId]) {
      return chat.participantNames[otherParticipantId]
    }
    
    // For existing chats without names, show a shortened ID
    return `User ${otherParticipantId.substring(0, 6)}...`
  }

  if (isChatsLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-600">Chats</span>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Chats</span>
          <span className="text-sm text-gray-500">({chats.length})</span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Chats Yet</h3>
            <p className="text-gray-600 text-sm mb-4">
              Start a conversation by searching for users or creating a group
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-3 rounded-lg transition-all hover:bg-gray-50 ${
                  selectedChat?.id === chat.id 
                    ? 'bg-green-50 border-l-4 border-green-500' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                      style={{ 
                        backgroundColor: currentZone?.themeColor || '#10b981' 
                      }}
                    >
                      {chat.type === 'group' ? (
                        <Users className="w-6 h-6" />
                      ) : (
                        getOtherParticipantName(chat)[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    
                    {/* Online indicator for direct chats */}
                    {chat.type === 'direct' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {getOtherParticipantName(chat)}
                      </h4>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatLastMessageTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage ? (
                          <>
                            {chat.lastMessage.senderId === user?.uid && (
                              <CheckCircle2 className="w-3 h-3 inline mr-1 text-blue-500" />
                            )}
                            {chat.lastMessage.text || '📷 Image'}
                          </>
                        ) : (
                          <span className="text-gray-400 italic">No messages yet</span>
                        )}
                      </p>
                      
                      {/* Unread count */}
                      {chat.unreadCount[user?.uid || ''] > 0 && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                          {chat.unreadCount[user?.uid || '']}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}