import { useState, useEffect, useCallback } from 'react'
import { pushNotificationService } from '@/services/pushNotificationService'

interface NotificationSettings {
  enabled: boolean
  sound: boolean
  vibration: boolean
  rehearsalReminders: boolean
  announcements: boolean
  systemUpdates: boolean
}

interface NotificationState {
  permission: 'granted' | 'denied' | 'default'
  isSupported: boolean
  isInitialized: boolean
  settings: NotificationSettings
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSupported: false,
    isInitialized: false,
    settings: {
      enabled: true,
      sound: true,
      vibration: true,
      rehearsalReminders: true,
      announcements: true,
      systemUpdates: true
    }
  })

  // Initialize notifications on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      const isSupported = pushNotificationService.isNotificationSupported()
      const permissionStatus = pushNotificationService.getPermissionStatus()
      const settings = pushNotificationService.getNotificationSettings()

      setState(prev => ({
        ...prev,
        isSupported,
        permission: permissionStatus.granted ? 'granted' : permissionStatus.denied ? 'denied' : 'default',
        settings
      }))

      if (isSupported && permissionStatus.granted) {
        const initialized = await pushNotificationService.initialize()
        setState(prev => ({ ...prev, isInitialized: initialized }))
      }
    }

    initializeNotifications()
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      return false
    }

    const granted = await pushNotificationService.requestPermission()
    const permissionStatus = pushNotificationService.getPermissionStatus()

    setState(prev => ({
      ...prev,
      permission: permissionStatus.granted ? 'granted' : permissionStatus.denied ? 'denied' : 'default'
    }))

    if (granted) {
      const initialized = await pushNotificationService.initialize()
      setState(prev => ({ ...prev, isInitialized: initialized }))
    }

    return granted
  }, [state.isSupported])

  // Update notification settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...state.settings, ...newSettings }
    pushNotificationService.saveNotificationSettings(updatedSettings)
    setState(prev => ({ ...prev, settings: updatedSettings }))
  }, [state.settings])

  // Send a test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!state.isInitialized || !state.settings.enabled) {
      return false
    }

    return pushNotificationService.sendSystemNotification({
      title: 'Test Notification',
      body: 'This is a test notification from LoveWorld Singers!',
      type: 'info'
    })
  }, [state.isInitialized, state.settings.enabled])

  // Send rehearsal reminder
  const sendRehearsalReminder = useCallback(async (rehearsalData: {
    title: string
    time: string
    location: string
    minutesUntil: number
  }): Promise<boolean> => {
    if (!state.isInitialized || !state.settings.enabled || !state.settings.rehearsalReminders) {
      return false
    }

    return pushNotificationService.sendRehearsalReminder(rehearsalData)
  }, [state.isInitialized, state.settings.enabled, state.settings.rehearsalReminders])

  // Send announcement
  const sendAnnouncement = useCallback(async (announcement: {
    title: string
    message: string
    priority: 'low' | 'medium' | 'high'
  }): Promise<boolean> => {
    if (!state.isInitialized || !state.settings.enabled || !state.settings.announcements) {
      return false
    }

    return pushNotificationService.sendAnnouncement(announcement)
  }, [state.isInitialized, state.settings.enabled, state.settings.announcements])

  // Send system notification
  const sendSystemNotification = useCallback(async (message: {
    title: string
    body: string
    type: 'info' | 'success' | 'warning' | 'error'
  }): Promise<boolean> => {
    if (!state.isInitialized || !state.settings.enabled || !state.settings.systemUpdates) {
      return false
    }

    return pushNotificationService.sendSystemNotification(message)
  }, [state.isInitialized, state.settings.enabled, state.settings.systemUpdates])

  // Clear all notifications
  const clearAllNotifications = useCallback(async (): Promise<void> => {
    await pushNotificationService.clearAllNotifications()
  }, [])

  // Schedule a notification
  const scheduleNotification = useCallback((payload: {
    title: string
    body: string
    icon?: string
    data?: any
  }, delay: number): void => {
    if (!state.isInitialized || !state.settings.enabled) {
      return
    }

    pushNotificationService.scheduleNotification(payload, delay)
  }, [state.isInitialized, state.settings.enabled])

  return {
    // State
    permission: state.permission,
    isSupported: state.isSupported,
    isInitialized: state.isInitialized,
    settings: state.settings,
    
    // Actions
    requestPermission,
    updateSettings,
    sendTestNotification,
    sendRehearsalReminder,
    sendAnnouncement,
    sendSystemNotification,
    clearAllNotifications,
    scheduleNotification,
    
    // Computed
    canSendNotifications: state.isSupported && state.permission === 'granted' && state.isInitialized && state.settings.enabled,
    needsPermission: state.isSupported && state.permission === 'default',
    isBlocked: state.isSupported && state.permission === 'denied'
  }
}

