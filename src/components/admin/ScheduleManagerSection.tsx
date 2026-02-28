'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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

    // View State: 'categories' | 'category-detail'
    const [viewMode, setViewMode] = useState<'categories' | 'category-detail'>('categories')
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

    // Refs for Auto-Saving
    const programFormRef = useRef(programForm)
    const spreadsheetDataRef = useRef(spreadsheetData)
    const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        programFormRef.current = programForm
    }, [programForm])

    useEffect(() => {
        spreadsheetDataRef.current = spreadsheetData
    }, [spreadsheetData])

    const loadEditorData = useCallback(async (dateId: string, categoryId?: string) => {
        setEditorLoading(true)
        const prog = await ScheduleProgramService.getProgram(zoneId, dateId, categoryId)
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
            setProgramForm({ program: '', date: dateId, time: '', dailyTarget: '' })
            setSpreadsheetData(undefined)
        }

        // Auto-load daily songs
        if (!categoryId) {
            const daily = categories.find(c => c.label === 'Daily Schedule')
            if (daily) {
                const list = await ScheduleSongService.getSongs(daily.id, zoneId, dateId)
                setSongs(prev => ({ ...prev, [daily.id]: list }))
            }
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

    const saveProgram = async (grid?: SpreadsheetData, isAutoSave = false) => {
        if (!isAutoSave) setSavingProgram(true)
        const isDaily = selectedCategory?.label === 'Daily Schedule'

        const currentForm = programFormRef.current
        const currentGrid = grid || spreadsheetDataRef.current

        const payload: any = {
            ...currentForm,
            zoneId,
            updatedBy: 'admin'
        }

        const catId = isDaily ? undefined : selectedCategory?.id
        if (catId) {
            payload.categoryId = catId
        }

        if (currentGrid !== undefined && currentGrid !== null) {
            payload.spreadsheetData = currentGrid
        }

        const oldDate = currentDate;
        const newDate = programForm.date;

        if (oldDate !== newDate && !isAutoSave) {
            // User changed the date. We need to move the program.

            // 1. Check if a program already exists on newDate
            const existing = await ScheduleProgramService.getProgram(zoneId, newDate, catId);
            if (existing) {
                if (!confirm(`A schedule already exists for ${newDate}. Overwrite it?`)) {
                    setSavingProgram(false);
                    return;
                }
            }

            // 2. Save under new date
            await ScheduleProgramService.updateProgram(payload, zoneId, newDate);

            // 3. Delete old date
            await ScheduleProgramService.deleteProgram(zoneId, oldDate, catId);

            // 4. If Daily Schedule (or has songs on this date), move songs
            if (!catId) {
                // Find songs for the old date
                const dailyCategory = categories.find(c => c.label === 'Daily Schedule');
                if (dailyCategory) {
                    const oldSongs = await ScheduleSongService.getSongs(dailyCategory.id, zoneId, oldDate);
                    for (const s of oldSongs) {
                        await ScheduleSongService.updateSong(s.id, { date: newDate });
                    }
                    // Update songs state to point to new date (simplest is to just reload songs next time)
                    setSongs(prev => ({ ...prev, [dailyCategory.id]: prev[dailyCategory.id]?.map(song => ({ ...song, date: newDate })) || [] }));
                }
            }

            setCurrentDate(newDate); // Update UI context to new date
            if (!isAutoSave) showToast('Program moved to new date!');
        } else {
            // Normal update under current date
            await ScheduleProgramService.updateProgram(payload, zoneId, oldDate);
            if (!isAutoSave) showToast('Program info saved!');
        }

        // Update local state
        setProgram(prev => ({
            ...(prev || {}),
            ...payload,
            updatedAt: new Date().toISOString(),
            id: prev?.id || `temp_${newDate}`,
            zoneId: zoneId
        } as ScheduleProgram))

        // Ensure history list updates
        setAllPrograms(prev => prev.filter(p => p.id !== `temp_${oldDate}`).map(p => {
            if (p.date === oldDate && p.categoryId === catId) {
                return {
                    ...p,
                    ...payload,
                    date: newDate,
                    updatedAt: new Date().toISOString(),
                }
            }
            return p
        }))

        if (!isAutoSave) {
            setSavingProgram(false)
            setEditingProgram(false)
        }
    }

    const deleteProgramHandler = async (dateId: string, categoryId?: string) => {
        if (!confirm('Are you sure you want to delete this specific schedule/list? This action cannot be undone.')) return;

        setSavingProgram(true);
        const success = await ScheduleProgramService.deleteProgram(zoneId, dateId, categoryId);

        if (success) {
            setAllPrograms(prev => prev.filter(p => !(p.date === dateId && p.categoryId === categoryId)));
            showToast('Schedule deleted successfully');
            setExpandedDate(null);
            setCurrentDate('');
        } else {
            showToast('Failed to delete schedule', 'error');
        }
        setSavingProgram(false);
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

        const payload: any = {
            ...catForm,
        }

        const gridData = grid || (editingCat?.spreadsheetData || selectedCategory?.spreadsheetData)
        if (gridData !== undefined) {
            payload.spreadsheetData = gridData
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
        setSelectedCategory(cat)
        setViewMode('category-detail')
        await loadSongs(cat.id)
    }

    const handleCreateScheduleClick = () => {
        setNewScheduleDate(selectedCategory?.label === 'Daily Schedule' ? new Date().toISOString().split('T')[0] : '')
        setShowNewScheduleModal(true)
    }

    const confirmCreateSchedule = async () => {
        if (!newScheduleDate || !selectedCategory) return
        const dateId = newScheduleDate
        setShowNewScheduleModal(false)

        setExpandedDate(dateId)
        setCurrentDate(dateId)

        const isDaily = selectedCategory.label === 'Daily Schedule'
        const catId = isDaily ? undefined : selectedCategory.id

        const newProgramPayload = {
            zoneId,
            program: '',
            date: dateId,
            time: '',
            dailyTarget: '',
            updatedBy: 'admin',
        } as any

        if (catId) {
            newProgramPayload.categoryId = catId
        }

        // Only add to local state if it doesn't already exist
        setAllPrograms(prev => {
            const exists = prev.find(p => p.date === dateId && p.categoryId === catId)
            if (exists) return prev

            return [{
                ...newProgramPayload,
                id: `temp_${dateId}_${Date.now()}`,
                updatedAt: new Date().toISOString(),
            } as ScheduleProgram, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        })

        // Auto-save the new program to DB immediately so it isn't lost on back/refresh
        await ScheduleProgramService.updateProgram(newProgramPayload, zoneId, dateId)

        loadEditorData(dateId, catId)
    }

    const handleEditSchedule = (prog: ScheduleProgram) => {
        if (expandedDate === prog.date) {
            setExpandedDate(null)
            return
        }
        setExpandedDate(prog.date)
        setCurrentDate(prog.date)
        loadEditorData(prog.date, prog.categoryId)
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


            {/* ── View: Category Detail (Editor + Sub-Schedules) ─────────────── */}
            {viewMode === 'category-detail' && selectedCategory && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {expandedDate ? (
                                <button onClick={() => { setExpandedDate(null); setCurrentDate(''); }} className="p-2 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all flex items-center justify-center text-slate-500 hover:text-indigo-600">
                                    <ChevronDown className="w-5 h-5 rotate-90" />
                                </button>
                            ) : (
                                <button onClick={() => { setViewMode('categories'); setSelectedCategory(null); }} className="p-2 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all flex items-center justify-center text-slate-500 hover:text-indigo-600">
                                    <ChevronDown className="w-5 h-5 rotate-90" />
                                </button>
                            )}
                            <div>
                                {expandedDate ? (
                                    <>
                                        <h3 className="text-lg font-bold text-slate-800">
                                            {selectedCategory.label === 'Daily Schedule' ? (program?.program || 'Schedule Editor') : (program?.date || 'Mini Category Editor')}
                                        </h3>
                                        <p className="text-sm text-slate-500">Back to {selectedCategory.label}</p>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-bold text-slate-800">{selectedCategory.label}</h3>
                                        <p className="text-sm text-slate-500">{selectedCategory.description || (selectedCategory.label === 'Daily Schedule' ? 'History of all created schedules' : '')}</p>
                                    </>
                                )}
                            </div>
                        </div>
                        {!expandedDate && (
                            <button onClick={handleCreateScheduleClick} className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-full transition-colors shadow-sm cursor-pointer" style={{ backgroundColor: currentZone?.themeColor || '#9333ea' }}>
                                <Plus className="w-4 h-4" /> {selectedCategory.label === 'Daily Schedule' ? 'Create New Schedule' : 'Create New List'}
                            </button>
                        )}
                    </div>

                    {/* New Schedule Modal */}
                    {showNewScheduleModal && (
                        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">
                                    {selectedCategory?.label === 'Daily Schedule' ? 'Select Date' : 'List Name'}
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    {selectedCategory?.label === 'Daily Schedule'
                                        ? 'Choose the date for the new program schedule.'
                                        : 'Enter a title for this new list.'}
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        {selectedCategory?.label === 'Daily Schedule' ? (
                                            <input
                                                type="date"
                                                value={newScheduleDate}
                                                onChange={e => setNewScheduleDate(e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all font-medium text-slate-700"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="e.g. New Songs"
                                                value={newScheduleDate}
                                                onChange={e => setNewScheduleDate(e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all font-medium text-slate-700"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button onClick={() => setShowNewScheduleModal(false)} className="flex-1 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button
                                        onClick={confirmCreateSchedule}
                                        disabled={!newScheduleDate}
                                        className="flex-1 py-2.5 rounded-xl text-white font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                        style={{ backgroundColor: currentZone?.themeColor || '#9333ea' }}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!expandedDate ? (
                        <div className="space-y-4">
                            {allPrograms.filter(p => selectedCategory.label === 'Daily Schedule' ? !p.categoryId || p.categoryId === dailyCategory?.id : p.categoryId === selectedCategory.id).length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm text-center py-16">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h4 className="text-slate-900 font-medium mb-1">No lists found</h4>
                                    <p className="text-sm text-slate-500">
                                        {selectedCategory.label === 'Daily Schedule' ? 'Create your first daily schedule to get started.' : 'Create a list using the button above.'}
                                    </p>
                                </div>
                            ) : (
                                allPrograms.filter(p => selectedCategory.label === 'Daily Schedule' ? !p.categoryId || p.categoryId === dailyCategory?.id : p.categoryId === selectedCategory.id).map(prog => (
                                    <div
                                        key={prog.id}
                                        onClick={() => handleEditSchedule(prog)}
                                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group animate-in fade-in zoom-in-95"
                                    >
                                        <div className="flex items-center justify-between p-5">
                                            <div className="flex items-center gap-4">
                                                {selectedCategory.label === 'Daily Schedule' ? (
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-700 border border-indigo-100 shadow-inner group-hover:bg-indigo-100 transition-colors">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(prog.date + "T12:00:00").toLocaleDateString('en-US', { month: 'short' })}</span>
                                                        <span className="text-lg font-bold leading-none">{new Date(prog.date + "T12:00:00").getDate()}</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-700 border border-indigo-100 shadow-inner group-hover:bg-indigo-100 transition-colors">
                                                        <FileText className="w-6 h-6 text-indigo-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors text-lg">
                                                        {selectedCategory.label === 'Daily Schedule' ? (prog.program || 'Untitled Program') : prog.date}
                                                    </h4>
                                                    {selectedCategory.label === 'Daily Schedule' && (
                                                        <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{prog.dailyTarget || 'No target set'}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {selectedCategory.label === 'Daily Schedule' && (
                                                    <div className="text-right hidden sm:block mr-2">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</p>
                                                        <p className="text-sm font-medium text-slate-700">{prog.time || '—'}</p>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    {canEdit && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteProgramHandler(prog.date, prog.categoryId); }}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-100 transition-colors"
                                                            title="Delete Schedule"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-slate-300 hover:text-rose-500 transition-colors" />
                                                        </button>
                                                    )}
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors border border-transparent group-hover:border-indigo-100">
                                                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:-rotate-90 transition-all font-bold" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4 overflow-hidden">
                            {editorLoading ? (
                                <div className="flex items-center justify-center py-32 bg-slate-50/50">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                        <p className="text-sm font-medium text-slate-500">Loading {selectedCategory.label === 'Daily Schedule' ? 'schedule' : 'mini category'} data...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className={`grid grid-cols-1 ${selectedCategory.label === 'Daily Schedule' ? 'md:grid-cols-3' : ''} divide-y md:divide-y-0 md:divide-x divide-slate-200/60`}>
                                    {selectedCategory.label === 'Daily Schedule' && (
                                        <div className="p-5 md:col-span-1 bg-slate-50/50 border-r border-slate-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Program Context</h4>
                                                {canEdit && !editingProgram && (
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => setEditingProgram(true)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500 hover:text-indigo-600 transition-colors" title="Edit Program Details">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => deleteProgramHandler(currentDate, program?.categoryId)} className="p-1 rounded-full hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors" title="Delete This Schedule">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {editingProgram ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Program Name</label>
                                                        <input
                                                            type="text"
                                                            value={programForm.program}
                                                            onChange={e => setProgramForm(p => ({ ...p, program: e.target.value }))}
                                                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
                                                            placeholder="e.g. Sunday Service"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Target / Goal</label>
                                                        <textarea
                                                            rows={3}
                                                            value={programForm.dailyTarget}
                                                            onChange={e => setProgramForm(p => ({ ...p, dailyTarget: e.target.value }))}
                                                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white shadow-sm"
                                                            placeholder="Goal for today..."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Date</label>
                                                            <input
                                                                type="date"
                                                                value={programForm.date}
                                                                onChange={e => setProgramForm(p => ({ ...p, date: e.target.value }))}
                                                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Time</label>
                                                            <input
                                                                type="time"
                                                                value={programForm.time}
                                                                onChange={e => setProgramForm(p => ({ ...p, time: e.target.value }))}
                                                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={() => saveProgram()}
                                                            disabled={savingProgram}
                                                            className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white bg-indigo-600 px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                                                        >
                                                            {savingProgram ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Details
                                                        </button>
                                                        <button onClick={() => setEditingProgram(false)} className="px-4 py-2.5 rounded-xl bg-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-300 transition-colors">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Program</p>
                                                        <p className="text-base font-bold text-indigo-900 leading-tight">{programForm.program || 'No program set'}</p>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Target</p>
                                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{programForm.dailyTarget || 'No target set.'}</p>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Date & Time</p>
                                                        <p className="text-sm font-medium text-slate-700">{programForm.date} • {programForm.time || 'No time set'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className={`p-0 ${selectedCategory.label === 'Daily Schedule' ? 'md:col-span-2' : ''} flex flex-col min-h-[500px] w-full bg-white`}>
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
            )
            }

            {/* Song/Activity/Title Form Modal */}
            {
                showSongForm && (
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
