'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, ChevronRight, Heart, Music, Sparkles, User, FileText, Loader2 } from 'lucide-react';
import { useSchedule } from '@/hooks/useSchedule';

// Map icon names to components
const ICON_MAP: Record<string, any> = {
    Music, Sparkles, Heart, User, Calendar, FileText
};

export default function SongSchedulePage() {
    const router = useRouter();
    const { categories, songs, program, isLoading, loadSongsForCategory } = useSchedule();

    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Filter out categories that aren't "Daily Schedule" for the main list
    // The "Daily Schedule" (if it exists) should be treated specially or just as another category?
    // The previous design had it as the last item. We'll stick to the order from the DB.

    // Auto-load songs when entering a category
    useEffect(() => {
        if (activeCategory) {
            loadSongsForCategory(activeCategory);
        }
    }, [activeCategory, loadSongsForCategory]);

    const handleCategoryClick = (id: string) => {
        setActiveCategory(id);
    };

    const activeCatData = categories.find(c => c.id === activeCategory);
    const categorySongs = activeCategory ? (songs[activeCategory] || []) : [];

    const isDailySchedule = activeCatData?.label.toLowerCase().includes('daily');

    if (isLoading && categories.length === 0) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-slate-50 flex flex-col">
            <style jsx global>{`
                html { scroll-behavior: smooth; }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Header */}
            <ScreenHeader
                title={activeCategory ? (activeCatData?.label || "Details") : "Schedule"}
                showBackButton={true}
                backPath={activeCategory ? undefined : "/pages/praise-night"}
                onBackClick={activeCategory ? () => setActiveCategory(null) : undefined}
                rightImageSrc="/logo.png"
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide h-[calc(100vh-80px)]">
                <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 content-bottom-safe">

                    {!activeCategory ? (
                        <div className="flex flex-col gap-3">
                            {categories.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 text-sm">No schedule categories found.</p>
                                </div>
                            ) : (
                                categories.map((cat) => {
                                    const Icon = ICON_MAP[cat.icon] || Music;
                                    return (
                                        <div
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            role="button"
                                            tabIndex={0}
                                            className="bg-white rounded-2xl p-3 shadow-sm border border-gray-300 hover:shadow-lg transition-all duration-300 active:scale-[0.97] group mb-3 w-full cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-left">
                                                    <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                                                        <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-slate-900 text-sm group-hover:text-black leading-tight">
                                                            {cat.label}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                                                            {cat.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                                    <ChevronRight className="w-3 h-3 text-slate-500" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Back Button (Desktop) */}
                            <div className="hidden sm:flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className="flex items-center gap-2 text-sm font-outfit-bold text-purple-600 bg-purple-100 px-6 py-2.5 rounded-full hover:bg-purple-200 transition-all active:scale-95 shadow-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Categories
                                </button>
                            </div>

                            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl ring-1 ring-black/5 shadow-xl shadow-purple-500/5 overflow-hidden mb-10 min-h-[50vh]">

                                {isDailySchedule && program ? (
                                    /* Daily Schedule Program Header */
                                    <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                                        <div className="grid grid-cols-2 gap-3">
                                            <CardInfo label="Program" value={program.program} />
                                            <CardInfo label="Date" value={program.date} />
                                            <CardInfo label="Time" value={program.time} />
                                            <CardInfo label="Daily Target" value={program.dailyTarget} accent />
                                        </div>
                                    </div>
                                ) : null}

                                {categorySongs.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <p className="text-slate-400 text-sm">No songs scheduled yet.</p>
                                    </div>
                                ) : (
                                    isDailySchedule ? (
                                        /* Simple List for Daily Schedule */
                                        <div className="divide-y divide-slate-100">
                                            {categorySongs.map((song, index) => (
                                                <div key={song.id} className="flex items-center gap-3 px-5 py-4 hover:bg-purple-50/30 transition-colors group">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-slate-500">{index + 1}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-purple-700 transition-colors">{song.title}</h4>
                                                        <p className="text-xs text-slate-500 mt-0.5">by {song.writer}</p>
                                                        <p className="text-xs text-slate-400">Lead: {song.leadSinger}</p>
                                                    </div>
                                                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 border border-purple-100">
                                                        <span className="font-bold text-purple-700 text-xs">x{song.rehearsalCount}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Desktop Table */}
                                            <div className="hidden sm:block overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-slate-50/50 border-none hover:bg-transparent">
                                                            <TableHead className="font-outfit-bold text-slate-500 py-5 px-8 uppercase text-[10px] tracking-widest">Song</TableHead>
                                                            <TableHead className="font-outfit-bold text-slate-500 py-5 px-4 uppercase text-[10px] tracking-widest text-center">Date Received</TableHead>
                                                            <TableHead className="font-outfit-bold text-slate-500 py-5 px-8 uppercase text-[10px] tracking-widest text-right">Rehearsed</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {categorySongs.map((song) => (
                                                            <TableRow key={song.id} className="border-b border-slate-100/50 hover:bg-purple-50/30 transition-colors group">
                                                                <TableCell className="py-5 px-8">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-outfit-bold text-slate-900 text-base group-hover:text-purple-700 transition-colors">{song.title}</span>
                                                                        <span className="text-xs text-slate-500 mt-0.5">by {song.writer}</span>
                                                                        <span className="text-xs text-slate-400 mt-0.5">Lead: {song.leadSinger}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-5 px-4 text-center">
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-xs font-medium text-slate-700">
                                                                            {new Date(song.dateReceived).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-400 mt-0.5">Received</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-5 px-8 text-right">
                                                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 text-purple-700 font-outfit-bold text-sm border border-purple-100">
                                                                        x{song.rehearsalCount}
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            {/* Mobile Card View */}
                                            <div className="sm:hidden space-y-3 pb-8">
                                                {categorySongs.map((song, index) => (
                                                    <div
                                                        key={song.id}
                                                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-3 active:scale-[0.98] transition-all duration-200"
                                                        style={{ animationDelay: `${index * 50}ms` }}
                                                    >
                                                        {/* Index Badge */}
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mt-0.5">
                                                            <span className="text-xs font-bold text-slate-400">{index + 1}</span>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-outfit-bold text-base text-slate-900 leading-snug line-clamp-2">
                                                                {song.title}
                                                            </h3>
                                                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                                                {song.writer}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-100">
                                                                    <User className="w-3 h-3 text-slate-400" />
                                                                    <span className="text-[10px] text-slate-600 font-medium">{song.leadSinger}</span>
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-100">
                                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                                    <span className="text-[10px] text-slate-600 font-medium">
                                                                        {new Date(song.dateReceived).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Rehearsal Count Badge */}
                                                        <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                                            <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center shadow-sm">
                                                                <span className="font-outfit-bold text-purple-600 text-sm">x{song.rehearsalCount}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )
                                )}
                            </div>

                            <p className="text-center text-slate-400 text-[10px] font-poppins-medium uppercase tracking-widest pt-4">
                                Details: {activeCatData?.label}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CardInfo({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className={`rounded-2xl p-3 ${accent ? 'bg-emerald-50 col-span-2' : 'bg-slate-50'}`}>
            <p className={`text-[10px] uppercase tracking-widest font-medium mb-1 ${accent ? 'text-emerald-500' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-sm font-semibold leading-tight ${accent ? 'text-emerald-800' : 'text-slate-800'}`}>{value || '—'}</p>
        </div>
    );
}
