'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Plus, Trash2, Edit, Save, X, Music, Sparkles, Heart, User,
    Calendar, ChevronDown, ChevronUp, Loader2, RefreshCw,
    MessageSquare, FileText
} from 'lucide-react'
import { PraiseNight, PraiseNightSong } from '@/types/supabase'
import {
    ScheduleCategoryService,
    ScheduleSongService,
    ScheduleProgramService,
    ScheduleCategory,
    ScheduleSong,
    ScheduleProgram,
} from '@/lib/schedule-service'
import { useZone } from '@/hooks/useZone'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import SpreadsheetEditor from './SpreadsheetEditor'
import { SpreadsheetData } from '@/lib/schedule-service'

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

interface ScheduleManagerSectionProps {
    allSongs: PraiseNightSong[]
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ScheduleManagerSection({ allSongs = [] }: ScheduleManagerSectionProps) {
    const { currentZone, userRole } = useZone()
    const zoneId = currentZone?.id ?? null

    const canEdit = ['super_admin', 'hq_admin', 'zone_coordinator'].includes(userRole)

    // View State: 'categories' | 'sub-schedules' | 'editor'
    const [viewMode, setViewMode] = useState<'categories' | 'sub-schedules' | 'editor'>('categories')
    const [selectedCategory, setSelectedCategory] = useState<ScheduleCategory | null>(null)

    // Sub-Schedule State
    const [allPrograms, setAllPrograms] = useState<ScheduleProgram[]>([])

    // Date State for Editor
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])

    const [categories, setCategories] = useState<ScheduleCategory[]>([])
    const [songs, setSongs] = useState<Record<string, ScheduleSong[]>>({})
    const [program, setProgram] = useState<ScheduleProgram | null>(null)
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    // Category form
    const [showCatForm, setShowCatForm] = useState(false)
    const [editingCat, setEditingCat] = useState<ScheduleCategory | null>(null)
    const [catForm, setCatForm] = useState({ label: '', description: '', icon: 'Music', color: 'bg-purple-100', iconColor: 'text-purple-600' })
    const [savingCat, setSavingCat] = useState(false)

    // Song form
    const [showSongForm, setShowSongForm] = useState<string | null>(null) // categoryId
    const [editingSong, setEditingSong] = useState<ScheduleSong | null>(null)
    const [songForm, setSongForm] = useState({
        title: '',
        writer: '',
        leadSinger: '',
        rehearsalCount: 1,
        dateReceived: new Date().toISOString().split('T')[0],
        type: 'song' as 'song' | 'activity' | 'title',
        comment: ''
    })
    const [savingSong, setSavingSong] = useState(false)

    // Quick Add State
    const [quickAddInput, setQuickAddInput] = useState('')
    const [quickAddResults, setQuickAddResults] = useState<PraiseNightSong[]>([])
    const [showQuickAddResults, setShowQuickAddResults] = useState(false)

    // Program form
    const [editingProgram, setEditingProgram] = useState(false)
    const [programForm, setProgramForm] = useState({ program: '', date: '', time: '', dailyTarget: '' })
    const [savingProgram, setSavingProgram] = useState(false)

    // Spreadsheet State
    const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData | undefined>(undefined)

    // Accordion state
    const [expandedDate, setExpandedDate] = useState<string | null>(null)
    const [showNewScheduleModal, setShowNewScheduleModal] = useState(false)
    const [newScheduleDate, setNewScheduleDate] = useState(new Date().toISOString().split('T')[0])

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const loadData = useCallback(async () => {
        setLoading(true)
        const [cats, progs] = await Promise.all([
            ScheduleCategoryService.getCategories(zoneId),
            ScheduleProgramService.getAllPrograms(zoneId),
        ])
        setCategories(cats)
        setAllPrograms(progs)
        setLoading(false)
    }, [zoneId])

    const [editorLoading, setEditorLoading] = useState(false)

    const loadEditorData = useCallback(async (date: string) => {
        setEditorLoading(true)
        const prog = await ScheduleProgramService.getProgram(zoneId, date)
        setProgram(prog)

        if (prog) {
            setProgramForm({
                program: prog.program,
                date: prog.date,
                time: prog.time,
                dailyTarget: prog.dailyTarget
            })
            setSpreadsheetData(prog.spreadsheetData)
        } else {
            setProgramForm({ program: '', date: date, time: '', dailyTarget: '' })
            setSpreadsheetData(undefined)
        }

        // Auto-load daily songs
        const daily = categories.find(c => c.label === 'Daily Schedule')
        if (daily) {
            const list = await ScheduleSongService.getSongs(daily.id, zoneId, date)
            setSongs(prev => ({ ...prev, [daily.id]: list }))
        }
        setEditorLoading(false)
    }, [zoneId, categories])

    const loadSongs = useCallback(async (categoryId: string) => {
        const isDaily = categories.find(c => c.id === categoryId)?.label === 'Daily Schedule'
        if (isDaily) return // Daily songs handled by editor load

        if (songs[categoryId]) return

        const list = await ScheduleSongService.getSongs(categoryId, zoneId)
        setSongs(prev => ({ ...prev, [categoryId]: list }))
    }, [zoneId, songs, categories])

    useEffect(() => { loadData() }, [loadData])

    // ── Program CRUD ───────────────────────────────────────────────────────────

    const saveProgram = async (grid?: SpreadsheetData) => {
        setSavingProgram(true)
        const finalData = {
            ...programForm,
            spreadsheetData: grid || spreadsheetData,
            zoneId,
            updatedBy: 'admin'
        }
        await ScheduleProgramService.updateProgram(finalData, zoneId, currentDate)
        showToast('Program info saved!')

        // Update local state
        setProgram(prev => ({
            ...(prev || {}),
            ...finalData,
            updatedAt: new Date().toISOString(),
            id: prev?.id || `temp_${currentDate}`,
            zoneId: zoneId
        } as ScheduleProgram))

        // Ensure history list updates
        setAllPrograms(prev => prev.map(p => {
            if (p.date === currentDate) {
                return {
                    ...p,
                    ...finalData,
                    updatedAt: new Date().toISOString(),
                }
            }
            return p
        }))

        setSavingProgram(false)
        setEditingProgram(false)
    }

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

    const saveCat = async (grid?: SpreadsheetData) => {
        if (!catForm.label.trim()) return showToast('Label is required', 'error')
        setSavingCat(true)

        const payload = {
            ...catForm,
            spreadsheetData: grid || (editingCat?.spreadsheetData || selectedCategory?.spreadsheetData)
        }

        try {
            if (editingCat) {
                await ScheduleCategoryService.updateCategory(editingCat.id, payload)
                // Update local state
                setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, ...payload } : c))
                if (selectedCategory?.id === editingCat.id) {
                    setSelectedCategory(prev => prev ? ({ ...prev, ...payload }) : null)
                }
                showToast('Category updated!')
            } else {
                const newId = await ScheduleCategoryService.addCategory({
                    ...payload,
                    zoneId,
                    order: categories.length,
                    isActive: true,
                    createdBy: 'admin',
                }, zoneId)

                if (newId) {
                    const newCat: ScheduleCategory = {
                        id: newId,
                        zoneId,
                        ...payload,
                        order: categories.length,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        createdBy: 'admin'
                    } as ScheduleCategory
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
        setEditingCat(null)
    }

    const deleteCat = async (id: string) => {
        if (!confirm('Delete this category? Songs inside will remain but the category will be hidden.')) return

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

    const openAddSong = (categoryId: string, type: 'song' | 'activity' | 'title' = 'song') => {
        setEditingSong(null)
        setSongForm({
            title: '',
            writer: '',
            leadSinger: '',
            rehearsalCount: 1,
            dateReceived: new Date().toISOString().split('T')[0],
            type,
            comment: ''
        })
        setShowSongForm(categoryId)
    }

    const openEditSong = (song: ScheduleSong) => {
        setEditingSong(song)
        setSongForm({
            ...song,
            type: song.type || 'song',
            writer: song.writer || '',
            leadSinger: song.leadSinger || '',
            rehearsalCount: song.rehearsalCount,
            dateReceived: song.dateReceived?.split('T')[0] || new Date().toISOString().split('T')[0],
            comment: song.comment || ''
        })
        setShowSongForm(song.categoryId)
    }

    const saveSong = async (categoryId: string) => {
        if (!songForm.title.trim()) return showToast('Title is required', 'error')
        setSavingSong(true)

        try {
            if (editingSong) {
                await ScheduleSongService.updateSong(editingSong.id, {
                    ...songForm,
                    dateReceived: new Date(songForm.dateReceived).toISOString(),
                })

                setSongs(prev => ({
                    ...prev,
                    [categoryId]: prev[categoryId].map(s => s.id === editingSong.id ? {
                        ...s,
                        ...songForm,
                        dateReceived: new Date(songForm.dateReceived).toISOString()
                    } : s)
                }))

                showToast('Item updated!')
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

                    showToast('Item added!')
                }
            }
        } catch (err) {
            console.error(err)
            showToast('Failed to save item', 'error')
        }

        setSavingSong(false)
        setShowSongForm(null)
    }

    const deleteSong = async (song: ScheduleSong) => {
        if (!confirm(`Delete "${song.title}"?`)) return

        const oldSongs = { ...songs }
        setSongs(prev => ({
            ...prev,
            [song.categoryId]: prev[song.categoryId].filter(s => s.id !== song.id)
        }))

        const success = await ScheduleSongService.deleteSong(song.id)

        if (success) {
            showToast('Item deleted')
        } else {
            setSongs(oldSongs)
            showToast('Failed to delete item', 'error')
        }
    }

    // ── Daily Schedule Logic ───────────────────────────────────────────────────
    const [dailyCategory, setDailyCategory] = useState<ScheduleCategory | null>(null)

    useEffect(() => {
        const daily = categories.find(c => c.label === 'Daily Schedule') || null
        setDailyCategory(daily)
    }, [categories])

    // ── Render Helpers ─────────────────────────────────────────────────────────

    const handleCategoryClick = async (cat: ScheduleCategory) => {
        if (cat.label === 'Daily Schedule') {
            setViewMode('sub-schedules')
        } else {
            setSelectedCategory(cat)
            setViewMode('editor')
            await loadSongs(cat.id)
        }
    }

    const handleCreateScheduleClick = () => {
        setNewScheduleDate(new Date().toISOString().split('T')[0])
        setShowNewScheduleModal(true)
    }

    const confirmCreateSchedule = () => {
        if (!newScheduleDate) return
        const date = newScheduleDate
        setShowNewScheduleModal(false)

        setExpandedDate(date)
        setCurrentDate(date)

        // Only add if it doesn't already exist in the list
        setAllPrograms(prev => {
            const exists = prev.find(p => p.date === date)
            if (exists) return prev

            return [{
                id: `temp_${date}`,
                zoneId,
                program: '',
                date: date,
                time: '',
                dailyTarget: '',
                updatedAt: new Date().toISOString(),
                updatedBy: 'admin'
            }, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        })

        loadEditorData(date)
    }

    const handleEditSchedule = (prog: ScheduleProgram) => {
        if (expandedDate === prog.date) {
            setExpandedDate(null)
            return
        }
        setExpandedDate(prog.date)
        setCurrentDate(prog.date)
        loadEditorData(prog.date)
    }

    // ── Views ──────────────────────────────────────────────────────────────────

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

            {/* ── View: Categories (Root) ────────────────────────────────────── */}
            {viewMode === 'categories' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Schedule Manager</h3>
                            <p className="text-sm text-slate-500">Manage daily schedules and song lists</p>
                        </div>
                        {canEdit && (
                            <button
                                onClick={openAddCat}
                                className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-full transition-colors shadow-sm"
                                style={{ backgroundColor: currentZone?.themeColor || '#9333ea' }}
                            >
                                <Plus className="w-4 h-4" /> New Category
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(cat => {
                            const IconComp = ICON_OPTIONS.find(o => o.name === cat.icon)?.icon || Music
                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat)}
                                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComp className={`w-6 h-6 ${cat.iconColor}`} />
                                        </div>
                                        {canEdit && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); openEditCat(cat) }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); deleteCat(cat.id) }} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 mb-1">{cat.label}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Category Form Modal */}
                    {showCatForm && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">{editingCat ? 'Edit Category' : 'New Category'}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Label</label>
                                        <input value={catForm.label} onChange={e => setCatForm(p => ({ ...p, label: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" placeholder="e.g. Daily Schedule" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
                                        <input value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" placeholder="Brief description..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Icon</label>
                                            <select value={catForm.icon} onChange={e => setCatForm(p => ({ ...p, icon: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all">
                                                {ICON_OPTIONS.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Color</label>
                                            <select value={catForm.color} onChange={e => {
                                                const opt = COLOR_OPTIONS.find(o => o.color === e.target.value)
                                                setCatForm(p => ({ ...p, color: e.target.value, iconColor: opt?.iconColor || p.iconColor }))
                                            }} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all">
                                                {COLOR_OPTIONS.map(o => <option key={o.color} value={o.color}>{o.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowCatForm(false)} className="flex-1 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button
                                        onClick={() => saveCat()}
                                        disabled={savingCat}
                                        className="flex-1 py-2.5 rounded-xl text-white font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                        style={{ backgroundColor: currentZone?.themeColor || '#9333ea' }}
                                    >
                                        {savingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Category
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* ── View: Sub-Schedule List ────────────────────────────────────── */}
            {viewMode === 'sub-schedules' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setViewMode('categories')} className="p-2 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                                <ChevronDown className="w-5 h-5 rotate-90 text-slate-500" />
                            </button>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Daily Schedules</h3>
                                <p className="text-sm text-slate-500">History of all created schedules</p>
                            </div>
                        </div>
                        <button onClick={handleCreateScheduleClick} className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
                            <Plus className="w-4 h-4" /> Create New Schedule
                        </button>
                    </div>

                    {/* New Schedule Modal */}
                    {showNewScheduleModal && (
                        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Select Date</h3>
                                <p className="text-sm text-slate-500 mb-6">Choose the date for the new program schedule.</p>

                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="date"
                                            value={newScheduleDate}
                                            onChange={e => setNewScheduleDate(e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all font-medium text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button onClick={() => setShowNewScheduleModal(false)} className="flex-1 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button
                                        onClick={confirmCreateSchedule}
                                        disabled={!newScheduleDate}
                                        className="flex-1 py-2.5 rounded-xl text-white font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {allPrograms.length === 0 && expandedDate === null ? (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm text-center py-16">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-slate-300" />
                                </div>
                                <h4 className="text-slate-900 font-medium mb-1">No schedules found</h4>
                                <p className="text-sm text-slate-500">Create your first daily schedule to get started.</p>
                            </div>
                        ) : (
                            allPrograms.map(prog => (
                                <div key={prog.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                                    {/* Accordion Header (Pill) */}
                                    <div
                                        onClick={() => handleEditSchedule(prog)}
                                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors group ${expandedDate === prog.date ? 'bg-indigo-50/50 border-b border-indigo-100' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center text-indigo-700 border border-indigo-100 shadow-sm">
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(prog.date + "T12:00:00").toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-lg font-bold leading-none">{new Date(prog.date + "T12:00:00").getDate()}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{prog.program || 'Untitled Program'}</h4>
                                                <p className="text-sm text-slate-500 line-clamp-1">{prog.dailyTarget || 'No target set'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</p>
                                                <p className="text-sm font-medium text-slate-700">{prog.time || '—'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-indigo-600 bg-white border border-indigo-100 px-2 py-1 rounded-full shadow-sm">
                                                    {songs[dailyCategory?.id || '']?.filter(s => s.date === prog.date).length || 0} Items
                                                </span>
                                                <ChevronDown className={`w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-transform ${expandedDate === prog.date ? 'rotate-180 text-indigo-500' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Accordion Body (Inline Editor) */}
                                    {expandedDate === prog.date && (
                                        <div className="bg-slate-50/50 border-t border-indigo-100 animate-in slide-in-from-top-2">
                                            {editorLoading ? (
                                                <div className="flex items-center justify-center py-16">
                                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/60">
                                                    {/* Program Info */}
                                                    <div className="p-5 md:col-span-1 bg-white/50">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Program Context</h4>
                                                            {canEdit && !editingProgram && (
                                                                <button onClick={() => setEditingProgram(true)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 text-indigo-600">
                                                                    <Edit className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {editingProgram ? (
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <label className="text-xs text-slate-500 font-medium block mb-1">Program Name</label>
                                                                    <input
                                                                        type="text"
                                                                        value={programForm.program}
                                                                        onChange={e => setProgramForm(p => ({ ...p, program: e.target.value }))}
                                                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                                                                        placeholder="e.g. Sunday Service"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs text-slate-500 font-medium block mb-1">Target / Goal</label>
                                                                    <textarea
                                                                        rows={2}
                                                                        value={programForm.dailyTarget}
                                                                        onChange={e => setProgramForm(p => ({ ...p, dailyTarget: e.target.value }))}
                                                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
                                                                        placeholder="Goal for today..."
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs text-slate-500 font-medium block mb-1">Time</label>
                                                                    <input type="time" value={programForm.time} onChange={e => setProgramForm(p => ({ ...p, time: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
                                                                </div>
                                                                <div className="flex gap-2 pt-1">
                                                                    <button
                                                                        onClick={() => saveProgram()}
                                                                        disabled={savingProgram}
                                                                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                                                                    >
                                                                        {savingProgram ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                                                                    </button>
                                                                    <button onClick={() => setEditingProgram(false)} className="px-3 py-1.5 rounded-lg bg-slate-200/50 text-xs font-medium text-slate-500 hover:bg-slate-200">Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-1">Program</p>
                                                                    <p className="text-sm font-bold text-indigo-900 leading-tight">{programForm.program || 'No program set'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-1">Target</p>
                                                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{programForm.dailyTarget || 'No target set.'}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Daily Songs List & Quick Add */}
                                                    <div className="p-5 md:col-span-2 flex flex-col bg-white min-h-[500px]">
                                                        <SpreadsheetEditor
                                                            initialData={spreadsheetData}
                                                            onChange={(data) => setSpreadsheetData(data)}
                                                            onSave={(data) => saveProgram(data)}
                                                            isSaving={savingProgram}
                                                            themeColor={currentZone?.themeColor === 'blue' ? '#2563EB' : currentZone?.themeColor === 'emerald' ? '#059669' : currentZone?.themeColor === 'rose' ? '#E11D48' : currentZone?.themeColor === 'amber' ? '#D97706' : '#9333ea'}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ── View: Editor (Standard Category Only) ──────────────────── */}
            {viewMode === 'editor' && selectedCategory && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setViewMode('categories')
                                setSelectedCategory(null)
                            }}
                            className="p-2 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                        >
                            <ChevronDown className="w-5 h-5 rotate-90 text-slate-500" />
                        </button>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{selectedCategory.label}</h3>
                            <p className="text-sm text-slate-500">{selectedCategory.description}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                        <SpreadsheetEditor
                            initialData={selectedCategory.spreadsheetData}
                            onChange={(data) => setSelectedCategory(prev => prev ? ({ ...prev, spreadsheetData: data }) : null)}
                            onSave={(data) => saveCat(data)}
                            isSaving={savingCat}
                            themeColor={currentZone?.themeColor === 'blue' ? '#2563EB' : currentZone?.themeColor === 'emerald' ? '#059669' : currentZone?.themeColor === 'rose' ? '#E11D48' : currentZone?.themeColor === 'amber' ? '#D97706' : '#9333ea'}
                        />
                    </div>
                </div>
            )}

            {/* Song/Activity/Title Form Modal */}
            {showSongForm && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">
                            {editingSong ? 'Edit Item' : `Add ${songForm.type === 'activity' ? 'Activity' : songForm.type === 'title' ? 'Title' : 'Song'}`}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                    {songForm.type === 'activity' ? 'Activity Name' : songForm.type === 'title' ? 'Title Text' : 'Title'}
                                </label>
                                <input
                                    value={songForm.title}
                                    onChange={e => setSongForm(p => ({ ...p, title: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                    placeholder={songForm.type === 'activity' ? "e.g. Opening Prayer, Exhortation" : songForm.type === 'title' ? "e.g. Praise Segment" : "e.g. Way Maker"}
                                    autoFocus
                                />
                            </div>

                            {songForm.type === 'title' ? null : songForm.type === 'song' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Writer</label>
                                            <input value={songForm.writer} onChange={e => setSongForm(p => ({ ...p, writer: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" placeholder="Song writer" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Lead Singer</label>
                                            <input value={songForm.leadSinger} onChange={e => setSongForm(p => ({ ...p, leadSinger: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" placeholder="Lead singer" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Date Received</label>
                                            <input type="date" value={songForm.dateReceived} onChange={e => setSongForm(p => ({ ...p, dateReceived: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Rehearsals</label>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setSongForm(p => ({ ...p, rehearsalCount: Math.max(0, p.rehearsalCount - 1) }))} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 font-bold">-</button>
                                                <span className="flex-1 text-center font-bold text-lg text-slate-800">{songForm.rehearsalCount}</span>
                                                <button onClick={() => setSongForm(p => ({ ...p, rehearsalCount: p.rehearsalCount + 1 }))} className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center hover:bg-purple-200 text-purple-700 font-bold">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Activity Fields
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Note/Description (Optional)</label>
                                    <input
                                        value={songForm.writer || ''} // Reusing writer field
                                        onChange={e => setSongForm(p => ({ ...p, writer: e.target.value }))}
                                        className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-${currentZone?.themeColor || 'purple'}-500/20 focus:border-${currentZone?.themeColor || 'purple'}-500 transition-all`}
                                        placeholder="e.g. by Pastor Chris, or duration..."
                                    />
                                </div>
                            )}

                            {/* Common Fields: Comment */}
                            {songForm.type !== 'title' && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Comment (Optional)</label>
                                    <input
                                        value={songForm.comment || ''}
                                        onChange={e => setSongForm(p => ({ ...p, comment: e.target.value }))}
                                        className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-${currentZone?.themeColor || 'purple'}-500/20 focus:border-${currentZone?.themeColor || 'purple'}-500 transition-all`}
                                        placeholder="e.g. Needs practice, or key change..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowSongForm(null)} className="flex-1 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors">Cancel</button>
                            <button
                                onClick={() => saveSong(showSongForm!)}
                                disabled={savingSong}
                                className="flex-1 py-2.5 rounded-xl text-white font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                style={{ backgroundColor: currentZone?.themeColor || '#9333ea' }}
                            >
                                {savingSong ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    )
}
