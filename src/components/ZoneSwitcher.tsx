'use client'

import { useState } from 'react'
import { useZone } from '@/hooks/useZone'
import { ChevronDown, Check, Users, Loader2 } from 'lucide-react'

export default function ZoneSwitcher() {
  const { currentZone, userZones, isSuperAdmin, switchZone } = useZone()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  // Don't show if no zones or only 1 zone (no need to switch)
  if (!currentZone || userZones.length < 2) {
    return null
  }

  const handleZoneSwitch = async (zoneId: string) => {
    if (zoneId === currentZone.id) {
      setIsOpen(false)
      return
    }
    
    setIsSwitching(true)
    setIsOpen(false)
    
    console.log('🔄 Zone Switch: Starting switch to', zoneId)
    
    // Call switchZone which saves the preference
    const success = await switchZone(zoneId)
    
    if (success) {
      console.log('🔄 Zone Switch: Preference saved, reloading page...')
      
      // Clear all zone-specific caches before reload
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && !key.startsWith('lwsrh-user-zone-') && (
            key.includes('praise-nights') ||
            key.includes('songs-data') ||
            key.includes('categories') ||
            key.includes('calendar') ||
            key.includes('notifications') ||
            key.includes('members') ||
            key.includes('rehearsal') ||
            key.includes('media-cache')
          )) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k))
        console.log('🔄 Zone Switch: Cleared', keysToRemove.length, 'data caches')
      } catch (e) {
        console.error('Error clearing caches:', e)
      }
      
      // Reload the page to refresh all contexts with new zone
      window.location.reload()
    } else {
      setIsSwitching(false)
    }
  }

  return (
    <>
      {/* Switching Overlay */}
      {isSwitching && (
        <div className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium text-gray-700">Switching zone...</p>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Current Zone Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSwitching}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
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
                    onClick={() => handleZoneSwitch(zone.id)}
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
    </>
  )
}
