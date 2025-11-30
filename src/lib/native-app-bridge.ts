/**
 * Native App Bridge Utilities
 * 
 * This file contains utilities for communication between the Next.js web app
 * and React Native WebView wrapper.
 * 
 * HOW IT WORKS:
 * 1. React Native injects `window.IS_NATIVE_APP = true` before page loads
 * 2. Web app detects this and uses native bridge instead of web popups
 * 3. Web app sends messages via `window.ReactNativeWebView.postMessage()`
 * 4. React Native handles OAuth natively and injects tokens back
 * 5. Web app receives tokens via `window.onNativeKingsChatAuth()` callback
 */

// Message types for native bridge communication
export type NativeMessageType = 
  | 'KINGSCHAT_LOGIN_REQUEST'
  | 'KINGSCHAT_LOGIN_SUCCESS'
  | 'KINGSCHAT_LOGIN_CANCELLED'
  | 'KINGSCHAT_LOGIN_ERROR'
  | 'LOGOUT_REQUEST'
  | 'SHARE_REQUEST'
  | 'OPEN_EXTERNAL_URL'

export interface NativeMessage {
  type: NativeMessageType
  data?: any
}

/**
 * Check if running inside React Native WebView
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window.IS_NATIVE_APP || window.ReactNativeWebView)
}

/**
 * Check if running as installed PWA
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

/**
 * Get the current platform
 */
export function getPlatform(): 'native' | 'pwa' | 'browser' {
  if (isNativeApp()) return 'native'
  if (isPWA()) return 'pwa'
  return 'browser'
}

/**
 * Send message to React Native app
 */
export function postMessageToNative(type: NativeMessageType, data?: any): boolean {
  if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }))
    return true
  }
  return false
}

/**
 * Request native app to open external URL (e.g., for OAuth)
 */
export function openExternalUrl(url: string): void {
  if (isNativeApp()) {
    postMessageToNative('OPEN_EXTERNAL_URL', { url })
  } else {
    window.open(url, '_blank')
  }
}

/**
 * Request native share dialog
 */
export function requestNativeShare(title: string, text: string, url?: string): void {
  if (isNativeApp()) {
    postMessageToNative('SHARE_REQUEST', { title, text, url })
  } else if (navigator.share) {
    navigator.share({ title, text, url })
  }
}

/**
 * Initialize native app bridge listeners
 * Call this once on app startup
 */
export function initNativeAppBridge(): void {
  if (typeof window === 'undefined') return
  
  // Log platform detection
  console.log('🌐 Platform:', getPlatform())
  console.log('📱 Is Native App:', isNativeApp())
  console.log('📲 Is PWA:', isPWA())
}

// Auto-initialize on import (client-side only)
if (typeof window !== 'undefined') {
  initNativeAppBridge()
}
