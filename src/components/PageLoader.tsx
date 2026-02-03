'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import { usePathname, useRouter } from 'next/navigation';
import CustomLoader from '@/components/CustomLoader';

interface PageLoaderProps {
  children: React.ReactNode;
}

export function PageLoader({ children }: PageLoaderProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { currentZone, isLoading: zoneLoading } = useZone();
  const pathname = usePathname();
  const router = useRouter();
  // Optimize: Initial state based on cache to prevent flicker
  const [isReady, setIsReady] = useState(() => {
    if (typeof window === 'undefined') return false;

    // Auth cache
    const hasCachedUser = localStorage.getItem('lwsrh_has_user') === 'true';
    const isPublic = [
      '/auth',
      '/',
      '/splash',
      '/signup-success',
      '/success',
      '/qr-code',
      '/support',
      '/pages/support'
    ].includes(window.location.pathname);

    // Zone cache - only verify if not on a public path
    if (!isPublic && hasCachedUser) {
      const hasZoneCache = localStorage.getItem('lwsrh-zone-cache-v6');
      // ✅ CRITICAL FIX: Validate that cache is actually valid JSON, not just exists
      if (hasZoneCache) {
        try {
          const parsed = JSON.parse(hasZoneCache);
          return !!parsed?.id; // Only trust cache if it has a valid zone ID
        } catch (e) {
          console.warn('⚠️ Invalid zone cache detected, clearing...');
          localStorage.removeItem('lwsrh-zone-cache-v6');
          return false;
        }
      }
      return false;
    }

    return isPublic;
  });

  const lastPathname = useRef<string | null>(null);

  const publicPaths = [
    '/auth',
    '/',
    '/splash',
    '/signup-success',
    '/success',
    '/qr-code',
    '/support',
    '/pages/support'
  ];
  const isPublicPath = publicPaths.includes(pathname || '');

  useEffect(() => {
    if (pathname && pathname !== lastPathname.current) {
      lastPathname.current = pathname;
    }
  }, [pathname]);

  // ✅ CRITICAL FIX: Add timeout to prevent infinite loading from stale cache
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isReady && !authLoading) {
        console.warn('⏱️ PageLoader timeout - forcing ready state to prevent infinite loading');
        setIsReady(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isReady, authLoading]);

  useEffect(() => {
    // If we're already ready and the path hasn't changed, don't do anything
    // This allows the initial state from cache to stick
    if (isReady && pathname === lastPathname.current) return;

    if (authLoading) return;

    if (!user?.uid && !isPublicPath) {
      router.replace('/auth');
      return;
    }

    if (user?.uid && !zoneLoading) {
      setIsReady(true);
      return;
    }

    if (!user?.uid && isPublicPath) {
      setIsReady(true);
    }
  }, [authLoading, user?.uid, zoneLoading, pathname, isReady, isPublicPath, router]);

  if (!isReady) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50">
        <CustomLoader message="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}

