'use client'

import { useState, useEffect } from 'react'
import { useChat } from '../_context/ChatContext'
import { useAuth } from '@/contexts/AuthContext'
import { useZone } from '@/contexts/ZoneContext'
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

  // Load all zone members when modal opens
  useEffect(() => {
    if (!isOpen) return

    const loadZoneMembers = async () => {
      setIsSearching(true)
      try {
        const results = await searchUsers('') // Empty string returns all zone members
        setSearchResults(results)
      } catch (error) {
        console.error('Error loading zone members:', error)
      } finally {
        setIsSearching(false)
      }
    }

    loadZoneMembers()
  }, [isOpen, searchUsers])

  // Filter results when search term changes
  useEffect(() => {
    const filterUsers = async () => {
      if (searchTerm.trim().length === 0) {
        // Show all zone members
        const results = await searchUsers('')
        setSearchResults(results)
        return
      }

      setIsSearching(true)
      try {
        const results = await searchUsers(searchTerm)
        setSearchResults(results)
      } catch (error) {
        console.error('Error searching users:', error)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div 
          className="p-6 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Find Users</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading zone members...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Members Found</h3>
              <p className="text-gray-600 text-sm">
                {searchTerm 
                  ? `No members found matching "${searchTerm}"`
                  : 'No members in your zone yet'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {searchResults.map((searchUser) => (
                <div key={searchUser.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0"
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
                    <h4 className="font-semibold text-gray-900 truncate">
                      {searchUser.fullName}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {searchUser.email}
                    </p>
                    {searchUser.zoneName && (
                      <p className="text-xs text-gray-500">
                        {searchUser.zoneName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartChat(searchUser)}
                      disabled={actionLoading === searchUser.id}
                      className="p-2 text-gray-600 hover:text-white hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50"
                      title="Start Chat"
                    >
                      {actionLoading === searchUser.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4" />
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
