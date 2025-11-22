'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, LogOut, AlertCircle } from 'lucide-react'
import { useZone } from '@/contexts/ZoneContext'

type DrawerItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  href?: string
  badge?: boolean | null
  onClick?: () => void
}

type DrawerSection = {
  title: string
  items: DrawerItem[]
}

type SharedDrawerProps = {
  open: boolean
  onClose: () => void
  title?: string
  items: DrawerItem[]
  customSections?: DrawerSection[]
  fixedOnDesktop?: boolean
}

export default function SharedDrawer({ open, onClose, title = 'Menu', items, customSections = [], fixedOnDesktop = false }: SharedDrawerProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [logoutCallback, setLogoutCallback] = useState<(() => void) | null>(null)
  const router = useRouter()
  const { currentZone } = useZone()
  
  // Get zone colors
  const zoneColors = {
    primary: currentZone?.themeColor || '#16a34a',
    secondary: currentZone?.themeColor || '#15803d',
    accent: currentZone?.themeColor || '#22c55e'
  }
  // Render drawer content
  const renderDrawerContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/80">
        <button 
          onClick={onClose}
          className="text-xl font-outfit-semibold text-gray-900 hover:text-gray-700 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0"
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          aria-label="Close menu"
        >
          {title}
        </button>
        <button 
          onClick={onClose}
          className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 focus:border-0"
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Items */}
      <div className="py-1">
        {(items || []).map((item, index) => {
          const MenuItem: any = item.onClick ? 'button' : Link

          // Special handling for logout and refresh
          const isLogout = item.title.toLowerCase() === 'logout'
          const isRefresh = item.title.toLowerCase() === 'refresh app'
          
          // Debug logging for refresh button
          if (isRefresh) {
            console.log('🔄 Rendering refresh button:', { title: item.title, hasIcon: !!item.icon, hasOnClick: !!item.onClick });
          }
              const commonProps = item.onClick
            ? {
                onClick: () => {
                  console.log('🔗 Menu item clicked (onClick):', item.title);
                  if (isLogout) {
                    // Show confirmation modal for logout
                    setLogoutCallback(() => item.onClick)
                    setShowLogoutModal(true)
                  } else {
                    item.onClick?.()
                    onClose()
                  }
                }
              }
            : { 
                href: item.href || '#', 
                onClick: (e: any) => {
                  console.log('🔗 Menu item clicked (href):', item.title, 'href:', item.href);
                  
                  // If href is '#', prevent navigation
                  if (item.href === '#') {
                    e.preventDefault();
                    console.log('🚫 Prevented navigation for placeholder link');
                    return;
                  }
                  
                  // Close drawer first
                  onClose();
                  
                  // Use router for navigation
                  if (item.href && item.href !== '#') {
                    console.log('🚀 Navigating to:', item.href);
                    router.push(item.href);
                  }
                }
              }

          return (
            <MenuItem
              key={index}
              {...commonProps}
              className={`flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/80 transition-all duration-200 active:bg-gray-100/80 w-full text-left group ${
                isLogout
                  ? 'text-red-600 hover:bg-red-50/80 active:bg-red-100/80'
                  : isRefresh
                  ? 'text-blue-600 hover:bg-blue-50/80 active:bg-blue-100/80'
                  : 'text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isLogout
                      ? 'bg-red-100/80 group-hover:bg-red-200/80'
                      : isRefresh
                      ? 'bg-blue-100/80 group-hover:bg-blue-200/80'
                      : 'group-hover:opacity-80'
                  }`}
                  style={!isLogout && !isRefresh ? {
                    backgroundColor: `${zoneColors.primary}20`,
                  } : {}}
                >
                  <item.icon 
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isLogout ? 'text-red-600' : isRefresh ? 'text-blue-600' : ''
                    }`}
                    style={!isLogout && !isRefresh ? {
                      color: zoneColors.primary
                    } : {}}
                  />
                </div>
                <span className="text-sm font-poppins-medium">{item.title}</span>
              </div>
              {item.badge && (
                <div className="relative">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full w-3 h-3 shadow-lg border border-white animate-pulse"></div>
                  <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                </div>
              )}
            </MenuItem>
          )
        })}
      </div>

      {/* Custom Sections */}
      {(customSections || []).map((section, sectionIndex) => (
        <div key={sectionIndex} className="border-t border-gray-100/80">
          <div className="px-6 py-3">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{section.title}</h3>
          </div>
          <div className="py-1">
            {(section.items || []).map((item, index) => {
              const MenuItem: any = item.onClick ? 'button' : Link
              const commonProps = item.onClick 
                ? { onClick: () => { item.onClick?.(); onClose(); } }
                : { 
                    href: item.href || '#', 
                    onClick: (e: any) => {
                      if (item.href === '#') {
                        e.preventDefault();
                        return;
                      }
                      onClose();
                      if (item.href && item.href !== '#') {
                        router.push(item.href);
                      }
                    }
                  }

              return (
                <MenuItem
                  key={index}
                  {...commonProps}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/80 transition-all duration-200 active:bg-gray-100/80 w-full text-left group text-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:opacity-80"
                      style={{
                        backgroundColor: `${zoneColors.primary}20`,
                      }}
                    >
                      <item.icon 
                        className="w-4 h-4 transition-colors duration-200"
                        style={{
                          color: zoneColors.primary
                        }}
                      />
                    </div>
                    <span className="text-sm font-poppins-medium">{item.title}</span>
                  </div>
                  {item.badge && (
                    <div className="relative">
                      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full w-3 h-3 shadow-lg border border-white animate-pulse"></div>
                      <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                  )}
                </MenuItem>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )

  // Fixed desktop mode - always visible on desktop, hidden on mobile
  if (fixedOnDesktop) {
    return (
      <div className="hidden lg:block fixed left-0 top-0 w-80 h-full bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 z-40 overflow-y-auto">
        {renderDrawerContent()}
      </div>
    )
  }

  // Mobile mode - popup drawer (works on all screen sizes)
  return (
    <>
      <div className={`fixed inset-0 z-50 transform transition-all duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Backdrop with blur */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer Content */}
        <div className="relative w-80 max-w-sm h-full bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 overflow-y-auto" data-drawer>
          {renderDrawerContent()}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Logout Confirmation
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to logout?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false)
                  onClose()
                  logoutCallback?.()
                }}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}



