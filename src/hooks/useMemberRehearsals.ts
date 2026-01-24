import { useState, useEffect, useCallback } from 'react'

import { useZone } from './useZone'
import { useAuth } from './useAuth'
import { SubGroupDatabaseService } from '@/lib/subgroup-database-service'

export interface CombinedRehearsal {
  id: string
  name: string
  date: string
  location?: string
  description?: string
  scope: 'zone' | 'subgroup'
  scopeLabel: string
  subGroupId?: string
  subGroupName?: string
  zoneId: string
  createdAt: Date
}

export interface UseMemberRehearsalsReturn {
  rehearsals: CombinedRehearsal[]
  zoneRehearsals: CombinedRehearsal[]
  subGroupRehearsals: CombinedRehearsal[]
  loading: boolean
  error: string | null
  filter: 'all' | 'zone' | 'subgroup'
  setFilter: (filter: 'all' | 'zone' | 'subgroup') => void
  refresh: () => Promise<void>
}

export function useMemberRehearsals(): UseMemberRehearsalsReturn {
  const { currentZone } = useZone()
  const { user } = useAuth()
  
  const [rehearsals, setRehearsals] = useState<CombinedRehearsal[]>([])
  const [zoneRehearsals, setZoneRehearsals] = useState<CombinedRehearsal[]>([])
  const [subGroupRehearsals, setSubGroupRehearsals] = useState<CombinedRehearsal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'zone' | 'subgroup'>('all')

  const loadRehearsals = useCallback(async () => {
    if (!currentZone?.id || !user?.uid) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await SubGroupDatabaseService.getMemberRehearsals(
        currentZone.id,
        user.uid
      )

      setZoneRehearsals(result.zoneRehearsals as CombinedRehearsal[])
      setSubGroupRehearsals(result.subGroupRehearsals as CombinedRehearsal[])
      setRehearsals(result.combined as CombinedRehearsal[])
    } catch (err) {
      console.error('Error loading rehearsals:', err)
      setError('Failed to load rehearsals')
    } finally {
      setLoading(false)
    }
  }, [currentZone?.id, user?.uid])

  useEffect(() => {
    loadRehearsals()
  }, [loadRehearsals])

  const getFilteredRehearsals = useCallback(() => {
    switch (filter) {
      case 'zone': return zoneRehearsals
      case 'subgroup': return subGroupRehearsals
      default: return rehearsals
    }
  }, [filter, rehearsals, zoneRehearsals, subGroupRehearsals])

  return {
    rehearsals: getFilteredRehearsals(),
    zoneRehearsals,
    subGroupRehearsals,
    loading,
    error,
    filter,
    setFilter,
    refresh: loadRehearsals
  }
}
