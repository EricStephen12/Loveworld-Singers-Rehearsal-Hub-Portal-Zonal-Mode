import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

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
  const serverTimeOffsetRef = useRef<number>(0)

  // Serialize countdownData for stable dependency comparison
  const countdownKey = useMemo(() => {
    if (!countdownData) return ''
    return `${countdownData.days}-${countdownData.hours}-${countdownData.minutes}-${countdownData.seconds}`
  }, [countdownData?.days, countdownData?.hours, countdownData?.minutes, countdownData?.seconds])

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
      
      const offset = serverTime.getTime() - clientTime.getTime()
      setServerTimeOffset(offset)
      serverTimeOffsetRef.current = offset
      return serverTime
    } catch (err) {
      console.error('Error fetching server time:', err)
      setError('Failed to sync with server time')
      setServerTimeOffset(0)
      serverTimeOffsetRef.current = 0
      return new Date()
    }
  }

  const calculateTimeLeft = useCallback(() => {
    if (!targetDateRef.current) return

    const now = new Date()
    const syncedTime = new Date(now.getTime() + serverTimeOffsetRef.current)
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
  }, [])

  useEffect(() => {
    const initializeCountdown = async () => {
      setIsLoading(true)
      setError(null)

            if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      try {
        const serverTime = await fetchServerTime()
        let target: Date | null = null

        if (targetDate) {
          target = targetDate
        } else if (countdownData && (countdownData.days > 0 || countdownData.hours > 0 || countdownData.minutes > 0 || countdownData.seconds > 0)) {
          let storedTargetDate: string | null = null

          if (praiseNightId) {
            try {
              const countdownDoc = await FirebaseDatabaseService.getDocument('countdowns', praiseNightId.toString())
              if (countdownDoc && (countdownDoc as any).targetDate) {
                storedTargetDate = (countdownDoc as any).targetDate
              }
            } catch (error) {
            }
          }

          if (storedTargetDate) {
            target = new Date(storedTargetDate)
                        if (target.getTime() <= serverTime.getTime()) {
              // Recalculate target from countdownData
              const totalMs =
                (countdownData.days * 24 * 60 * 60 * 1000) +
                (countdownData.hours * 60 * 60 * 1000) +
                (countdownData.minutes * 60 * 1000) +
                (countdownData.seconds * 1000)

              target = new Date(serverTime.getTime() + totalMs)
              
                            if (praiseNightId) {
                try {
                  await FirebaseDatabaseService.updateDocument('countdowns', praiseNightId.toString(), {
                    targetDate: target.toISOString(),
                    updatedAt: new Date(),
                    praiseNightId: praiseNightId
                  })
                } catch (error) {
                  console.error('Failed to update target date:', error)
                }
              }
            }
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
        }
        
        if (!target) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
          setIsLoading(false)
          return
        }

        targetDateRef.current = target
        calculateTimeLeft()
        
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
  }, [praiseNightId, targetDate, countdownKey, calculateTimeLeft])

  // Sync with server every 30 seconds
  useEffect(() => {
    const syncInterval = setInterval(fetchServerTime, 30000)
    return () => clearInterval(syncInterval)
  }, [])

  return { timeLeft, isLoading, error, serverTimeOffset }
}
