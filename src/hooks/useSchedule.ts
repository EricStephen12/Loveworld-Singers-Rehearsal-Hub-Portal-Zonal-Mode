'use client'

import { useState, useEffect, useCallback } from 'react'
import { useZone } from './useZone'
import {
    ScheduleCategoryService,
    ScheduleSongService,
    ScheduleProgramService,
    ScheduleCategory,
    ScheduleSong,
    ScheduleProgram,
} from '@/lib/schedule-service'

interface UseScheduleReturn {
    categories: ScheduleCategory[]
    songs: Record<string, ScheduleSong[]>   // keyed by categoryId
    program: ScheduleProgram | null
    isLoading: boolean
    loadSongsForCategory: (categoryId: string) => Promise<void>
    refetchCategories: () => Promise<void>
    refetchProgram: () => Promise<void>
}

export function useSchedule(): UseScheduleReturn {
    const { currentZone } = useZone()
    const zoneId = currentZone?.id ?? null

    const [categories, setCategories] = useState<ScheduleCategory[]>([])
    const [songs, setSongs] = useState<Record<string, ScheduleSong[]>>({})
    const [program, setProgram] = useState<ScheduleProgram | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchCategories = useCallback(async () => {
        setIsLoading(true)
        try {
            const cats = await ScheduleCategoryService.getCategories(zoneId)
            setCategories(cats)
        } catch (e) {
            console.error('useSchedule: error fetching categories', e)
        } finally {
            setIsLoading(false)
        }
    }, [zoneId])

    const fetchProgram = useCallback(async () => {
        try {
            const prog = await ScheduleProgramService.getProgram(zoneId)
            setProgram(prog)
        } catch (e) {
            console.error('useSchedule: error fetching program', e)
        }
    }, [zoneId])

    const loadSongsForCategory = useCallback(async (categoryId: string) => {
        if (songs[categoryId]) return   // already loaded
        try {
            const list = await ScheduleSongService.getSongs(categoryId, zoneId)
            setSongs(prev => ({ ...prev, [categoryId]: list }))
        } catch (e) {
            console.error('useSchedule: error fetching songs', e)
        }
    }, [zoneId, songs])

    useEffect(() => {
        if (zoneId !== undefined) {
            fetchCategories()
            fetchProgram()
        }
    }, [zoneId])

    return {
        categories,
        songs,
        program,
        isLoading,
        loadSongsForCategory,
        refetchCategories: fetchCategories,
        refetchProgram: fetchProgram,
    }
}
