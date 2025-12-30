'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import { usePathname } from 'next/navigation';

interface PageLoaderProps {
  children: React.ReactNode;
}

/**
 * PageLoader - Best Practice Implementation
 * 
 * Root Cause Analysis:
 * - Pages were accessing user/zone data before loading completed
 * - This caused errors, redirects, and poor UX
 * - Multiple useEffect hooks competing to redirect
 * 
 * Solution:
 * - Wait for auth to finish loading (authLoading === false)
 * - Wait for user.uid to be available
 * - Wait for zone loading to complete (zoneLoading === false)
 * - Only show content when all critical data is ready
 * - Special handling for pages that don't require zone (like join-zone)
 */
export function PageLoader({ children }: PageLoaderProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { currentZone, isLoading: zoneLoading } = useZone();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const lastPathname = useRef<string | null>(null);

  // Pages that don't require zone (user can access without zone)
  const pagesWithoutZone = [
    '/pages/join-zone',
    '/auth',
    '/home'
  ];

  const requiresZone = !pagesWithoutZone.some(path => pathname?.startsWith(path));

  useEffect(() => {
    // Reset ready state only when navigating to a new page
    if (pathname && pathname !== lastPathname.current) {
      lastPathname.current = pathname;
      setIsReady(false);
    }
  }, [pathname]);

  useEffect(() => {
    // Skip if already ready for this page
    if (isReady && pathname === lastPathname.current) return;

    // Step 1: Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Step 2: Check if user exists
    // If auth is done but no user, allow page to render (page will handle redirect)
    if (!user?.uid) {
      setIsReady(true);
      return;
    }

    // Step 3: Wait for zone loading to complete
    if (zoneLoading) {
      return;
    }

    // Step 4: Zone loading is complete
    // Note: currentZone can be null (user has no zone) - that's OK
    // The page itself will handle showing "join zone" prompt
    // We just need to ensure zone loading is complete

    // All critical data is ready
    setIsReady(true);
  }, [authLoading, user?.uid, zoneLoading, currentZone, requiresZone, pathname, isReady]);

  // Show loader while critical data is loading
  if (!isReady) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="size-16 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-8 rounded-full bg-violet-500/10" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-gray-700">Loading...</p>
            <p className="text-xs text-gray-500">
              {authLoading ? 'Authenticating...' : zoneLoading ? 'Loading zone...' : 'Preparing your experience'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

