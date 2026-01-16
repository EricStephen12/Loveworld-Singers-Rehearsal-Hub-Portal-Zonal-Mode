   'use client'

import { useState, useEffect } from 'react'
import { useChat } from '../_context/ChatContext'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { MessageCircle, Users, Search, Clock, CheckCircle2, Pin, Star, Trash2, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Chat, formatTimestamp } from '../_lib/firebase-chat-service'

export default function ChatSidebar() {
  const { chats, selectedChat, setSelectedChat, isChatsLoading, deleteChat, togglePinChat, toggleStarChat } = useChat()
  const { user } = useAuth()
  const { currentZone } = useZone()
  const [searchTerm, setSearchTerm] = useState('')
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)
  const [showMenuChatId, setShowMenuChatId] = useState<string | null>(null)

  // Debug chats on load
  useEffect(() => {
    if (chats.length > 0) {
      chats.forEach((chat, i) => {
        if (i < 3) { // Only log first 3
        }
      })
    }
  }, [chats, user?.uid])
  
  // Filter and sort chats
  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    if (chat.type === 'group') {
      return chat.name?.toLowerCase().includes(searchLower)
    } else {
      // For direct chats, search by participant name
      const otherParticipantId = chat.participants.find(id => id !== user?.uid)
      const participantName = chat.participantNames?.[otherParticipantId || ''] || ''
      return participantName.toLowerCase().includes(searchLower)
    }
  })

  // Sort chats: pinned first, then starred, then by last message time
  const sortedChats = [...filteredChats].sort((a, b) => {
    const aPinned = a.pinned?.[user?.uid || ''] || false
    const bPinned = b.pinned?.[user?.uid || ''] || false
    const aStarred = a.starred?.[user?.uid || ''] || false
    const bStarred = b.starred?.[user?.uid || ''] || false
    
    // Pinned chats first
    if (aPinned && !bPinned) return -1
    if (!aPinned && bPinned) return 1
    
    // Then starred chats
    if (aStarred && !bStarred) return -1
    if (!aStarred && bStarred) return 1
    
    // Then by last message time
    const aTime = a.lastMessage?.timestamp ? formatTimestamp(a.lastMessage.timestamp).getTime() : 0
    const bTime = b.lastMessage?.timestamp ? formatTimestamp(b.lastMessage.timestamp).getTime() : 0
    return bTime - aTime
  })

  const handleDeleteChat = async (chatId: string) => {
    if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      await deleteChat(chatId)
      setShowMenuChatId(null)
    }
  }

  const handleTogglePin = async (chatId: string, currentPin: boolean) => {
    await togglePinChat(chatId, !currentPin)
    setShowMenuChatId(null)
  }

  const handleToggleStar = async (chatId: string, currentStar: boolean) => {
    await toggleStarChat(chatId, !currentStar)
    setShowMenuChatId(null)
  }

  const formatLastMessageTime = (timestamp: any) => {
    try {
      const date = formatTimestamp(timestamp)
      
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
      <div className="h-full flex flex-col bg-white">
        {/* Loading Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-600">Chats</span>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        {/* FAST LOADING SPINNER */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900 text-base sm:text-lg">Chats</span>
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
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
            {sortedChats.map((chat) => {
              const isPinned = chat.pinned?.[user?.uid || ''] || false
              const isStarred = chat.starred?.[user?.uid || ''] || false
              const isHovered = hoveredChatId === chat.id
              const showMenu = showMenuChatId === chat.id
              
              return (
                <div
                  key={chat.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredChatId(chat.id)}
                  onMouseLeave={() => {
                    setHoveredChatId(null)
                    setShowMenuChatId(null)
                  }}
                >
                  <div
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-3 sm:p-3 rounded-lg transition-all hover:bg-gray-50 touch-target cursor-pointer ${
                      selectedChat?.id === chat.id 
                        ? 'bg-green-50 border-l-4 border-green-500' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
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
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {isPinned && (
                              <Pin className="w-3 h-3 text-purple-600 flex-shrink-0" fill="currentColor" />
                            )}
                            {isStarred && (
                              <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" fill="currentColor" />
                            )}
                            <h4 className="font-semibold text-gray-900 truncate">
                              {getOtherParticipantName(chat)}
                            </h4>
                          </div>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatLastMessageTime(chat.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
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
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center flex-shrink-0">
                              {chat.unreadCount[user?.uid || '']}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Menu Button */}
                      {isHovered && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowMenuChatId(showMenu ? null : chat.id)
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-2 top-12 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTogglePin(chat.id, isPinned)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <Pin className={`w-4 h-4 ${isPinned ? 'text-purple-600' : 'text-gray-600'}`} fill={isPinned ? 'currentColor' : 'none'} />
                        {isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleStar(chat.id, isStarred)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <Star className={`w-4 h-4 ${isStarred ? 'text-yellow-500' : 'text-gray-600'}`} fill={isStarred ? 'currentColor' : 'none'} />
                        {isStarred ? 'Unstar' : 'Star'}
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteChat(chat.id)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
