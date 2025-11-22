'use client'

import { useState, useRef } from 'react'
import { useChat } from '../_context/ChatContext'
import { useZone } from '@/contexts/ZoneContext'
import { Send, Image, Paperclip, Smile } from 'lucide-react'

export default function MessageInput() {
  const { sendMessage, selectedChat } = useChat()
  const { currentZone } = useZone()
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim() || !selectedChat || isLoading) return

    setIsLoading(true)
    
    try {
      await sendMessage({ text: text.trim() })
      setText('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedChat) return

    setIsLoading(true)
    
    try {
      // TODO: Upload to Cloudinary
      const imageUrl = URL.createObjectURL(file)
      await sendMessage({ image: imageUrl })
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsLoading(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedChat) return

    setIsLoading(true)
    
    try {
      // TODO: Upload to Cloudinary
      const fileUrl = URL.createObjectURL(file)
      await sendMessage({ 
        fileUrl, 
        fileName: file.name 
      })
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  if (!selectedChat) return null

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Attachment buttons */}
        <div className="flex items-center gap-1">
          {/* Image upload */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Image className="w-5 h-5" />
          </button>
          
          {/* File upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${selectedChat.type === 'group' ? selectedChat.name : 'user'}...`}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 max-h-32 min-h-[48px]"
            style={{ 
              ...(currentZone?.themeColor && {
                '--tw-ring-color': currentZone.themeColor
              } as any)
            }}
            rows={1}
          />
          
          {/* Emoji button */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="p-3 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg"
          style={{ 
            backgroundColor: currentZone?.themeColor || '#10b981'
          }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
        />
      </form>
    </div>
  )
}
