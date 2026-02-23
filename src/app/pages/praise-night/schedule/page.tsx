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
    const { categories, songs, program, allPrograms, isLoading, loadSongsForCategory, loadProgram } = useSchedule();

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Filter out categories that aren't "Daily Schedule" for the main list
    // The "Daily Schedule" (if it exists) should be treated specially or just as another category?
    // The previous design had it as the last item. We'll stick to the order from the DB.

    // Auto-load songs when entering a category
    useEffect(() => {
        if (activeCategory) {
            loadSongsForCategory(activeCategory);
        }
    }, [activeCategory, loadSongsForCategory]);

    const activeCatData = categories.find(c => c.id === activeCategory);
    const isDailySchedule = activeCatData?.label.toLowerCase().includes('daily');

    const handleCategoryClick = (id: string) => {
        setActiveCategory(id);
    };

    const handleDateSelect = (date: string, categoryId?: string) => {
        setSelectedDate(date);
        loadProgram(date, categoryId);
    };

    const handleBack = () => {
        if (selectedDate) {
            setSelectedDate(null); // Just close the program/sub-list view
        } else {
            setActiveCategory(null); // Go back to the main categories list
        }
    };

    const categorySongs = activeCategory ? (songs[activeCategory] || []) : [];

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
                title={activeCategory ? (isDailySchedule && selectedDate ? (program?.program || "Daily Schedule") : (activeCatData?.label || "Details")) : "Schedule"}
                showBackButton={true}
                backPath={activeCategory ? undefined : "/pages/praise-night"}
                onBackClick={activeCategory ? handleBack : undefined}
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
                                    onClick={handleBack}
                                    className="flex items-center gap-2 text-sm font-outfit-bold text-purple-600 bg-purple-100 px-6 py-2.5 rounded-full hover:bg-purple-200 transition-all active:scale-95 shadow-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {selectedDate ? "Back to Lists" : "Back to Categories"}
                                </button>
                            </div>

                            <div className="flex flex-col gap-6">
                                {selectedDate && program ? (
                                    <>
                                        {/* Header for selected sub-category */}
                                        {isDailySchedule ? (
                                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-slate-200">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <CardInfo label="Program" value={program.program} />
                                                    <CardInfo label="Date" value={program.date} />
                                                    <CardInfo label="Time" value={program.time} />
                                                    <CardInfo label="Daily Target" value={program.dailyTarget} accent />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-slate-200">
                                                <CardInfo label="List Name" value={program.date} accent />
                                            </div>
                                        )}

                                        {/* Spreadsheet for selected sub-category */}
                                        <div className="w-full">
                                            {isLoading ? (
                                                <div className="py-32 flex flex-col items-center justify-center bg-white/50 rounded-3xl border border-dashed border-slate-200">
                                                    <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                                                    <p className="text-slate-400 text-sm font-medium">Fetching details...</p>
                                                </div>
                                            ) : program.spreadsheetData ? (
                                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[40vh]">
                                                    <SpreadsheetViewer data={program.spreadsheetData} />
                                                </div>
                                            ) : (
                                                <div className="py-24 text-center bg-white/50 rounded-3xl border border-dashed border-slate-200">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <FileText className="w-8 h-8 text-slate-200" />
                                                    </div>
                                                    <p className="text-slate-400 text-sm">No items in this list yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Main Category Spreadsheet */}
                                        {!isDailySchedule && activeCatData?.spreadsheetData && (
                                            <div className="mb-8 animate-in fade-in slide-in-from-bottom-2">
                                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2 mb-3">Main List</h3>
                                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[30vh]">
                                                    <SpreadsheetViewer data={activeCatData.spreadsheetData} />
                                                </div>
                                            </div>
                                        )}

                                        <h3 className={`text-sm font-bold text-slate-500 uppercase tracking-wider px-2 ${!isDailySchedule && activeCatData?.spreadsheetData ? 'mt-8' : ''}`}>
                                            {isDailySchedule ? 'Select a Date' : 'Additional Lists'}
                                        </h3>

                                        <div className="flex flex-col gap-3">
                                            {allPrograms.filter(p => isDailySchedule ? (!p.categoryId || p.categoryId === activeCatData?.id) : p.categoryId === activeCategory).length === 0 ? (
                                                <div className="py-12 text-center bg-white/50 rounded-3xl border border-dashed border-slate-200">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        {isDailySchedule ? <Calendar className="w-8 h-8 text-slate-300" /> : <FileText className="w-8 h-8 text-slate-300" />}
                                                    </div>
                                                    <p className="text-slate-400 text-sm">
                                                        {isDailySchedule ? 'No scheduled dates found.' : 'No additional lists found.'}
                                                    </p>
                                                </div>
                                            ) : (
                                                allPrograms.filter(p => isDailySchedule ? (!p.categoryId || p.categoryId === activeCatData?.id) : p.categoryId === activeCategory).map((p) => (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => handleDateSelect(p.date, isDailySchedule ? undefined : activeCategory!)}
                                                        className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group active:scale-[0.98] shadow-sm animate-in fade-in zoom-in-95"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors shadow-inner">
                                                                {isDailySchedule ? <Calendar className="w-6 h-6 text-purple-600" /> : <FileText className="w-6 h-6 text-purple-600" />}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900 text-lg group-hover:text-purple-700 transition-colors">
                                                                    {isDailySchedule ? (p.program || 'Song Schedule') : p.date}
                                                                </h4>
                                                                {isDailySchedule && (
                                                                    <p className="text-xs text-slate-500 font-medium">
                                                                        {new Date(p.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
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

function SpreadsheetViewer({ data }: { data: any }) {
    if (!data || !data.columns) return null;

    const hasRowLabels = data.rows?.some((r: any) => r.label);

    return (
        <div className="relative border border-slate-200 rounded-2xl overflow-auto max-h-[70vh] scrollbar-hide bg-white translate-z-0">
            <table className="border-collapse table-fixed min-w-full">
                <thead className="sticky top-0 z-20 bg-slate-50">
                    <tr className="border-b border-slate-200">
                        {hasRowLabels && (
                            <th className="w-12 bg-slate-100 border-r border-slate-200 sticky left-0 top-0 z-30 shadow-[1px_1px_0_0_rgba(0,0,0,0.05)]">
                                {/* Corner block */}
                            </th>
                        )}
                        {data.columns.map((col: any, i: number) => (
                            <th
                                key={i}
                                className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 last:border-0 bg-slate-50"
                                style={{ width: col.width || 120 }}
                            >
                                {col.label || String.fromCharCode(65 + i)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                            {hasRowLabels && (
                                <td className="px-2 py-3 bg-slate-50/80 backdrop-blur-sm border-r border-slate-200 text-[10px] font-black text-slate-400 text-center uppercase tracking-widest whitespace-nowrap sticky left-0 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                                    {row.label}
                                </td>
                            )}
                            {data.columns.map((_: any, cIdx: number) => {
                                const key = `${rIdx}:${cIdx}`;
                                const cell = data.data[key];
                                if (!cell) return <td key={cIdx} className="px-4 py-3 border-r border-slate-100/50 last:border-0 bg-white"></td>;

                                return (
                                    <td
                                        key={cIdx}
                                        className={`px-4 py-3 text-sm border-r border-slate-100/50 last:border-0 bg-white
                                            ${cell.bold ? 'font-bold' : ''}
                                            ${cell.italic ? 'italic' : ''}
                                            ${cell.align === 'center' ? 'text-center' : cell.align === 'right' ? 'text-right' : 'text-left'}
                                        `}
                                        style={{ color: cell.color }}
                                    >
                                        {cell.value}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
