import React from 'react';
import { useRouter } from 'next/navigation';
import { Music, Archive, ChevronLeft } from 'lucide-react';
import { PraiseNight } from '@/types/supabase';

interface ArchiveProgramListProps {
  loading: boolean;
  loadingPageCategories: boolean;
  selectedPageCategory: string | null;
  pageCategories: any[];
  filteredPraiseNights: PraiseNight[];
  displayedPraiseNights: PraiseNight[];
  currentPraiseNight: PraiseNight | null;
  categoryFilter: string | null;
  archiveSearchQuery: string;
  setArchiveSearchQuery: (query: string) => void;
  setSelectedPageCategory: (category: string | null) => void;
}

export const ArchiveProgramList: React.FC<ArchiveProgramListProps> = ({
  loading,
  loadingPageCategories,
  selectedPageCategory,
  pageCategories,
  filteredPraiseNights,
  displayedPraiseNights,
  currentPraiseNight,
  categoryFilter,
  archiveSearchQuery,
  setArchiveSearchQuery,
  setSelectedPageCategory,
}) => {
  const router = useRouter();

  if (loading || loadingPageCategories) return null;

  const showList = (selectedPageCategory || pageCategories.length === 0) && filteredPraiseNights.length > 0;

  if (showList) {
    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayedPraiseNights.map((praiseNight) => (
            <button
              key={praiseNight.id}
              onClick={() => {
                router.push(`/pages/praise-night?category=${categoryFilter || 'archive'}&page=${praiseNight.id}`);
              }}
              className={`group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${currentPraiseNight?.id === praiseNight.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            >
              {/* Banner Image */}
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                {praiseNight.bannerImage ? (
                  <img
                    src={praiseNight.bannerImage}
                    alt={praiseNight.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">PN{praiseNight.id}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>

              {/* Page Info */}
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 truncate">{praiseNight.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{praiseNight.date}</p>
                <p className="text-xs text-gray-500 mt-0.5">{praiseNight.location}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (filteredPraiseNights.length === 0 && !loading && !archiveSearchQuery.trim()) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <Music className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium italic">
          No sessions found in this category
        </p>
      </div>
    );
  }

  if (selectedPageCategory) {
    return (
      <div className="text-center py-12 flex flex-col items-center">
        <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        {archiveSearchQuery.trim() ? (
          <>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-500 mb-6">
              No programs in "{selectedPageCategory}" match "{archiveSearchQuery}"
            </p>
            <button
              onClick={() => setArchiveSearchQuery('')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Clear Search
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No pages in this category</h3>
            <p className="text-slate-500 mb-6">
              No archived pages have been assigned to "{selectedPageCategory}" yet
            </p>
            <button
              onClick={() => setSelectedPageCategory(null)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to All Categories
            </button>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default ArchiveProgramList;
