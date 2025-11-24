'use client'

import { useEffect, useRef } from 'react'
import { useChat } from '../_context/ChatContext'
import { useAuth } from '@/contexts/AuthContext'
import { useZone } from '@/contexts/ZoneContext'
import { formatDistanceToNow } from 'date-fns'
import { User, Image as ImageIcon, File, CheckCheck, Check } from 'lucide-react'
import { formatTimestamp } from '../_lib/firebase-chat-service'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'

export default function ChatContainer() {
  const { selectedChat, messages, isMessagesLoading } = useChat()
  const { user } = useAuth()
  const { currentZone } = useZone()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!selectedChat) return null

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {isMessagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${currentZone?.themeColor || '#10b981'}20` }}
              >
                <User 
                  className="w-8 h-8"
                  style={{ color: currentZone?.themeColor || '#10b981' }}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600 text-sm">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.uid
              const showAvatar = !isOwnMessage

              return (
                <div
                  key={message.id}
                  className={`flex gap-1.5 sm:gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar for other users */}
                  {showAvatar && (
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0"
                      style={{ backgroundColor: currentZone?.themeColor || '#10b981' }}
                    >
                      {message.senderName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`max-w-[75%] sm:max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Sender name (for group chats) */}
                    {!isOwnMessage && selectedChat.type === 'group' && (
                      <span className="text-xs text-gray-600 mb-1 px-2">
                        {message.senderName}
                      </span>
                    )}

                    {/* Message content */}
                    <div
                      className={`rounded-2xl px-3 sm:px-4 py-2 text-sm sm:text-base ${
                        isOwnMessage
                          ? 'text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                      }`}
                      style={isOwnMessage ? { backgroundColor: currentZone?.themeColor || '#10b981' } : {}}
                    >
                      {/* Text message */}
                      {message.text && (
                        <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      )}

                      {/* Image message */}
                      {message.image && (
                        <div className="mt-2">
                          <img
                            src={message.image}
                            alt="Shared image"
                            className="max-w-full rounded-lg"
                          />
                        </div>
                      )}

                      {/* File message */}
                      {message.fileUrl && (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 mt-2 p-2 bg-black/10 rounded-lg hover:bg-black/20 transition-colors"
                        >
                          <File className="w-4 h-4" />
                          <span className="text-sm">{message.fileName || 'File'}</span>
                        </a>
                      )}

                      {/* Timestamp and status */}
                      <div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                        <span>
                          {(() => {
                            try {
                              const date = formatTimestamp(message.timestamp)
                              
                              // Check if date is valid
                              if (isNaN(date.getTime())) {
                                return 'Just now'
                              }
                              
                              return formatDistanceToNow(date, { addSuffix: true })
                            } catch {
                              return 'Just now'
                            }
                          })()}
                        </span>
                        
                        {/* Read status for own messages */}
                        {isOwnMessage && (
                          <>
                            {(message as any).readBy && (message as any).readBy.length > 1 ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  )
}
