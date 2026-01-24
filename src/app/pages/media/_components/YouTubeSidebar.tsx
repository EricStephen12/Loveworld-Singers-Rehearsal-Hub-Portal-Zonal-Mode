'use client'

import {
    Home as HomeIcon, Play, ListVideo, History,
    PlaySquare, Clock, ThumbsUp, FolderOpen
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SidebarItemProps {
    icon: any
    label: string
    active?: boolean
    onClick?: () => void
    compact?: boolean
}

function SidebarItem({ icon: Icon, label, active = false, onClick, compact = false }: SidebarItemProps) {
    if (compact) {
        return (
            <button
                onClick={onClick}
                className={`flex flex-col items-center justify-center py-4 w-full rounded-xl transition-colors hover:bg-[#272727] ${active ? 'bg-[#121212]' : ''}`}
                title={label}
            >
                <Icon className={`w-6 h-6 mb-1.5 ${active ? 'text-white' : 'text-white/90'}`} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] text-white/90">{label}</span>
            </button>
        )
    }

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-6 px-3 h-10 w-full rounded-lg transition-colors hover:bg-[#272727] ${active ? 'bg-[#272727] font-semibold' : ''}`}
        >
            <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-white/90'}`} strokeWidth={active ? 2.5 : 1.5} />
            <span className={`text-sm tracking-tight ${active ? 'text-white' : 'text-white/90'}`}>{label}</span>
        </button>
    )
}

interface YouTubeSidebarProps {
    sidebarOpen: boolean
    viewMode: 'all' | 'shorts'
    selectedCategory: string
    setViewMode: (mode: 'all' | 'shorts') => void
    setSelectedCategory: (category: string) => void
    categories: any[]
}

export default function YouTubeSidebar({
    sidebarOpen,
    viewMode,
    selectedCategory,
    setViewMode,
    setSelectedCategory,
    categories
}: YouTubeSidebarProps) {
    const router = useRouter()

    return (
        <aside className={`${sidebarOpen ? 'w-[240px] px-3' : 'w-[72px] px-1'} flex flex-col gap-0.5 py-3 overflow-y-auto scrollbar-hide transition-all duration-300 h-[calc(100vh-56px)] sticky top-14 bg-[#0f0f0f] z-[100]`}>
            <SidebarItem
                icon={HomeIcon}
                label="Home"
                active={false}
                onClick={() => router.push('/home')}
                compact={!sidebarOpen}
            />
            <SidebarItem
                icon={Play}
                label="Explore"
                active={viewMode === 'all' && selectedCategory === 'all'}
                onClick={() => {
                    if (window.location.pathname !== '/pages/media') {
                        router.push('/pages/media')
                    }
                    setViewMode('all');
                    setSelectedCategory('all');
                }}
                compact={!sidebarOpen}
            />
            <SidebarItem
                icon={Play}
                label="Shorts"
                active={viewMode === 'shorts'}
                onClick={() => {
                    if (window.location.pathname !== '/pages/media') {
                        router.push('/pages/media')
                        // Add a slight delay to let the state update if needed, but since it's client side, next/navigation should handle it
                    }
                    setViewMode('shorts')
                }}
                compact={!sidebarOpen}
            />
            <SidebarItem
                icon={ListVideo}
                label="Playlists"
                active={window.location.pathname === '/pages/media/playlists'}
                onClick={() => router.push('/pages/media/playlists')}
                compact={!sidebarOpen}
            />

            {sidebarOpen && <hr className="my-3 border-white/10 mx-3" />}
            {sidebarOpen && <div className="px-6 py-2 text-base font-semibold text-white mb-1">Explore</div>}
            <SidebarItem icon={History} label="History" compact={!sidebarOpen} />
            <SidebarItem icon={Clock} label="Watch later" compact={!sidebarOpen} />
            <SidebarItem icon={ThumbsUp} label="Liked videos" compact={!sidebarOpen} />

            {sidebarOpen && <hr className="my-3 border-white/10 mx-3" />}
            {sidebarOpen && <div className="px-6 py-2 text-base font-semibold text-white mb-1">Categories</div>}
            {sidebarOpen && categories.slice(0, 6).map((cat: any) => (
                <SidebarItem
                    key={cat.id}
                    icon={FolderOpen}
                    label={cat.name}
                    active={viewMode === 'all' && selectedCategory === cat.slug}
                    onClick={() => {
                        if (window.location.pathname !== '/pages/media') {
                            router.push('/pages/media')
                        }
                        setViewMode('all');
                        setSelectedCategory(cat.slug);
                    }}
                    compact={false}
                />
            ))}
        </aside>
    )
}
