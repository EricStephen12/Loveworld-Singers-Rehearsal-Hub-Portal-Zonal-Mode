'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Share2, ThumbsUp } from 'lucide-react'
import LiveStreamPlayer from '../_components/LiveStreamPlayer'
import { useZone } from '@/hooks/useZone'

export default function LivePage() {
    const router = useRouter()
    const { currentZone } = useZone()

    return (
        <div className="h-screen w-full bg-black flex flex-col lg:flex-row overflow-hidden">

            {/* Left Column: Video & Header */}
            {/* Main Content: Video & Header - Full Width */}
            <div className="flex-1 flex flex-col h-full bg-[#0f0f0f] relative">

                {/* Simple Header */}
                <div className="h-16 flex items-center px-4 border-b border-white/5 bg-[#0f0f0f] z-20">
                    <button onClick={() => router.back()} className="p-2 mr-4 hover:bg-white/10 rounded-full text-white">
                        <ChevronLeft />
                    </button>
                    <h1 className="text-lg font-bold text-white truncate">Main Stage Broadcast</h1>
                </div>

                {/* Video Area - Centered */}
                <div className="flex-1 flex flex-col bg-black overflow-y-auto">
                    <div className="w-full relative max-w-[1600px] mx-auto">
                        <LiveStreamPlayer zoneId={currentZone?.id} />
                    </div>

                    {/* Stream Info / Mobile Actions */}
                    <div className="p-6 max-w-[1600px] mx-auto w-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-bold text-white text-xl shadow-lg border border-white/10">L</div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">Loveworld Singers</h2>
                                    <p className="text-gray-400 text-sm">Streaming live</p>
                                </div>
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className="bg-[#1f1f22] rounded-xl p-4 mt-6 border border-white/5">
                            <div className="flex gap-2 text-sm text-white font-bold mb-2">
                                <span>Started streaming less than a minute ago</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-sm">
                                Welcome to the official Loveworld Singers Rehearsal Hub live stream.
                                Be part of the rehearsal session from anywhere in the world.
                            </p>
                            <div className="mt-4 flex gap-2">
                                <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-medium text-gray-300 border border-white/5">#Live</div>
                                <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-medium text-gray-300 border border-white/5">#Rehearsal</div>
                                <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-medium text-gray-300 border border-white/5">#Music</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
