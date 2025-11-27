'use client'

import { useState, useEffect } from 'react'
import { useChat } from '../_context/ChatContext'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { FirebaseChatService, ChatUser } from '../_lib/firebase-chat-service'
import { MoreVertical, Users, Settings, UserPlus, UserMinus, Shield, ArrowLeft, Loader2, CheckCircle, User, Mail, MapPin, Bell } from 'lucide-react'

interface ChatHeaderProps {
  onOpenFriendRequests: () => void
}

export default function ChatHeader({ onOpenFriendRequests }: ChatHeaderProps) {
  const { selectedChat, setSelectedChat, sendFriendRequest, getFriendStatus, friendRequests } = useChat()
  const { user } = useAuth()
  const { currentZone } = useZone()
  const [showMenu, setShowMenu] = useState(false)
  const [otherUserName, setOtherUserName] = useState<string | null>(null)
  const [otherUserProfile, setOtherUserProfile] = useState<ChatUser | null>(null)
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending_outgoing' | 'pending_incoming' | 'friends'>('none')
  const [isFriendActionLoading, setIsFriendActionLoading] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isMembersLoading, setIsMembersLoading] = useState(false)
  const [groupMembers, setGroupMembers] = useState<ChatUser[]>([])

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
          setOtherUserProfile(userData)
        }
      } catch (error) {
        console.error('Error fetching user name:', error)
      }
    }
    
    fetchOtherUserName()
  }, [selectedChat, user])

  const otherParticipantId = !isGroupChat
    ? selectedChat.participants.find(id => id !== user?.uid)
    : null

  useEffect(() => {
    const fetchFriendStatus = async () => {
      if (!otherParticipantId) {
        setFriendStatus('none')
        return
      }

      const status = await getFriendStatus(otherParticipantId)
      setFriendStatus(status.status)
    }

    fetchFriendStatus()
  }, [otherParticipantId, getFriendStatus])

  const handleAddFriend = async () => {
    if (!otherParticipantId || friendStatus === 'pending_outgoing' || friendStatus === 'friends') return
    setIsFriendActionLoading(true)
    try {
      await sendFriendRequest(otherParticipantId)
      const status = await getFriendStatus(otherParticipantId)
      setFriendStatus(status.status)
    } finally {
      setIsFriendActionLoading(false)
    }
  }

  const getOtherParticipantName = () => {
    if (isGroupChat) return selectedChat.name || 'Group Chat'
    return otherUserName || 'Loading...'
  }

  const getSubtitle = () => {
    if (isGroupChat) {
      return `${selectedChat.participants.length} members`
    } else {
      return otherUserProfile?.zoneName || 'Direct chat'
    }
  }

  const handleViewMembers = async () => {
    if (!isGroupChat) return
    setIsMembersModalOpen(true)
    setIsMembersLoading(true)
    try {
      const members = await FirebaseChatService.getChatParticipants(selectedChat.id)
      setGroupMembers(members)
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setIsMembersLoading(false)
    }
  }

  const handleViewProfile = async () => {
    if (!otherParticipantId) return
    if (!otherUserProfile) {
      try {
        const data = await FirebaseChatService.getUser(otherParticipantId)
        if (data) setOtherUserProfile(data)
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
    setIsProfileModalOpen(true)
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
        <button
          onClick={onOpenFriendRequests}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Friend requests"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {friendRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center bg-red-500 text-white text-[10px] font-semibold rounded-full h-4 min-w-[16px] px-1">
              {friendRequests.length}
            </span>
          )}
        </button>

        {!isGroupChat && otherParticipantId && (
          <button 
            className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1 transition-colors ${
              friendStatus === 'friends'
                ? 'bg-green-600 text-white'
                : friendStatus === 'pending_outgoing'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            onClick={handleAddFriend}
            disabled={isFriendActionLoading || friendStatus === 'pending_outgoing' || friendStatus === 'friends'}
          >
            {isFriendActionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : friendStatus === 'friends' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
            <UserPlus className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {friendStatus === 'friends'
                ? 'Friends'
                : friendStatus === 'pending_outgoing'
                  ? 'Request Sent'
                  : 'Add Friend'}
            </span>
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
            <div className="absolute right-0 top-full mt-2 min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {isGroupChat ? (
                <>
                  {isAdmin && (
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
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      setShowMenu(false)
                      handleViewMembers()
                    }}
                  >
                <Users className="w-4 h-4" />
                View Members
              </button>
                <button className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2">
                  <UserMinus className="w-4 h-4" />
                  Leave Group
                  </button>
                </>
              ) : (
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    setShowMenu(false)
                    handleViewProfile()
                  }}
                >
                  <User className="w-4 h-4" />
                  View Profile
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

      {/* Members Modal */}
      {isMembersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Group Members</h3>
                <p className="text-sm text-gray-500">{selectedChat.participants.length} members</p>
              </div>
              <button
                onClick={() => setIsMembersModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            {isMembersLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-400" />
                <p className="text-gray-600 mt-3">Loading members...</p>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto divide-y">
                {groupMembers.map(member => (
                  <div key={member.id} className="p-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: currentZone?.themeColor || '#10b981' }}
                    >
                      {member.fullName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{member.fullName}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                ))}
                {groupMembers.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No members found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && otherUserProfile && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">User Profile</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                  style={{ backgroundColor: currentZone?.themeColor || '#10b981' }}
                >
                  {otherUserProfile.fullName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900">{otherUserProfile.fullName}</p>
                  <p className="text-sm text-gray-500">{friendStatus === 'friends' ? 'Friend' : 'Not added'}</p>
                </div>
              </div>
              <div className="space-y-3 text-gray-700 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{otherUserProfile.email || 'No email available'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{otherUserProfile.zoneName || 'No zone info'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
