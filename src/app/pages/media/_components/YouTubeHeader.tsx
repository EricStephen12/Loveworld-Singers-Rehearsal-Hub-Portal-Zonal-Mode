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

                <div className="hidden md:flex flex-1 items-center max-w-[720px] mx-10 gap-4">
                    <div className="flex flex-1 items-center group/search relative">
                        {/* Search Input Container */}
                        <div className="flex flex-1 items-center bg-[#121212] border border-[#303030] rounded-l-full px-5 h-10 group-focus-within/search:ml-[-1px] group-focus-within/search:border-[#1c62b9] group-focus-within/search:pl-[44px] transition-all relative z-10 overflow-hidden shadow-inner">
                            {/* Blue search icon that appears on focus */}
                            <div className="absolute left-4 hidden group-focus-within/search:flex items-center justify-center">
                                <Search className="w-5 h-5 text-[#f1f1f1]" strokeWidth={1.5} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent text-[16px] text-[#f1f1f1] placeholder-[#888888] focus:outline-none w-full font-sans -mt-[2px]"
                            />
                        </div>
                        {/* Search Button */}
                        <button className="h-10 px-[22px] bg-[#222222] border border-[#303030] border-l-0 rounded-r-full hover:bg-[#303030] transition-colors group relative flex flex-shrink-0 items-center justify-center z-10" title="Search">
                            <Search className="w-5 h-5 text-[#f1f1f1] font-light" strokeWidth={1.5} />
                            <div className="absolute top-[52px] left-1/2 -translate-x-1/2 px-2 py-1.5 bg-[#616161]/90 rounded-sm text-white text-[12px] font-medium opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity delay-300 z-50">
                                Search
                            </div>
                        </button>
                    </div>
                    
                    {/* Voice Search Button */}
                    <button className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#181818] hover:bg-[#303030] rounded-full transition-colors group relative border border-transparent shadow-[0_0_8px_rgba(0,0,0,0.1)]" title="Search with your voice">
                        <Mic className="w-5 h-5 text-[#f1f1f1]" strokeWidth={1.5} />
                        <div className="absolute top-[52px] left-1/2 -translate-x-1/2 px-2 py-1.5 bg-[#616161]/90 rounded-sm text-white text-[12px] font-medium opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity delay-300 z-50">
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
