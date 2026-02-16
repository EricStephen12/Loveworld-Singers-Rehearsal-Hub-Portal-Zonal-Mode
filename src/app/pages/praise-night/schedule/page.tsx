'use client';

import React, { useState } from 'react';
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
import { Calendar, Clock, FileText, Music, User } from 'lucide-react';

// Mock Data for Rehearsal Schedule
const MOCK_REHEARSAL_DATA = [
    {
        id: '1',
        title: 'Mighty God',
        writer: 'Pastor Chris',
        leadSinger: 'Sarah Johnson',
        status: 'Pending',
        date: '2024-05-20',
        submitted: '2024-05-15',
    },
    {
        id: '2',
        title: 'King of Glory',
        writer: 'Sinach',
        leadSinger: 'Joe Praize',
        status: 'Approved',
        date: '2024-05-21',
        submitted: '2024-05-16',
    },
    {
        id: '3',
        title: 'I Lift My Hands',
        writer: 'Eben',
        leadSinger: 'Eben',
        status: 'Rejected',
        date: '2024-05-22',
        submitted: '2024-05-17',
    },
];

// Mock Data for Daily Schedule (Placeholder)
const MOCK_DAILY_DATA = [
    {
        id: '1',
        time: '08:00 AM',
        activity: 'Morning Prayer',
        location: 'Main Hall',
    },
    {
        id: '2',
        time: '10:00 AM',
        activity: 'Vocal Warmups',
        location: 'Rehearsal Room A',
    },
    {
        id: '3',
        time: '02:00 PM',
        activity: 'Band Rehearsal',
        location: 'Studio 1',
    },
];

export default function SongSchedulePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'rehearsal' | 'daily'>('rehearsal');

    return (
        <div className="min-h-screen bg-slate-50 safe-area-bottom pb-20 sm:pb-0">
            {/* Header */}
            <ScreenHeader
                title="Song Schedule"
                showBackButton={true}
                backPath="/pages/praise-night"
            />

            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                {/* Toggle Switcher - Mobile Optimized */}
                <div className="flex justify-center mb-6 sm:mb-8">
                    <div className="bg-white p-1 rounded-full shadow-sm border border-slate-200 flex w-full sm:w-auto relative">
                        <button
                            onClick={() => setActiveTab('rehearsal')}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap z-10 ${activeTab === 'rehearsal'
                                    ? 'text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Rehearsal Schedule
                        </button>
                        <button
                            onClick={() => setActiveTab('daily')}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap z-10 ${activeTab === 'daily'
                                    ? 'text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Daily Schedule
                        </button>

                        {/* Animated indicator background */}
                        <div
                            className={`absolute top-1 bottom-1 rounded-full bg-purple-600 shadow-md transition-all duration-300 ease-out`}
                            style={{
                                left: activeTab === 'rehearsal' ? '4px' : '50%',
                                width: 'calc(50% - 4px)',
                                transform: activeTab === 'daily' ? 'translateX(0)' : 'translateX(0)'
                            }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                    {activeTab === 'rehearsal' ? (
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                <Music className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Rehearsal Schedule</h2>
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                                            <TableHead className="font-semibold text-slate-700">Song Title</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Writer</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Lead Singer</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Date</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Submitted</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {MOCK_REHEARSAL_DATA.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium text-slate-900">{item.title}</TableCell>
                                                <TableCell className="text-slate-600">{item.writer}</TableCell>
                                                <TableCell className="text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                                                            {item.leadSinger.charAt(0)}
                                                        </div>
                                                        {item.leadSinger}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`
                              ${item.status === 'Approved' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : ''}
                              ${item.status === 'Pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' : ''}
                              ${item.status === 'Rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' : ''}
                            `}
                                                        variant="outline"
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        {item.date}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-sm">
                                                    {item.submitted}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="sm:hidden space-y-3">
                                {MOCK_REHEARSAL_DATA.map((item) => (
                                    <div key={item.id} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                                <p className="text-xs text-slate-500">by {item.writer}</p>
                                            </div>
                                            <Badge
                                                className={`
                          ${item.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                          ${item.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                          ${item.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                        `}
                                                variant="outline"
                                            >
                                                {item.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">
                                                {item.leadSinger.charAt(0)}
                                            </div>
                                            <span className="text-sm text-slate-700">{item.leadSinger}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Rehearsal: {item.date}</span>
                                            </div>
                                            <span>Sub: {item.submitted}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Daily Schedule</h2>
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                                            <TableHead className="font-semibold text-slate-700 w-32">Time</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Activity</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Location</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {MOCK_DAILY_DATA.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                                                    {item.time}
                                                </TableCell>
                                                <TableCell className="text-slate-700 font-medium">
                                                    {item.activity}
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    {item.location}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Timeline View */}
                            <div className="sm:hidden space-y-4 pl-2">
                                {MOCK_DAILY_DATA.map((item, index) => (
                                    <div key={item.id} className="relative flex gap-4">
                                        {/* Timeline Line */}
                                        {index !== MOCK_DAILY_DATA.length - 1 && (
                                            <div className="absolute left-[5.5px] top-6 bottom-[-24px] w-px bg-slate-200"></div>
                                        )}

                                        {/* Dot */}
                                        <div className="mt-1.5 w-3 h-3 rounded-full bg-purple-600 border-2 border-white shadow-sm flex-shrink-0 z-10"></div>

                                        <div className="flex-1 pb-2">
                                            <span className="text-xs font-semibold text-purple-600 block mb-0.5">{item.time}</span>
                                            <h4 className="text-sm font-medium text-slate-900 mb-0.5">{item.activity}</h4>
                                            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md inline-block">
                                                {item.location}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col items-center justify-center py-12 text-slate-400">
                                <FileText className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm">Full daily schedule integration coming soon.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
