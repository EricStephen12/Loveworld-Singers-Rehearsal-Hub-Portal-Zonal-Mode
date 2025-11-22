'use client'

import { useState } from 'react'
import { useZone } from '@/contexts/ZoneContext'
import { ChevronDown, Check, Users } from 'lucide-react'

export default function ZoneSwitcher() {
  const { currentZone, userZones, switchZone, isSuperAdmin } = useZone()
  const [isOpen, setIsOpen] = useState(false)

  if (!currentZone || userZones.length <= 1) {
    return null // Don't show if user only has one zone
  }

  return (
    <div className="relative">
      {/* Current Zone Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: currentZone.themeColor }}
        />
        <div className="flex-1 text-left">
          <p className="text-xs text-gray-500">Current Zone</p>
          <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
            {currentZone.name}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl z-50 max-h-[400px] overflow-y-auto">
            {isSuperAdmin && (
              <div className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
                <p className="text-xs font-semibold text-yellow-800 flex items-center gap-1">
                  👑 Super Admin - All Zones
                </p>
              </div>
            )}
            
            <div className="py-2">
              {userZones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => {
                    switchZone(zone.id)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    currentZone.id === zone.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: zone.themeColor }}
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{zone.name}</p>
                    <p className="text-xs text-gray-500">{zone.region}</p>
                  </div>
                  {currentZone.id === zone.id && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Join Another Zone Button */}
            <div className="border-t border-gray-200 p-2">
              <a
                href="/pages/join-zone"
                className="w-full px-4 py-2.5 flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Users className="w-4 h-4" />
                Join Another Zone
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
