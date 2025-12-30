'use client'

import { useState, useEffect } from 'react'
import { useChat } from '../_context/ChatContext'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { X, Search, MessageCircle, Loader2 } from 'lucide-react'
import { ChatUser } from '../_lib/firebase-chat-service'

interface UserSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
  const { searchUsers, createDirectChat, setSelectedChat, chats } = useChat()
  const { user } = useAuth()
  const { currentZone } = useZone()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ChatUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // SECURITY: Don't load users on open - only show results when searching
  // Filter results when search term changes
  useEffect(() => {
    const filterUsers = async () => {
      // SECURITY: Only search if user has typed at least 2 characters
      if (searchTerm.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await searchUsers(searchTerm)
        setSearchResults(results)
      } catch (error) {
        console.error('Error searching users:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(filterUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchUsers])

  const handleStartChat = async (targetUser: ChatUser) => {
    if (!user) return

    setActionLoading(targetUser.id)
    
    try {
      const existingChat = chats.find(chat => 
        chat.type === 'direct' && 
        chat.participants.includes(targetUser.id) && 
        chat.participants.includes(user.uid)
      )

      if (existingChat) {
        setSelectedChat(existingChat)
        onClose()
        return
      }

      const chatId = await createDirectChat(targetUser.id)
      if (chatId) {
        setTimeout(() => {
          const newChat = chats.find(chat => chat.id === chatId)
          if (newChat) {
            setSelectedChat(newChat)
          }
        }, 1000)
        onClose()
      }
    } catch (error) {
      console.error('Error starting chat:', error)
    } finally {
      setActionLoading(null)
    }
  }



  if (!isOpen) return null

  const themeColor = currentZone?.themeColor || '#10b981'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div 
          className="p-4 sm:p-6 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`
          }}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Find Users</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors touch-target"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
            <input
              type="text"
              placeholder="Search by name or email (min 2 characters)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-base"
              autoFocus
              minLength={2}
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading members...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm.trim().length < 2 
                  ? 'Start Searching' 
                  : 'No Users Found'}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm.trim().length < 2
                  ? 'Type at least 2 characters to search for users'
                  : `No users found matching "${searchTerm}"`}
              </p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-2">
              {searchResults.map((searchUser) => (
                <div key={searchUser.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors touch-target">
                  <div 
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md flex-shrink-0"
                    style={{ backgroundColor: themeColor }}
                  >
                    {searchUser.profilePic ? (
                      <img 
                        src={searchUser.profilePic} 
                        alt={searchUser.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      searchUser.fullName[0]?.toUpperCase() || '?'
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate text-base">
                      {searchUser.fullName}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {searchUser.email}
                    </p>
                    {searchUser.zoneName && (
                      <p className="text-xs text-gray-500 truncate">
                        {searchUser.zoneName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartChat(searchUser)}
                      disabled={actionLoading === searchUser.id}
                      className="p-2.5 text-gray-600 hover:text-white hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50 touch-target"
                      title="Start Chat"
                    >
                      {actionLoading === searchUser.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <MessageCircle className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
