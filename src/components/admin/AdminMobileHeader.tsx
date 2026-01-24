"use client";

import React from 'react';
import { Search, ChevronRight } from "lucide-react";
import { useZone } from '@/hooks/useZone';

interface AdminMobileHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: () => void;
  rightAction?: React.ReactNode;
  showZoneBadge?: boolean;
  parentSection?: string;
  onParentClick?: () => void;
}

const AdminMobileHeader = React.memo(({
  title,
  subtitle,
  showSearch = false,
  onSearch,
  rightAction,
  showZoneBadge = false,
  parentSection,
  onParentClick
}: AdminMobileHeaderProps) => {
  const { currentZone } = useZone();

  return (
    <div className="lg:hidden sticky top-0 z-[40] bg-white border-b border-slate-100">
      {/* Single compact header row */}
      <div className="px-4 h-14 flex items-center gap-3">
        {/* Title Section - with optional breadcrumb */}
        <div className="flex-1 min-w-0 flex items-center gap-1">
          {parentSection && onParentClick ? (
            // Breadcrumb style
            <div className="flex items-center gap-1 min-w-0">
              <button
                onClick={onParentClick}
                className="text-sm text-purple-600 font-medium truncate hover:underline"
              >
                {parentSection}
              </button>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-lg font-semibold text-slate-900 truncate">
                {title}
              </span>
            </div>
          ) : (
            // Simple title
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {title}
            </h1>
          )}
          {/* Inline zone indicator - subtle dot */}
          {currentZone && showZoneBadge && !parentSection && (
            <span className="text-xs text-slate-400 truncate hidden sm:inline">
              • {currentZone.name}
            </span>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {showSearch && (
            <button
              onClick={onSearch}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-slate-600" />
            </button>
          )}
          {rightAction}
        </div>
      </div>
    </div>
  );
});

export default AdminMobileHeader;
