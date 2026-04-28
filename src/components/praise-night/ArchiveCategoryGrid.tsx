import React from 'react';
import { sanitizeImageUrl } from '@/utils/image-utils';
import { PageCategory } from '@/types/supabase';

interface ArchiveCategoryGridProps {
  pageCategories: PageCategory[];
  archiveSearchQuery: string;
  allPraiseNights: any[];
  setSelectedPageCategory: (category: string) => void;
}

export const ArchiveCategoryGrid: React.FC<ArchiveCategoryGridProps> = ({
  pageCategories,
  archiveSearchQuery,
  allPraiseNights,
  setSelectedPageCategory,
}) => {
  const filteredCategories = pageCategories.filter(category => 
    archiveSearchQuery.trim().length < 2 || 
    category.name?.toLowerCase().includes(archiveSearchQuery.toLowerCase()) || 
    category.description?.toLowerCase().includes(archiveSearchQuery.toLowerCase())
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Browse by Category</h3>
        <span className="text-sm text-slate-500">{pageCategories.length} categories</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCategories.map((category) => {
          // Count pages in this category
          const pagesInCategory = allPraiseNights.filter(p => {
            const isArchive = p.category === 'archive';
            const matchesCategory = p.pageCategory === category.name;
            return isArchive && matchesCategory;
          });
          const pageCount = pagesInCategory.length;

          // Only show categories that have pages
          if (pageCount === 0) return null;

          return (
            <button
              key={category.id}
              onClick={() => {
                setSelectedPageCategory(category.name);
              }}
              className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-200 text-left"
            >
              {category.image && (
                <img
                  src={sanitizeImageUrl(category.image)}
                  alt={category.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <h4 className="text-lg font-semibold text-slate-900 mb-2">{category.name}</h4>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{category.description}</p>
              <div className="mt-auto">
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ArchiveCategoryGrid;
