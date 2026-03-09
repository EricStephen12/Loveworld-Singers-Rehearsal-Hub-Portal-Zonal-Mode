'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, Smile, X, Image as ImageIcon, FileText, Loader2, Trash2 } from 'lucide-react'
import { useChatV2 } from '../_context/ChatContextV2'

interface ChatInputProps {
  primaryColor: string
  replyingTo: { id: string; text: string; senderName: string } | null
  onCancelReply: () => void
  editingMessage?: { id: string; text: string } | null
  onEditComplete?: (newText: string) => void
  onCancelEdit?: () => void
}

export function ChatInput({
  primaryColor,
  replyingTo,
  onCancelReply,
  editingMessage,
  onEditComplete,
  onCancelEdit
}: ChatInputProps) {
  const { 
    sendMessage, 
    sendMediaMessage, 
    sendVoiceMessage, 
    setTypingStatus 
  } = useChatV2()

  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const EMOJIS = ['😊', '😂', '❤️', '👍', '🙌', '🙏', '😮', '😢', '👏', '💯', '🔥', '✨', '😎', '😅', '😍', '👀', '🤝', '✅']

  // Pre-fill textarea when editing a message
  useEffect(() => {
    if (editingMessage) {
      setMessageText(editingMessage.text)
      textareaRef.current?.focus()
    } else {
      setMessageText('')
    }
  }, [editingMessage?.id])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [messageText])

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return

    // If editing, call onEditComplete instead of sending a new message
    if (editingMessage && onEditComplete) {
      onEditComplete(messageText.trim())
      setMessageText('')
      return
    }

    setIsSending(true)
    const success = await sendMessage(messageText.trim(), replyingTo || undefined)
    setIsSending(false)

    if (success) {
      setMessageText('')
      onCancelReply()
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTyping = () => {
    setTypingStatus('typing')
    // Clear typing status after 3 seconds of inactivity
    const timer = setTimeout(() => setTypingStatus(null), 3000)
    return () => clearTimeout(timer)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large (max 10MB)')
      return
    }

    setIsUploading(true)
    setShowAttachmentMenu(false)
    const success = await sendMediaMessage(file)
    setIsUploading(false)
    
    if (!success) alert('Failed to upload file')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  // Voice Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' })
        
        if (chunks.length > 0 && !isRecording) { // If not recording means we didn't cancel
           await sendVoiceMessage(audioFile, recordingDuration)
        }
        stream.getTracks().forEach(track => track.stop())
      }

      setMediaRecorder(recorder)
      setIsRecording(true)
      setTypingStatus('recording_voice')
      setRecordingDuration(0)
      recorder.start()
      recordingTimerRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000)
    } catch (err) {
      alert('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setTypingStatus(null)
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      setIsRecording(false)
      setTypingStatus(null)
      mediaRecorder.stop()
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }

  return (
    <div className="bg-white border-t border-gray-100 p-3 md:p-4">
      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-2 bg-gray-50 rounded-xl border-l-4 border-emerald-500 overflow-hidden"
          >
            <div className="p-2 flex justify-between items-start">
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-600 mb-0.5">{replyingTo.senderName}</div>
                <div className="text-xs text-gray-500 truncate">{replyingTo.text}</div>
              </div>
              <button onClick={onCancelReply} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 max-w-5xl mx-auto relative">
        {/* Attachment Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className={`p-2.5 rounded-2xl transition-all ${showAttachmentMenu ? 'bg-emerald-50 text-emerald-600 scale-95' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showAttachmentMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full left-0 mb-4 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 p-2 min-w-[160px] z-50 overflow-hidden"
              >
                <button 
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-gray-700 hover:text-emerald-700 font-medium text-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><ImageIcon className="w-4 h-4" /></div>
                   Photo / Video
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3 hover:bg-sky-50 rounded-xl transition-colors text-gray-700 hover:text-sky-700 font-medium text-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600"><FileText className="w-4 h-4" /></div>
                  Document
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text Input Area */}
        <div className="flex-1 relative flex items-center bg-gray-100 rounded-2xl border border-transparent focus-within:border-emerald-500/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={messageText}
            onChange={(e) => { setMessageText(e.target.value); handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording..." : "Type a message..."}
            className="flex-1 bg-transparent py-3 pr-3 text-sm focus:outline-none resize-none max-h-[120px] scrollbar-none font-medium"
            disabled={isRecording || isSending || isUploading}
          />

          {isUploading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            </div>
          )}
        </div>

        {/* Send / Mic Button */}
        {messageText.trim() ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleSend}
            disabled={isSending || isUploading}
            className="p-3.5 rounded-2xl text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        ) : (
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={cancelRecording}
              className={`p-3.5 rounded-2xl transition-all flex-shrink-0 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                  : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              }`}
              style={!isRecording ? { backgroundColor: primaryColor } : {}}
            >
              <Mic className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Hidden Inputs */}
      <input type="file" hidden ref={imageInputRef} accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />
      <input type="file" hidden ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'document')} />

      {/* Emoji Palette Overlay (Simple placeholder for now) */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-4 right-4 md:left-auto md:right-auto md:w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 grid grid-cols-6 gap-2"
          >
             {EMOJIS.map(emoji => (
               <button 
                key={emoji} 
                className="text-2xl hover:bg-gray-50 rounded-lg p-2 transition-all active:scale-90"
                onClick={() => { setMessageText(p => p + emoji); setShowEmojiPicker(false); textareaRef.current?.focus(); }}
               >
                 {emoji}
               </button>
             ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Overlay */}
      <AnimatePresence>
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-full shadow-xl flex items-center gap-4 z-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="font-bold tabular-nums">
                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <button onClick={cancelRecording} className="flex items-center gap-1.5 text-sm font-bold hover:bg-white/10 px-2 py-1 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" /> Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
