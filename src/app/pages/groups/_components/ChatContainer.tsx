'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '../_context/ChatContext'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { formatDistanceToNow } from 'date-fns'
import { User, Image as ImageIcon, File, CheckCheck, Check, Heart, Reply, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { formatTimestamp } from '../_lib/firebase-chat-service'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'

interface ChatContainerProps {
  onOpenFriendRequests: () => void
}

export default function ChatContainer({ onOpenFriendRequests }: ChatContainerProps) {
  const { selectedChat, messages, isMessagesLoading, toggleReaction, setReplyToMessage, setEditingMessage, deleteMessage } = useChat()
  const { user } = useAuth()
  const { currentZone } = useZone()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeActionMessage, setActiveActionMessage] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!selectedChat) return null

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <ChatHeader onOpenFriendRequests={onOpenFriendRequests} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {isMessagesLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          </div>
        )}

        {!isMessagesLoading && messages.length === 0 && (
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
              <p className="text-gray-600 text-sm">Start the conversation by sending a message</p>
            </div>
          </div>
        )}

        {!isMessagesLoading && messages.length > 0 && (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.uid
              const showAvatar = !isOwnMessage
              const reactions = Array.isArray(message.reactions) ? message.reactions : []
              const hasLiked = reactions.some(reaction => reaction.userId === user?.uid && reaction.emoji === '❤️')
              const likeCount = reactions.filter(reaction => reaction.emoji === '❤️').length

              return (
                <div key={message.id} className="flex flex-col gap-1 w-full">
                  <div className={`flex gap-1.5 sm:gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {showAvatar && (
                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0"
                        style={{ backgroundColor: currentZone?.themeColor || '#10b981' }}
                      >
                        {message.senderName?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}

                    <div className={`flex items-start gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''} w-full`}>
                      <div className={`max-w-[75%] sm:max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isOwnMessage && selectedChat.type === 'group' && (
                          <span className="text-xs text-gray-600 mb-1 px-2">
                            {message.senderName}
                          </span>
                        )}
                        <div
                          className={`rounded-2xl px-3 sm:px-4 py-2 text-sm sm:text-base ${
                            isOwnMessage ? 'text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                          }`}
                          style={isOwnMessage ? { backgroundColor: currentZone?.themeColor || '#10b981' } : {}}
                        >
                          {message.replyTo && !message.deleted && (
                            <div className={`mb-2 rounded-lg px-3 py-2 text-xs ${isOwnMessage ? 'bg-black/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                              <p className="font-semibold">{message.replySenderName || 'Reply'}</p>
                              <p className="truncate">{message.replySnippet || 'Message'}</p>
                            </div>
                          )}

                          {message.deleted ? (
                            <p className={`italic ${isOwnMessage ? 'text-white/80' : 'text-gray-500'}`}>This message was deleted</p>
                          ) : (
                            <>
                              {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
                              {message.image && (
                                <div className="mt-2">
                                  <img src={message.image} alt="Shared image" className="max-w-full rounded-lg" />
                                </div>
                              )}
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
                              <div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                                <span>
                                  {(() => {
                                    try {
                                      const date = formatTimestamp(message.timestamp)
                                      if (isNaN(date.getTime())) {
                                        return 'Just now'
                                      }
                                      return formatDistanceToNow(date, { addSuffix: true })
                                    } catch {
                                      return 'Just now'
                                    }
                                  })()}
                                </span>
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
                              {message.edited && (
                                <div className={`text-[11px] mt-0.5 ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`}>
                                  Edited
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {!message.deleted && (
                        <button
                          onClick={() => setActiveActionMessage(prev => prev === message.id ? null : message.id)}
                          className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                            isOwnMessage ? 'hover:bg-white/20 text-white/80' : 'hover:bg-gray-200 text-gray-500'
                          }`}
                          aria-label="Message actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {!message.deleted && activeActionMessage === message.id && (
                    <div className={`flex flex-wrap items-center gap-3 mt-2 text-xs ${isOwnMessage ? 'justify-end text-white/90' : 'text-gray-600'} w-full ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      <button
                        onClick={() => toggleReaction(message.id)}
                        className="flex items-center gap-1 hover:opacity-80 transition"
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLiked ? (isOwnMessage ? 'text-white' : 'text-red-500') : ''}`} />
                        {likeCount > 0 && <span>{likeCount}</span>}
                      </button>
                      <button
                        onClick={() => {
                          setEditingMessage(null)
                          setReplyToMessage(message)
                          setActiveActionMessage(null)
                        }}
                        className="flex items-center gap-1 hover:opacity-80 transition"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        Reply
                      </button>
                      {isOwnMessage && (
                        <>
                          <button
                            onClick={() => {
                              if (message.text) {
                                setReplyToMessage(null)
                                setEditingMessage(message)
                                setActiveActionMessage(null)
                              }
                            }}
                            className="flex items-center gap-1 hover:opacity-80 transition disabled:opacity-40"
                            disabled={!message.text}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              deleteMessage(message.id)
                              setActiveActionMessage(null)
                            }}
                            className="flex items-center gap-1 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
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
