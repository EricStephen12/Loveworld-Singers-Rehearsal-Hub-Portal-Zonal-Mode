'use client'

import { useZone } from '@/contexts/ZoneContext'
import { MessageCircle, Users, Search, Plus } from 'lucide-react'

export default function NoChatSelected() {
  const { currentZone } = useZone()

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Icon */}
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ 
            backgroundColor: `${currentZone?.themeColor || '#10b981'}20`
          }}
        >
          <MessageCircle 
            className="w-12 h-12"
            style={{ color: currentZone?.themeColor || '#10b981' }}
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Welcome to Messages
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Select a chat from the sidebar to start messaging, or create a new conversation with zone members.
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${currentZone?.themeColor || '#10b981'}20` }}
            >
              <Search 
                className="w-5 h-5"
                style={{ color: currentZone?.themeColor || '#10b981' }}
              />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Search Users</h4>
              <p className="text-sm text-gray-600">Find and message zone members</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${currentZone?.themeColor || '#10b981'}20` }}
            >
              <Plus 
                className="w-5 h-5"
                style={{ color: currentZone?.themeColor || '#10b981' }}
              />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Create Group</h4>
              <p className="text-sm text-gray-600">Start a group conversation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${currentZone?.themeColor || '#10b981'}20` }}
            >
              <Users 
                className="w-5 h-5"
                style={{ color: currentZone?.themeColor || '#10b981' }}
              />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Zone Members</h4>
              <p className="text-sm text-gray-600">
                {currentZone ? `Connect with ${currentZone.name} members` : 'Connect with your zone'}
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• Use the search button to find and message any user</li>
            <li>• Create groups for team discussions and planning</li>
            <li>• Share images and files in your conversations</li>
            <li>• All messages are secure and private to your zone</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
