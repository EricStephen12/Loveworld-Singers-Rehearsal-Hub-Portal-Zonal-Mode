"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from "lucide-react";
import { useAdminTheme } from './AdminThemeProvider';
import { useZone } from '@/hooks/useZone';

interface AdminMobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearch?: () => void;
  rightAction?: React.ReactNode;
  showZoneBadge?: boolean;
}

export default function AdminMobileHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  showSearch = false,
  onSearch,
  rightAction,
  showZoneBadge = false
}: AdminMobileHeaderProps) {
  const router = useRouter();
  const { theme } = useAdminTheme();
  const { currentZone } = useZone();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-100">
      {/* Single compact header row */}
      <div className="px-4 h-14 flex items-center gap-3">
        {/* Back Button */}
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
        )}

        {/* Title Section - inline with zone name */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <h1 className="text-lg font-semibold text-slate-900 truncate">
            {title}
          </h1>
          {/* Inline zone indicator - subtle dot */}
          {currentZone && showZoneBadge && (
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
}
