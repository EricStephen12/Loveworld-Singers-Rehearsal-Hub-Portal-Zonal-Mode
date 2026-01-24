'use client'

import { Search, Menu, Bell, Plus, Play, ArrowLeft, Mic } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface YouTubeHeaderProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
    showMobileSearch: boolean
    setShowMobileSearch: (show: boolean) => void
    toggleSidebar: () => void
    userName?: string
    userEmail?: string
}

export default function YouTubeHeader({
    searchQuery,
    setSearchQuery,
    showMobileSearch,
    setShowMobileSearch,
    toggleSidebar,
    userName,
    userEmail
}: YouTubeHeaderProps) {
    const router = useRouter()

    return (
        <>
            <header className="h-14 flex items-center justify-between px-2 sm:px-4 sticky top-0 z-50 bg-[#0f0f0f]">
                <div className="flex items-center gap-1 sm:gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                    {/* Branding removed as requested */}
                </div>

                <div className="hidden md:flex flex-1 items-center max-w-[640px] mx-6 gap-3">
                    <div className="flex flex-1 items-center">
                        <div className="flex flex-1 items-center bg-[#121212] border border-[#303030] rounded-l-full px-4 h-10 focus-within:border-blue-500 focus-within:ml-[-1px] transition-all shadow-inner">
                            <Search className="hidden focus-within:block w-4 h-4 text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent text-base text-white placeholder-gray-500 focus:outline-none w-full font-sans"
                            />
                        </div>
                        <button className="h-10 px-5 bg-[#222222] border border-[#303030] border-l-0 rounded-r-full hover:bg-[#333333] transition-colors group relative" title="Search">
                            <Search className="w-5 h-5 text-white opacity-90" />
                            <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#444] text-white text-[11px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                Search
                            </div>
                        </button>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center bg-[#181818] hover:bg-[#303030] rounded-full transition-colors group relative" title="Search with your voice">
                        <Mic className="w-5 h-5 text-white" />
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#444] text-white text-[11px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                            Search with your voice
                        </div>
                    </button>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-2">
                    <button onClick={() => setShowMobileSearch(true)} className="p-2 hover:bg-white/10 rounded-full md:hidden">
                        <Search className="w-5 h-5 text-white font-bold" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full hidden sm:block">
                        <Plus className="w-6 h-6 text-white" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full hidden xs:block">
                        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                    <div className="ml-1 sm:ml-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer text-white">
                            {(userName || userEmail)?.[0].toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Search Overlay */}
            {showMobileSearch && (
                <div className="fixed inset-0 z-[60] bg-[#0f0f0f] px-4 h-14 flex items-center gap-3 border-b border-white/10">
                    <button onClick={() => setShowMobileSearch(false)} className="p-2 hover:bg-white/10 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div className="flex-1 bg-[#121212] border border-[#303030] rounded-full px-4 h-9 flex items-center">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-sm text-white focus:outline-none"
                        />
                    </div>
                </div>
            )}
        </>
    )
}
