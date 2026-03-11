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
    <div className="bg-[#f0f2f5] px-2 md:px-4 py-2 flex-shrink-0 min-w-0">
      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-2 bg-[#f0f2f5] rounded-xl overflow-hidden shadow-sm"
          >
            <div className="p-2 flex justify-between items-start bg-white/80 backdrop-blur">
              <div className="min-w-0 flex-1 border-l-4 border-emerald-500 pl-3">
                <div className="text-[13px] font-semibold text-emerald-600 mb-0.5 leading-tight">{replyingTo.senderName}</div>
                <div className="text-[13px] text-gray-500 truncate leading-tight">{replyingTo.text}</div>
              </div>
              <button onClick={onCancelReply} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100/50">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 max-w-5xl mx-auto relative min-w-0">
        {/* Text Input Area (Pill) */}
        <div className="flex-1 relative flex items-center bg-white rounded-[24px] border border-transparent shadow-sm px-1 py-1 transition-all min-h-[48px] min-w-0">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-12 h-12 flex items-center justify-center text-[#54656f] hover:text-emerald-600 transition-colors ml-1"
          >
            <Smile className="w-[26px] h-[26px]" />
          </button>
          
          <button 
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className={`w-12 h-12 flex items-center justify-center transition-colors ${showAttachmentMenu ? 'text-emerald-600' : 'text-[#54656f] hover:text-emerald-600'}`}
          >
            <Paperclip className="w-[24px] h-[24px]" />
          </button>

          <AnimatePresence>
            {showAttachmentMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-12 mb-3 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] p-2 min-w-[160px] z-50 overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-4 p-4">
                  <button 
                    onClick={() => { imageInputRef.current?.click(); setShowAttachmentMenu(false); }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-b from-[#bf59cf] to-[#922ea1] flex items-center justify-center text-white shadow-sm group-hover:-translate-y-1 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-gray-700 font-medium tracking-tight">Photos</span>
                  </button>
                  <button 
                    onClick={() => { fileInputRef.current?.click(); setShowAttachmentMenu(false); }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-b from-[#5157ae] to-[#5c6ce6] flex items-center justify-center text-white shadow-sm group-hover:-translate-y-1 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-gray-700 font-medium tracking-tight">Document</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            rows={1}
            value={messageText}
            onChange={(e) => { setMessageText(e.target.value); handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording..." : "Type a message"}
            className="flex-1 bg-transparent py-[10px] px-2 text-[15px] focus:outline-none resize-none max-h-[120px] scrollbar-none font-normal text-[#111b21] placeholder-[#8696a0] min-w-0"
            disabled={isRecording || isSending || isUploading}
          />

          {isUploading && (
            <div className="pr-3">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            </div>
          )}
        </div>

        {/* Send / Mic Button */}
        <div 
          className="flex-shrink-0 rounded-full w-[48px] h-[48px] flex items-center justify-center shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          {messageText.trim() ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleSend}
              disabled={isSending || isUploading}
              className="w-full h-full text-white flex items-center justify-center hover:bg-black/10 transition-colors rounded-full"
            >
              <Send className="w-[20px] h-[20px]" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={cancelRecording}
              className={`w-full h-full text-white flex items-center justify-center transition-colors rounded-full ${
                isRecording ? 'bg-red-500 animate-pulse' : 'hover:bg-black/10'
              }`}
            >
              <Mic className="w-[22px] h-[22px]" />
            </motion.button>
          )}
        </div>
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
            className="absolute bottom-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-fit px-4 md:px-6 py-3 bg-red-500 text-white rounded-full shadow-xl flex items-center gap-3 md:gap-4 z-50"
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
