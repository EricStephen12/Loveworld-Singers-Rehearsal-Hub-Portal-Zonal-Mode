import { Radio, MessageSquare, Maximize2 } from 'lucide-react';
import Link from 'next/link';

interface LiveStreamPlayerProps {
    isPreview?: boolean;
}

export default function LiveStreamPlayer({ isPreview = false }: LiveStreamPlayerProps) {
    return (
        <div className="w-full mb-8 group relative">
            {/* Video Container - Pure 16:9 */}
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-sm relative">
                <iframe
                    src="https://player.cloudinary.com/embed/?cloud_name=dvtjjt3js&public_id=live_stream_789e522db80d47b2bfd6c156f9d52813_hls&profile=cld-live-streaming"
                    className="w-full h-full border-0 absolute inset-0"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title="Live Stream"
                ></iframe>

                {/* Live Overlay Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white z-10 pointer-events-none">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wide">LIVE</span>
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
                        <span className="text-sm font-medium text-white">Live Broadcast Started</span>
                    </div>
                    <Link href="/pages/media/live" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                        Click tochat <Maximize2 className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </div>
    )
}
