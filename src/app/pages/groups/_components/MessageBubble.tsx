'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCheck, Reply, Trash2, Smile, Download, FileText, Mic, Image as ImageIcon, MoreVertical, Edit3, Loader2, Forward, Pin } from 'lucide-react'
import { Message, ReactionType } from '../_lib/chat-service'
import { useChatV2 } from '../_context/ChatContextV2'
import { useAuth } from '@/hooks/useAuth'
import { SyncAvatar } from './SyncAvatar'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  hasTail?: boolean
  primaryColor: string
  onReply?: (message: Message) => void
  onReaction?: (messageId: string, reaction: ReactionType) => void
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, currentText: string) => void
  onImageClick?: (url: string) => void
  onForward?: (message: Message) => void

  onPin?: (messageId: string | null) => void
}

// Document Download Button component
const DocumentDownloadButton = ({ attachment, primaryColor }: { attachment: NonNullable<Message['attachment']>, primaryColor: string }) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isDownloading) return

    try {
      setIsDownloading(true)
      const response = await fetch(attachment.url)
      if (!response.ok) throw new Error('Network response was not ok')
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = downloadUrl
      a.download = attachment.name || 'document'
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
       console.error('Error downloading document:', error)
       // Fallback to opening in new tab if blob download fails due to excessive CORS restrictions
       window.open(attachment.url, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button 
      onClick={handleDownload}
      className="w-full flex justify-between items-center bg-black/5 p-2 rounded mb-1 mt-0.5 hover:bg-black/10 transition-colors group text-left"
    >
      <div className="flex items-center gap-3">
        <div className="bg-[#f06159] p-2 rounded-lg text-white">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm line-clamp-1 max-w-[160px] font-medium text-[#111b21] group-hover:underline decoration-1">
            {attachment.name}
          </span>
          <span className="text-[11px] text-[#667781] font-medium">
            {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Document'}
          </span>
        </div>
      </div>
      
      <div className="p-2 text-[#667781] opacity-60 group-hover:opacity-100 transition-opacity">
        {isDownloading ? (
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: primaryColor }} />
        ) : (
          <Download className="w-5 h-5" />
        )}
      </div>
    </button>
  )
}

