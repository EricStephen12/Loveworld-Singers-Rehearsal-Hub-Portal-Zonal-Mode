'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Plus, Trash2, Edit, Save, X, Music, Sparkles, Heart, User,
    Calendar, ChevronDown, ChevronUp, Loader2, RefreshCw
} from 'lucide-react'
import {
    ScheduleCategoryService,
    ScheduleSongService,
    ScheduleProgramService,
    ScheduleCategory,
    ScheduleSong,
    ScheduleProgram,
} from '@/lib/schedule-service'
import { useZone } from '@/hooks/useZone'

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_OPTIONS = [
    { name: 'Music', icon: Music },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Heart', icon: Heart },
    { name: 'User', icon: User },
    { name: 'Calendar', icon: Calendar },
]

const COLOR_OPTIONS = [
    { label: 'Purple', color: 'bg-purple-100', iconColor: 'text-purple-600' },
    { label: 'Indigo', color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    { label: 'Pink', color: 'bg-pink-100', iconColor: 'text-pink-600' },
    { label: 'Amber', color: 'bg-amber-100', iconColor: 'text-amber-600' },
    { label: 'Emerald', color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { label: 'Blue', color: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Rose', color: 'bg-rose-100', iconColor: 'text-rose-600' },
]

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
    return (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {message}
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ScheduleManagerSection() {
    const { currentZone, userRole } = useZone()
    const zoneId = currentZone?.id ?? null

    const canEdit = ['super_admin', 'hq_admin', 'zone_coordinator'].includes(userRole)

    const [categories, setCategories] = useState<ScheduleCategory[]>([])
    const [songs, setSongs] = useState<Record<string, ScheduleSong[]>>({})
    const [program, setProgram] = useState<ScheduleProgram | null>(null)
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

    // Category form
    const [showCatForm, setShowCatForm] = useState(false)
    const [editingCat, setEditingCat] = useState<ScheduleCategory | null>(null)
    const [catForm, setCatForm] = useState({ label: '', description: '', icon: 'Music', color: 'bg-purple-100', iconColor: 'text-purple-600' })
    const [savingCat, setSavingCat] = useState(false)

    // Song form
    const [showSongForm, setShowSongForm] = useState<string | null>(null) // categoryId
    const [editingSong, setEditingSong] = useState<ScheduleSong | null>(null)
    const [songForm, setSongForm] = useState({ title: '', writer: '', leadSinger: '', rehearsalCount: 1, dateReceived: new Date().toISOString().split('T')[0] })
    const [savingSong, setSavingSong] = useState(false)

    // Program form
    const [editingProgram, setEditingProgram] = useState(false)
    const [programForm, setProgramForm] = useState({ program: '', date: '', time: '', dailyTarget: '' })
    const [savingProgram, setSavingProgram] = useState(false)

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const loadData = useCallback(async () => {
        setLoading(true)
        const [cats, prog] = await Promise.all([
            ScheduleCategoryService.getCategories(zoneId),
            ScheduleProgramService.getProgram(zoneId),
        ])
        setCategories(cats)

        // Auto-load daily songs
        const daily = cats.find(c => c.label === 'Daily Schedule')
        if (daily) {
            const list = await ScheduleSongService.getSongs(daily.id, zoneId)
            setSongs(prev => ({ ...prev, [daily.id]: list }))
        }

        setProgram(prog)
        if (prog) setProgramForm({ program: prog.program, date: prog.date, time: prog.time, dailyTarget: prog.dailyTarget })
        setLoading(false)
    }, [zoneId])

    const loadSongs = useCallback(async (categoryId: string) => {
        if (songs[categoryId]) return
        const list = await ScheduleSongService.getSongs(categoryId, zoneId)
        setSongs(prev => ({ ...prev, [categoryId]: list }))
    }, [zoneId, songs])

    useEffect(() => { loadData() }, [loadData])

    // ── Category CRUD ──────────────────────────────────────────────────────────

    const openAddCat = () => {
        setEditingCat(null)
        setCatForm({ label: '', description: '', icon: 'Music', color: 'bg-purple-100', iconColor: 'text-purple-600' })
        setShowCatForm(true)
    }

    const openEditCat = (cat: ScheduleCategory) => {
        setEditingCat(cat)
        setCatForm({ label: cat.label, description: cat.description, icon: cat.icon, color: cat.color, iconColor: cat.iconColor })
        setShowCatForm(true)
    }

    const saveCat = async () => {
        if (!catForm.label.trim()) return showToast('Label is required', 'error')
        setSavingCat(true)

        try {
            if (editingCat) {
                await ScheduleCategoryService.updateCategory(editingCat.id, catForm)
                // Update local state
                setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, ...catForm } : c))
                showToast('Category updated!')
            } else {
                const newId = await ScheduleCategoryService.addCategory({
                    ...catForm,
                    zoneId,
                    order: categories.length,
                    isActive: true,
                    createdBy: 'admin',
                }, zoneId)

                if (newId) {
                    // Add to local state immediately
                    const newCat: ScheduleCategory = {
                        id: newId,
                        zoneId,
                        ...catForm,
                        order: categories.length,
                        isActive: true,
                        createdAt: new Date().toISOString(), // Temporary
                        updatedAt: new Date().toISOString(), // Temporary
                        createdBy: 'admin'
                    }
                    setCategories(prev => [...prev, newCat])
                    showToast('Category added!')
                }
            }
        } catch (err) {
            console.error(err)
            showToast('Failed to save category', 'error')
        }

        setSavingCat(false)
        setShowCatForm(false)
    }

    const deleteCat = async (id: string) => {
        if (!confirm('Delete this category? Songs inside will remain but the category will be hidden.')) return

        // Optimistic delete
        const oldCats = [...categories]
        setCategories(prev => prev.filter(c => c.id !== id))

        const success = await ScheduleCategoryService.deleteCategory(id)
        if (success) {
            showToast('Category removed')
        } else {
            setCategories(oldCats) // Revert if failed
            showToast('Failed to remove category', 'error')
        }
    }

    // ── Song CRUD ──────────────────────────────────────────────────────────────

    const openAddSong = (categoryId: string) => {
        setEditingSong(null)
        setSongForm({ title: '', writer: '', leadSinger: '', rehearsalCount: 1, dateReceived: new Date().toISOString().split('T')[0] })
        setShowSongForm(categoryId)
    }

    const openEditSong = (song: ScheduleSong) => {
        setEditingSong(song)
        setSongForm({
            title: song.title,
            writer: song.writer,
            leadSinger: song.leadSinger,
            rehearsalCount: song.rehearsalCount,
            dateReceived: song.dateReceived?.split('T')[0] || new Date().toISOString().split('T')[0],
        })
        setShowSongForm(song.categoryId)
    }

    const saveSong = async (categoryId: string) => {
        if (!songForm.title.trim()) return showToast('Song title is required', 'error')
        setSavingSong(true)

        try {
            if (editingSong) {
                await ScheduleSongService.updateSong(editingSong.id, {
                    ...songForm,
                    dateReceived: new Date(songForm.dateReceived).toISOString(),
                })

                // Update local state
                setSongs(prev => ({
                    ...prev,
                    [categoryId]: prev[categoryId].map(s => s.id === editingSong.id ? {
                        ...s,
                        ...songForm,
                        dateReceived: new Date(songForm.dateReceived).toISOString()
                    } : s)
                }))

                showToast('Song updated!')
            } else {
                const newId = await ScheduleSongService.addSong({
                    ...songForm,
                    categoryId,
                    zoneId,
                    order: (songs[categoryId]?.length || 0),
                    dateReceived: new Date(songForm.dateReceived).toISOString(),
                    createdBy: 'admin',
                }, zoneId)

                if (newId) {
                    const newSong: ScheduleSong = {
                        id: newId,
                        categoryId,
                        zoneId,
                        ...songForm,
                        order: (songs[categoryId]?.length || 0),
                        dateReceived: new Date(songForm.dateReceived).toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        createdBy: 'admin'
                    }

                    setSongs(prev => ({
                        ...prev,
                        [categoryId]: [...(prev[categoryId] || []), newSong]
                    }))

                    showToast('Song added!')
                }
            }
        } catch (err) {
            console.error(err)
            showToast('Failed to save song', 'error')
        }

        setSavingSong(false)
        setShowSongForm(null)
    }

    const deleteSong = async (song: ScheduleSong) => {
        if (!confirm(`Delete "${song.title}"?`)) return

        // Optimistic delete
        const oldSongs = { ...songs }
        setSongs(prev => ({
            ...prev,
            [song.categoryId]: prev[song.categoryId].filter(s => s.id !== song.id)
        }))

        const success = await ScheduleSongService.deleteSong(song.id)

        if (success) {
            showToast('Song deleted')
        } else {
            setSongs(oldSongs) // Revert
            showToast('Failed to delete song', 'error')
        }
    }

    // ── Program CRUD ───────────────────────────────────────────────────────────

    const saveProgram = async () => {
        setSavingProgram(true)
        await ScheduleProgramService.updateProgram({ ...programForm, zoneId, updatedBy: 'admin' }, zoneId)
        showToast('Program info saved!')

        // Update local state
        setProgram(prev => ({
            ...(prev || {}),
            ...programForm,
            updatedAt: new Date().toISOString(),
            id: prev?.id || 'temp-id',
            zoneId: zoneId
        } as ScheduleProgram))

        setSavingProgram(false)
        setEditingProgram(false)
        // No need to reloadData() if we updated local state
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    // ── Daily Schedule Logic ───────────────────────────────────────────────────
    const [dailyCategory, setDailyCategory] = useState<ScheduleCategory | null>(null)
    const [standardCategories, setStandardCategories] = useState<ScheduleCategory[]>([])

    // Filter categories into Daily vs Standard
    useEffect(() => {
        const daily = categories.find(c => c.label === 'Daily Schedule') || null
        setDailyCategory(daily)
        setStandardCategories(categories.filter(c => c.label !== 'Daily Schedule'))
    }, [categories])

    // Ensure Daily Category exists
    const ensureDailyCategory = async (): Promise<string | null> => {
        if (dailyCategory) return dailyCategory.id

        // Create it
        try {
            const newId = await ScheduleCategoryService.addCategory({
                label: 'Daily Schedule',
                description: 'Songs for the current daily schedule',
                icon: 'Calendar',
                color: 'bg-indigo-100',
                iconColor: 'text-indigo-600',
                zoneId,
                order: 999, // Always last
                isActive: true,
                createdBy: 'admin',
            }, zoneId)

            if (newId) {
                const newCat: ScheduleCategory = {
                    id: newId,
                    zoneId,
                    label: 'Daily Schedule',
                    description: 'Songs for the current daily schedule',
                    icon: 'Calendar',
                    color: 'bg-indigo-100',
                    iconColor: 'text-indigo-600',
                    order: 999,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'admin'
                }
                setCategories(prev => [...prev, newCat])
                return newId
            }
        } catch (e) {
            console.error(e)
            showToast('Failed to create Daily Schedule category', 'error')
        }
        return null
    }

    // Wrapped saveSong to handle Daily Schedule creation
    const handleSaveDailySong = async () => {
        const catId = await ensureDailyCategory()
        if (catId) saveSong(catId)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
        )
    }


    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* ── Daily Schedule Section ──────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-indigo-50/30">
                    <div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            <h3 className="font-semibold text-slate-900 text-sm">Daily Schedule</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Manage program info & songs for the day</p>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {/* Program Info Form */}
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Program Details</h4>
                            {canEdit && !editingProgram && (
                                <button onClick={() => setEditingProgram(true)} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                                    <Edit className="w-3 h-3" /> Edit Info
                                </button>
                            )}
                        </div>

                        {editingProgram ? (
                            <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs text-slate-500 font-medium block mb-1">Program</label>
                                        <input value={programForm.program} onChange={e => setProgramForm(p => ({ ...p, program: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Praise Night Rehearsal" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs text-slate-500 font-medium block mb-1">Date</label>
                                        <input type="date" value={programForm.date} onChange={e => setProgramForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs text-slate-500 font-medium block mb-1">Time</label>
                                        <input type="time" value={programForm.time} onChange={e => setProgramForm(p => ({ ...p, time: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs text-slate-500 font-medium block mb-1">Daily Target</label>
                                        <input value={programForm.dailyTarget} onChange={e => setProgramForm(p => ({ ...p, dailyTarget: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Perfect all praise songs..." />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={saveProgram} disabled={savingProgram} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-60">
                                        {savingProgram ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save Details
                                    </button>
                                    <button onClick={() => setEditingProgram(false)} className="text-xs font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">Cancel</button>
                                </div>
                            </div>
                        ) : program ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <InfoCard label="Program" value={program.program} />
                                <InfoCard label="Date" value={new Date(program.date).toDateString()} />
                                <InfoCard label="Time" value={program.time} />
                                <InfoCard label="Daily Target" value={program.dailyTarget} accent />
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-2">No program info set.</p>
                        )}
                    </div>

                    {/* Daily Songs */}
                    <div className="p-5 pt-2">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Songs</h4>
                        </div>

                        {/* Song List */}
                        <div className="space-y-1">
                            {dailyCategory && songs[dailyCategory.id]?.length > 0 ? (
                                songs[dailyCategory.id].map((song, idx) => (
                                    <div key={song.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                                        <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 leading-tight">{song.title}</p>
                                            <p className="text-xs text-slate-500">by {song.writer} · Lead: {song.leadSinger}</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">x{song.rehearsalCount}</span>
                                        {canEdit && (
                                            <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditSong(song)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-indigo-600">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deleteSong(song)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-xs text-slate-400">No songs added to today's schedule yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Add Song Button - Special for Daily */}
                        {canEdit && (
                            <div className="mt-4">
                                {showSongForm === 'DAILY_TEMP' ? (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-indigo-100">
                                        <h4 className="text-xs font-semibold text-indigo-700 mb-3">{editingSong ? 'Edit Daily Song' : 'Add Song to Daily Schedule'}</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <label className="text-xs text-slate-500 font-medium block mb-1">Song Title *</label>
                                                <input value={songForm.title} onChange={e => setSongForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Unstoppable" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 font-medium block mb-1">Writer</label>
                                                <input value={songForm.writer} onChange={e => setSongForm(p => ({ ...p, writer: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Sis Uchemelody" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 font-medium block mb-1">Lead Singer</label>
                                                <input value={songForm.leadSinger} onChange={e => setSongForm(p => ({ ...p, leadSinger: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Sis Uchemelody" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 font-medium block mb-1">Rehearsal Count</label>
                                                <input type="number" min={1} value={songForm.rehearsalCount} onChange={e => setSongForm(p => ({ ...p, rehearsalCount: parseInt(e.target.value) || 1 }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 font-medium block mb-1">Date Received</label>
                                                <input type="date" value={songForm.dateReceived} onChange={e => setSongForm(p => ({ ...p, dateReceived: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={handleSaveDailySong} disabled={savingSong} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-60">
                                                {savingSong ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save Song
                                            </button>
                                            <button onClick={() => setShowSongForm(null)} className="text-xs font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={async () => {
                                        let catId = await ensureDailyCategory() || '' // Ensure cat exists before opening (or just use temp ID)
                                        // Actually better to just set showSongForm to a temp flag and create on save
                                        // But we need to know the category ID to query songs... which 'loadSongs' does.
                                        // In 'loadData', if we found 'Daily Schedule', we loaded it.
                                        // If not, we haven't loaded songs (empty array).
                                        // So if we add, we'll create category then add song.
                                        setEditingSong(null)
                                        setSongForm({ title: '', writer: '', leadSinger: '', rehearsalCount: 1, dateReceived: new Date().toISOString().split('T')[0] })
                                        setShowSongForm('DAILY_TEMP')
                                    }} className="w-full py-2.5 rounded-xl border border-dashed border-indigo-200 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                        <Plus className="w-3.5 h-3.5" /> Add Song to Daily Schedule
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Category Manager (Standard) ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div>
                        <h3 className="font-semibold text-slate-900 text-sm">Schedule Categories</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{standardCategories.length} categories · click to manage songs</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={loadData} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        {canEdit && (
                            <button onClick={openAddCat} className="flex items-center gap-1.5 text-xs font-medium text-white bg-purple-600 px-3 py-1.5 rounded-full hover:bg-purple-700 transition-colors">
                                <Plus className="w-3 h-3" /> Add Category
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Form */}
                {showCatForm && (
                    <div className="px-5 py-4 bg-purple-50/50 border-b border-purple-100">
                        <h4 className="text-xs font-semibold text-purple-700 mb-3">{editingCat ? 'Edit Category' : 'New Category'}</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 font-medium block mb-1">Label *</label>
                                <input value={catForm.label} onChange={e => setCatForm(p => ({ ...p, label: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="New Praise Songs" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-slate-500 font-medium block mb-1">Description</label>
                                <input value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="Weekly praise song selections" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-medium block mb-1">Icon</label>
                                <select value={catForm.icon} onChange={e => setCatForm(p => ({ ...p, icon: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                                    {ICON_OPTIONS.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-medium block mb-1">Color</label>
                                <select value={catForm.color} onChange={e => {
                                    const opt = COLOR_OPTIONS.find(o => o.color === e.target.value)
                                    setCatForm(p => ({ ...p, color: e.target.value, iconColor: opt?.iconColor || p.iconColor }))
                                }} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                                    {COLOR_OPTIONS.map(o => <option key={o.color} value={o.color}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button onClick={saveCat} disabled={savingCat} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-purple-600 px-4 py-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-60">
                                {savingCat ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                            </button>
                            <button onClick={() => setShowCatForm(false)} className="text-xs font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Category List */}
                <div className="divide-y divide-slate-100">
                    {standardCategories.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No categories yet. {canEdit && 'Add one above.'}</p>
                    ) : standardCategories.map(cat => {
                        const IconComp = ICON_OPTIONS.find(o => o.name === cat.icon)?.icon || Music
                        const isExpanded = expandedCategory === cat.id
                        const catSongs = songs[cat.id] || []

                        return (
                            <div key={cat.id}>
                                {/* Category Row */}
                                <div
                                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={async () => {
                                        if (!isExpanded) await loadSongs(cat.id)
                                        setExpandedCategory(isExpanded ? null : cat.id)
                                    }}
                                >
                                    <div className={`w-8 h-8 ${cat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                        <IconComp className={`w-4 h-4 ${cat.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 leading-tight">{cat.label}</p>
                                        <p className="text-xs text-slate-400">{cat.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canEdit && (
                                            <>
                                                <button onClick={e => { e.stopPropagation(); openEditCat(cat) }} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                                                </button>
                                                <button onClick={e => { e.stopPropagation(); deleteCat(cat.id) }} className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                                </button>
                                            </>
                                        )}
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </div>

                                {/* Expanded Song List */}
                                {isExpanded && (
                                    <div className="bg-slate-50/50 border-t border-slate-100">
                                        {/* Song Form */}
                                        {showSongForm === cat.id && (
                                            <div className="px-5 py-4 bg-purple-50/50 border-b border-purple-100">
                                                <h4 className="text-xs font-semibold text-purple-700 mb-3">{editingSong ? 'Edit Song' : 'Add Song'}</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="col-span-2">
                                                        <label className="text-xs text-slate-500 font-medium block mb-1">Song Title *</label>
                                                        <input value={songForm.title} onChange={e => setSongForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="Unstoppable" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 font-medium block mb-1">Writer</label>
                                                        <input value={songForm.writer} onChange={e => setSongForm(p => ({ ...p, writer: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="Sis Uchemelody" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 font-medium block mb-1">Lead Singer</label>
                                                        <input value={songForm.leadSinger} onChange={e => setSongForm(p => ({ ...p, leadSinger: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="Sis Uchemelody" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 font-medium block mb-1">Rehearsal Count</label>
                                                        <input type="number" min={1} value={songForm.rehearsalCount} onChange={e => setSongForm(p => ({ ...p, rehearsalCount: parseInt(e.target.value) || 1 }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 font-medium block mb-1">Date Received</label>
                                                        <input type="date" value={songForm.dateReceived} onChange={e => setSongForm(p => ({ ...p, dateReceived: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <button onClick={() => saveSong(cat.id)} disabled={savingSong} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-purple-600 px-4 py-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-60">
                                                        {savingSong ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                                                    </button>
                                                    <button onClick={() => setShowSongForm(null)} className="text-xs font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">Cancel</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Songs */}
                                        <div className="divide-y divide-slate-100">
                                            {catSongs.length === 0 ? (
                                                <p className="text-xs text-slate-400 text-center py-5">No songs yet.</p>
                                            ) : catSongs.map((song, idx) => (
                                                <div key={song.id} className="flex items-center gap-3 px-6 py-3 hover:bg-white transition-colors group">
                                                    <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800 leading-tight">{song.title}</p>
                                                        <p className="text-xs text-slate-500">by {song.writer} · Lead: {song.leadSinger}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            Received: {new Date(song.dateReceived).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">x{song.rehearsalCount}</span>
                                                        {canEdit && (
                                                            <>
                                                                <button onClick={() => openEditSong(song)} className="p-1.5 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all">
                                                                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                                                                </button>
                                                                <button onClick={() => deleteSong(song)} className="p-1.5 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all">
                                                                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Song Button */}
                                        {canEdit && showSongForm !== cat.id && (
                                            <div className="px-6 py-3 border-t border-slate-100">
                                                <button onClick={() => openAddSong(cat.id)} className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors">
                                                    <Plus className="w-3.5 h-3.5" /> Add Song
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function InfoCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className={`rounded-2xl p-3 ${accent ? 'bg-emerald-50 col-span-2' : 'bg-slate-50'}`}>
            <p className={`text-[10px] uppercase tracking-widest font-medium mb-1 ${accent ? 'text-emerald-500' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-sm font-semibold leading-tight ${accent ? 'text-emerald-800' : 'text-slate-800'}`}>{value || '—'}</p>
        </div>
    )
}
