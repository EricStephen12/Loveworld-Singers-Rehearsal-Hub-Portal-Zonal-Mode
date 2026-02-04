'use client'

import { useState, useMemo } from 'react';
import { Radio, MessageSquare, Maximize2, MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import { ZONES } from '@/config/zones';

interface LiveStreamPlayerProps {
    isPreview?: boolean;
    zoneId?: string;
}

export default function LiveStreamPlayer({ isPreview = false, zoneId }: LiveStreamPlayerProps) {
    const zone = useMemo(() => zoneId ? ZONES.find(z => z.id === zoneId) : null, [zoneId]);
    const streams = zone?.streams || [];

    // Default stream state
    const [activeStreamId, setActiveStreamId] = useState<string | null>(streams.length > 0 ? streams[0].id : null);

    const activeStream = useMemo(() => {
        if (streams.length === 0) return null;
        return streams.find(s => s.id === (activeStreamId || streams[0].id)) || streams[0];
    }, [activeStreamId, streams]);

    // Default stream details fallback
    const defaultPublicId = "live_stream_789e522db80d47b2bfd6c156f9d52813_hls";

    const playerUrl = activeStream?.playerLink ||
        `https://player.cloudinary.com/embed/?cloud_name=dvtjjt3js&public_id=${defaultPublicId}&profile=cld-live-streaming`;

    return (
        <div className="w-full mb-8 group relative">
            {/* Stream Switcher - Only if multiple streams and not in preview */}
            {!isPreview && streams.length > 1 && (
                <div className="flex gap-2 mb-4 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                    {streams.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setActiveStreamId(s.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeStreamId === s.id
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <MonitorPlay className="w-4 h-4" />
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Video Container - Pure 16:9 */}
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl relative border border-white/5">
                <iframe
                    key={activeStream?.id || 'default'}
                    src={playerUrl}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title="Live Stream"
                ></iframe>

                {/* Live Overlay Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white z-10 pointer-events-none border border-white/10">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wide">LIVE</span>
                    {activeStream && streams.length > 1 && (
                        <>
                            <span className="w-px h-3 bg-white/20 mx-1"></span>
                            <span className="text-[10px] opacity-70">{activeStream.name}</span>
                        </>
                    )}
                </div>

                {/* Interactive Overlay for Preview Mode */}
                {isPreview && (
                    <Link
                        href="/pages/media/live"
                        className="absolute inset-0 bg-transparent hover:bg-black/20 transition-colors flex items-center justify-center group"
                    >
                        <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                            <MessageSquare className="w-4 h-4" />
                            <span>Join Chat & Watch</span>
                            <Maximize2 className="w-4 h-4 ml-1 opacity-70" />
                        </div>
                    </Link>
                )}
            </div>

            {/* Simple Label if Preview */}
            {isPreview && (
                <div className="mt-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium text-white">
                            {streams.length > 1 ? 'Multiple Live Broadcasts' : 'Live Broadcast Started'}
                        </span>
                    </div>
                    <Link href="/pages/media/live" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                        Click to chat <Maximize2 className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </div>
    )
}