// Voice Message Player component (Internal to Bubble)
const VoiceMessagePlayer = ({ url, duration, isOwn, primaryColor }: { url: string, duration?: number, isOwn: boolean, primaryColor: string }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl min-w-[200px] ${isOwn ? 'bg-white/10' : 'bg-gray-100'}`}>
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isOwn ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white shadow-sm'}`}
      >
        {isPlaying ? <div className="flex gap-1"><div className="w-1 h-3 bg-current rounded-full" /><div className="w-1 h-3 bg-current rounded-full" /></div> : <div className="ml-1 w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-current border-b-[5px] border-b-transparent" />}
      </button>

      <div className="flex-1 flex flex-col gap-0.5">
        <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${isOwn ? 'bg-white' : 'bg-emerald-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-[10px] font-bold ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
            {formatTime(isPlaying ? (audioRef.current?.currentTime || 0) : (duration || 0))}
          </span>
          <Mic className={`w-3 h-3 ${isOwn ? 'text-white/60' : 'text-gray-400'}`} />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
        onTimeUpdate={(e) => setProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100)}
        className="hidden"
      />
    </div>
  )
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  hasTail,
  primaryColor,
  onReply,
  onReaction,
  onDelete,
  onEdit,
  onImageClick,
  onForward,
  onPin
}: MessageBubbleProps) {
  const { user } = useAuth()
  const { toggleReaction } = useChatV2()
  const [showActions, setShowActions] = useState(false)

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-1.5 bg-gray-200/50 backdrop-blur-sm rounded-full text-[11px] font-bold text-gray-500 shadow-sm border border-gray-100 uppercase tracking-widest">
          {message.text}
        </div>
      </div>
    )
  }

  const REACTIONS: ReactionType[] = ['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '👏', '💯', '✨']

  // Helper for message time
  const formatTime = (date: Date | any) => {
    if (!date) return ''
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex items-end gap-2 mb-2 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar (Left side only, if group) */}
      {!isOwn && showAvatar && (
        <SyncAvatar 
          userId={message.senderId}
          initialAvatar={message.senderAvatar}
          fallbackName={message.senderName}
          size="w-8 h-8"
          className="rounded-xl border-2 border-white ring-1 ring-gray-100 mb-1"
          textClassName="text-[10px]"
        />
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

      {/* Message Content Wrapper */}
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] lg:max-w-[60%] min-w-0 ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && showAvatar && (
          <span className="text-[10px] font-bold text-gray-400 ml-1 mb-0.5 uppercase tracking-wider">{message.senderName}</span>
        )}

        <div className="relative group/bubble">
          {/* Actions Popover — hidden by default, shown on hover/tap */}
          <div className={`absolute top-0 flex items-center gap-1 transition-all z-10 ${
            isOwn ? 'right-full mr-2' : 'left-full ml-2'
          } ${showActions ? 'opacity-100' : 'opacity-0 group-hover/bubble:opacity-100 group-active/bubble:opacity-100'}`}>
            <div className="relative">
              <button 
                onClick={() => setShowActions(!showActions)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${showActions ? 'bg-gray-100 text-gray-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className={`absolute bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 min-w-[150px] z-50 ${
                      isOwn ? 'right-0' : 'left-0'
                    }`}
                  >
                    {/* React */}
                    <button
                      onClick={() => {
                        onReaction?.(message.id, '' as any)
                        setShowActions(false)
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-orange-50 rounded-xl transition-colors text-sm font-bold text-gray-700 hover:text-orange-500"
                    >
                      <Smile className="w-4 h-4" /> React
                    </button>
                    {/* Reply */}
                    <button
                      onClick={() => {
                        onReply?.(message)
                        setShowActions(false)
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-sm font-bold text-gray-700 hover:text-emerald-600"
                    >
                      <Reply className="w-4 h-4" /> Reply
                    </button>
                    {/* Forward */}
                    <button
                      onClick={() => {
                        onForward?.(message)
                        setShowActions(false)
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-emerald-50 rounded-xl transition-colors text-sm font-bold text-gray-700 hover:text-emerald-600"
                    >
                      <Forward className="w-4 h-4" /> Forward
                    </button>


                    {/* Pin / Unpin */}
                    <button
                      onClick={() => {
                        onPin?.(message.pinnedInChat ? null : message.id)
                        setShowActions(false)
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-emerald-50 rounded-xl transition-colors text-sm font-bold text-gray-700 hover:text-emerald-600"
                    >
                      <Pin className={`w-4 h-4 ${message.pinnedInChat ? 'fill-emerald-400 text-emerald-400' : ''}`} /> 
                      {message.pinnedInChat ? 'Unpin' : 'Pin'}
                    </button>
                    {isOwn && (
                      <>
                        {/* Edit (only for text messages) */}
                        {message.type === 'text' && (
                          <button
                            onClick={() => {
                              onEdit?.(message.id, message.text)
                              setShowActions(false)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors text-sm font-bold text-gray-700 hover:text-blue-600"
                          >
                            <Edit3 className="w-4 h-4" /> Edit
                          </button>
                        )}
                        {/* Delete */}
                        <button
                          onClick={() => {
                            onDelete?.(message.id)
                            setShowActions(false)
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold text-red-500"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Actual Bubble Wrapper */}
          <div className="flex items-start">
            {/* Left Tail (Received) - SVG path for WhatsApp style */}
            {!isOwn && hasTail && (
              <div className="flex-shrink-0 -mr-[1px] mt-0">
                <svg viewBox="0 0 8 13" width="8" height="13" className="text-white fill-current">
                  <path opacity="0.13" d="M1.533 3.118L8 12.114V1H2.812C1.042 1 .474 2.156 1.533 3.118z"></path>
                  <path d="M1.533 2.118L8 11.114V0H2.812C1.042 0 .474 1.156 1.533 2.118z"></path>
                </svg>
              </div>
            )}
            {!isOwn && !hasTail && <div className={showAvatar ? "w-0" : "w-0"} />}

            {/* Bubble Body */}
            <div 
              className={`relative shadow-[0_1px_0.5px_rgba(11,20,26,.13)] ${
                isOwn 
                  ? 'text-white rounded-lg' 
                  : 'bg-white text-[#111b21] rounded-lg'
              } ${isOwn && hasTail ? 'rounded-tr-none' : ''} ${!isOwn && hasTail ? 'rounded-tl-none' : ''}`}
              style={isOwn ? { backgroundColor: primaryColor } : {}}
            >
              <div className="px-2 pt-1.5 min-w-[80px] flex flex-col min-w-0">
                {/* Reply Preview */}
                {message.replyTo && (
                  <div className="mb-1 p-1 bg-black/5 rounded cursor-pointer relative overflow-hidden flex flex-col">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#02a698] rounded-l" />
                    <div className="pl-2 pr-1">
                      <div className="font-semibold text-xs text-[#02a698] leading-tight mb-0.5">
                        {message.replyTo.senderName}
                      </div>
                      <div className="text-xs text-gray-500 truncate leading-tight pr-1">
                        {message.replyTo.text}
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Rendering */}
                {message.type === 'image' && message.imageUrl && (
                  <div className="mb-1 mt-0.5 -mx-1 rounded overflow-hidden">
                    <img 
                      src={message.imageUrl} 
                      alt="Attached Image" 
                      className="max-h-72 w-full object-cover cursor-pointer" 
                      onClick={() => onImageClick ? onImageClick(message.imageUrl!) : window.open(message.imageUrl, '_blank')}
                    />
                  </div>
                )}

                {message.type === 'voice' && message.voiceUrl && (
                  <div className="mb-1 mt-0.5">
                    <VoiceMessagePlayer 
                      url={message.voiceUrl} 
                      duration={message.voiceDuration} 
                      isOwn={isOwn} 
                      primaryColor={primaryColor} 
                    />
                  </div>
                )}

                {message.type === 'document' && message.attachment && (
                  <DocumentDownloadButton 
                    attachment={message.attachment} 
                    primaryColor={primaryColor} 
                  />
                )}

                {/* Message Text with Inline Timestamp */}
                <div className="relative flex flex-wrap items-end gap-x-2 gap-y-1 pb-1.5 min-w-0">
                  <span className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words pl-1 flex-1 min-w-0">
                    {message.text}
                  </span>
                  
                  {/* Floating timestamp container filling bottom-right */}
                  <div className="flex justify-end min-w-[50px] h-[15px] -mb-[2px] self-end">
                    <div className={`flex items-center gap-[4px] ${isOwn ? 'text-white/80' : 'text-[#667781]'}`}>
                      {message.pinnedInChat && <Pin className={`w-3 h-3 ${isOwn ? 'fill-white/40 text-transparent' : 'fill-gray-300 text-transparent'}`} />}
                      
                      <span className="text-[11px] font-medium mt-0.5 uppercase tracking-wide">
                        {formatTime(message.timestamp)}
                      </span>
                      {isOwn && (
                        <div className="flex items-center -mb-0.5 ml-0.5">
                          {message.status === 'read' ? (
                            <CheckCheck className="w-[15px] h-[15px] text-[#53bdeb]" />
                          ) : message.status === 'delivered' ? (
                             <CheckCheck className="w-[15px] h-[15px] opacity-70" />
                          ) : (
                            <Check className="w-[14px] h-[14px] opacity-70" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reactions Overlay */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -bottom-3 flex items-center gap-0.5 px-1.5 py-[2px] bg-white border border-[#e9edef] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)] z-20 ${
                      isOwn ? 'right-0' : 'left-0'
                    }`}
                  >
                    {Object.values(message.reactions).slice(0, 3).map((reaction, i) => (
                      <span key={i} className="text-[11px] leading-none">{reaction}</span>
                    ))}
                    {Object.keys(message.reactions).length > 3 && (
                      <span className="text-[10px] font-medium text-gray-500 ml-0.5 leading-none">{Object.keys(message.reactions).length}</span>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Tail (Sent) - SVG path for WhatsApp style */}
            {isOwn && hasTail && (
              <div className="flex-shrink-0 -ml-[1px] mt-0">
                <svg viewBox="0 0 8 13" width="8" height="13" className="fill-current" style={{ color: primaryColor }}>
                  <path opacity="0.13" d="M5.188 1H8v11.114l-6.467-8.996C.474 2.156 1.042 1 2.812 1h2.376z"></path>
                  <path d="M5.188 0H8v11.114l-6.467-8.996C.474 1.156 1.042 0 2.812 0h2.376z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
