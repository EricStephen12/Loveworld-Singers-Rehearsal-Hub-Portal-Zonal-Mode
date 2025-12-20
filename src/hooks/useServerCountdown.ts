import { useState, useEffect, useRef } from 'react'

import { FirebaseDatabaseService } from '@/lib/firebase-database'

interface ServerTimeResponse {
  serverTime: string
  timestamp: number
  timezone: string
}

interface CountdownData {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface UseServerCountdownProps {
  targetDate?: Date
  countdownData?: CountdownData
  praiseNightId?: string | number
}

export function useServerCountdown({ 
  targetDate, 
  countdownData, 
  praiseNightId 
}: UseServerCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<CountdownData>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const targetDateRef = useRef<Date | null>(null)

  const fetchServerTime = async () => {
    try {
      const response = await fetch('/api/countdown', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (!response.ok) throw new Error('Failed to fetch server time')
      
      const data: ServerTimeResponse = await response.json()
      const serverTime = new Date(data.serverTime)
      const clientTime = new Date()
      
      setServerTimeOffset(serverTime.getTime() - clientTime.getTime())
      return serverTime
    } catch (err) {
      console.error('Error fetching server time:', err)
      setError('Failed to sync with server time')
      setServerTimeOffset(0)
      return new Date()
    }
  }

  const calculateTimeLeft = () => {
    if (!targetDateRef.current) return

    const now = new Date()
    const syncedTime = new Date(now.getTime() + serverTimeOffset)
    const difference = targetDateRef.current.getTime() - syncedTime.getTime()
    
    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  useEffect(() => {
    const initializeCountdown = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const serverTime = await fetchServerTime()
        let target: Date

        if (targetDate) {
          target = targetDate
        } else if (countdownData) {
          let storedTargetDate: string | null = null

          if (praiseNightId) {
            try {
              const countdownDoc = await FirebaseDatabaseService.getDocument('countdowns', praiseNightId.toString())
              if (countdownDoc && (countdownDoc as any).targetDate) {
                storedTargetDate = (countdownDoc as any).targetDate
              }
            } catch (error) {
              // Ignore - will calculate new target
            }
          }

          if (storedTargetDate) {
            target = new Date(storedTargetDate)
          } else {
            const totalMs =
              (countdownData.days * 24 * 60 * 60 * 1000) +
              (countdownData.hours * 60 * 60 * 1000) +
              (countdownData.minutes * 60 * 1000) +
              (countdownData.seconds * 1000)

            target = new Date(serverTime.getTime() + totalMs)

            if (praiseNightId) {
              try {
                await FirebaseDatabaseService.createDocument('countdowns', praiseNightId.toString(), {
                  targetDate: target.toISOString(),
                  createdAt: new Date(),
                  praiseNightId: praiseNightId
                })
              } catch (error) {
                console.error('Failed to store target date:', error)
              }
            }
          }
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
          setIsLoading(false)
          return
        }

        targetDateRef.current = target
        calculateTimeLeft()
        
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(calculateTimeLeft, 1000)
      } catch (err) {
        console.error('Error initializing countdown:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    initializeCountdown()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [praiseNightId])

  // Sync with server every 30 seconds
  useEffect(() => {
    const syncInterval = setInterval(fetchServerTime, 30000)
    return () => clearInterval(syncInterval)
  }, [])

  return { timeLeft, isLoading, error, serverTimeOffset }
}
