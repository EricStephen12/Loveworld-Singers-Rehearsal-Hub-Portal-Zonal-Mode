'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Play } from 'lucide-react'
import { MediaItem } from '../_lib'

interface ShortsCardProps {
    media: MediaItem
}

export default function ShortsCard({ media }: ShortsCardProps) {
    const router = useRouter()
    const [imageLoaded, setImageLoaded] = useState(false)

    const handleClick = () => {
        router.push(`/pages/media/player/${media.id}?type=short`)
    }

    // Use thumbnail directly
    const thumbnailUrl = media.thumbnail || media.backdropImage || '/movie/default-hero.jpeg'

    return (
        <div
            onClick={handleClick}
            className="flex flex-col cursor-pointer group w-full"
        >
            <div className="relative aspect-[9/16] w-full rounded-xl overflow-hidden bg-[#0f0f0f] mb-3 shadow-sm">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-[#272727] animate-pulse" />
                )}
                <img
                    src={thumbnailUrl}
                    alt={media.title}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />

                {/* Play Icon on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                </div>

                {/* Options Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    className="absolute top-2 right-2 p-1.5 hover:bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <MoreVertical className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Meta Info Below */}
            <div className="px-1">
                <h3 className="text-white text-[14px] font-bold line-clamp-2 leading-tight mb-1 group-hover:text-white/90">
                    {media.title}
                </h3>
                <p className="text-[#aaa] text-[13px] font-medium tracking-tight">
                    {(media.views || 0).toLocaleString()} views
                </p>
            </div>
        </div>
    )
}
