import React from 'react';
import { useRouter } from 'next/navigation';
import { Music, RefreshCw, Calendar, Archive, Clock, MapPin, User, ChevronRight, Search } from 'lucide-react';
import { PageCategory } from '@/types/supabase';

interface GlobalArchiveResultsProps {
  archiveSearchQuery: string;
  isGlobalSearchLoading: boolean;
  globalSearchResults: any[];
  pageCategories: PageCategory[];
  handleSongClick: (song: any, index: number) => void;
}

export const GlobalArchiveResults: React.FC<GlobalArchiveResultsProps> = ({
  archiveSearchQuery,
  isGlobalSearchLoading,
  globalSearchResults,
  pageCategories,
  handleSongClick,
}) => {
  const router = useRouter();

  if (archiveSearchQuery.trim().length < 2) return null;

  return (
    <div className="mt-4 mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-600" />
          {isGlobalSearchLoading ? 'Searching songs...' : `Search Results (${globalSearchResults.length})`}
        </h3>
        {isGlobalSearchLoading && (
          <RefreshCw className="w-4 h-4 text-purple-600 animate-spin" />
        )}
      </div>

      {isGlobalSearchLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white/50 animate-pulse rounded-xl border border-slate-200"></div>
          ))}
        </div>
      ) : globalSearchResults.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {globalSearchResults.map((result: any, index) => (
            <button
              key={`${result.id}-${index}`}
              onClick={() => {
                if (result.type === 'page') {
                  router.push(`/pages/praise-night?category=archive&page=${result.id}`);
                } else {
                  handleSongClick(result, index);
                }
              }}
              className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-md transition-all duration-200 group flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {result.type === 'page' ? (
                    <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Music className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  )}
                  <h4 className="font-bold text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                    {result.type === 'page' ? result.name : result.title}
                  </h4>
                  {result.status && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${
                      result.status === 'heard' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {result.status}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  {result.type === 'song' && (
                    <span className="flex items-center gap-1 font-medium text-purple-600">
                      <Archive className="w-3 h-3" />
                      {result.parentPageName}
                    </span>
                  )}
                  {result.date && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {result.date}
                    </span>
                  )}
                  {result.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {result.location}
                    </span>
                  )}
                  {result.leadSinger && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {result.leadSinger}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      ) : (
        /* Only show "No results found" if no categories match either */
        !pageCategories.some(c => c.name?.toLowerCase().includes(archiveSearchQuery.toLowerCase())) && (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No results found matching "{archiveSearchQuery}"</p>
            <p className="text-slate-400 text-sm mt-1">Try a different title, program name, or writer</p>
          </div>
        )
      )}
      <div className="h-px bg-slate-200 my-8 mx-auto w-1/4 opacity-50"></div>
    </div>
  );
};

export default GlobalArchiveResults;
