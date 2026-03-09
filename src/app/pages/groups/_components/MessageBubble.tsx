'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCheck, Reply, Trash2, Smile, Download, FileText, Mic, Image as ImageIcon, MoreVertical, Edit3 } from 'lucide-react'
import { Message, ReactionType } from '../_lib/chat-service'
import { useChatV2 } from '../_context/ChatContextV2'
import { useAuth } from '@/hooks/useAuth'
import { SyncAvatar } from './SyncAvatar'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  primaryColor: string
  onReply?: (message: Message) => void
  onReaction?: (messageId: string, reaction: ReactionType) => void
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, currentText: string) => void
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
  primaryColor,
  onReply,
  onReaction,
  onDelete,
  onEdit
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
      <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
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
                className={`p-1.5 rounded-full transition-colors ${showActions ? 'bg-gray-100 text-gray-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
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

          {/* Actual Bubble */}
          <div 
            className={`relative p-3 rounded-2xl shadow-sm ${
              isOwn 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
            }`}
            style={isOwn ? { backgroundColor: primaryColor } : {}}
          >
            {/* Reply Preview */}
            {message.replyTo && (
              <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 overflow-hidden max-h-16 ${
                isOwn ? 'bg-white/10 border-white/50' : 'bg-gray-50 border-emerald-500'
              }`}>
                <div className={`font-bold mb-0.5 ${isOwn ? 'text-white' : 'text-emerald-600'}`}>
                  {message.replyTo.senderName}
                </div>
                <div className={`truncate opacity-80 ${isOwn ? 'text-white' : 'text-gray-500'}`}>
                  {message.replyTo.text}
                </div>
              </div>
            )}

            {/* Media Rendering */}
            {message.type === 'image' && message.imageUrl && (
              <div className="mb-2 rounded-xl overflow-hidden shadow-inner bg-black/5">
                <img 
                  src={message.imageUrl} 
                  alt="Attachment" 
                  className="max-h-60 w-full object-cover hover:scale-105 transition-transform duration-500" 
                  onClick={() => window.open(message.imageUrl, '_blank')}
                />
              </div>
            )}

            {message.type === 'voice' && message.voiceUrl && (
              <div className="mb-1">
                <VoiceMessagePlayer 
                  url={message.voiceUrl} 
                  duration={message.voiceDuration} 
                  isOwn={isOwn} 
                  primaryColor={primaryColor} 
                />
              </div>
            )}

            {message.type === 'document' && message.attachment && (
              <a 
                href={message.attachment.url} 
                target="_blank" 
                rel="noreferrer"
                className={`flex items-center gap-3 p-2 rounded-xl mb-1 ${isOwn ? 'bg-white/10' : 'bg-gray-100'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOwn ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white shadow-sm'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold truncate ${isOwn ? 'text-white' : 'text-gray-800'}`}>{message.attachment.name}</div>
                  <div className={`text-[10px] opacity-60 ${isOwn ? 'text-white' : 'text-gray-500'}`}>
                    {message.attachment.size ? `${(message.attachment.size / 1024).toFixed(1)} KB` : 'Document'}
                  </div>
                </div>
                <Download className={`w-4 h-4 ${isOwn ? 'text-white/60' : 'text-gray-400'}`} />
              </a>
            )}

            {/* Message Text */}
            {message.text && (
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words font-medium">
                {message.text}
              </p>
            )}

            {/* Timestamp & Status */}
            <div className={`flex items-center justify-end gap-1.5 mt-1 -mb-1 opacity-70`}>
              <span className="text-[9px] font-bold grayscale">
                {formatTime(message.timestamp)}
              </span>
              {isOwn && (
                <div className="flex items-center">
                  {message.status === 'read' ? (
                    <div className="flex -space-x-1.5">
                      <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                  ) : (
                    <Check className="w-3.5 h-3.5 opacity-60" />
                  )}
                </div>
              )}
            </div>

            {/* Reactions Overlay */}
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute -bottom-3 flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-gray-100 rounded-full shadow-sm z-20 ${
                  isOwn ? 'right-0' : 'left-0'
                }`}
              >
                {Object.values(message.reactions).slice(0, 3).map((reaction, i) => (
                  <span key={i} className="text-[10px]">{reaction}</span>
                ))}
                {Object.keys(message.reactions).length > 3 && (
                  <span className="text-[8px] font-bold text-gray-400 ml-0.5">{Object.keys(message.reactions).length}</span>
                )}
              </motion.div>
            )}
          </div>

          {/* Tail */}
          <div 
            className={`absolute top-0 w-3 h-3 ${
              isOwn 
                ? '-right-1.5 bg-emerald-600 rounded-bl-[10px] rounded-br-[2px]' 
                : '-left-1.5 bg-white border-l border-t border-gray-100 rounded-br-[10px] rounded-bl-[2px]'
            }`}
            style={isOwn ? { backgroundColor: primaryColor } : {}}
          />
        </div>
      </div>
    </div>
  )
}
