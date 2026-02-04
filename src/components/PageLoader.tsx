'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
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
  // Optimize: Initial state MUST match server (false) to prevent hydration mismatch
  const [isReady, setIsReady] = useState(false);

  // Check cache immediately on mount
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Check if we are already ready (e.g. from a previous nav)
    if (isReady) return;

    const publicPathsToCheck = [
      '/auth',
      '/',
      '/splash',
      '/signup-success',
      '/success',
      '/qr-code',
      '/support',
      '/pages/support'
    ];

    // Auth cache
    const hasCachedUser = localStorage.getItem('lwsrh_has_user') === 'true';
    const isPublic = publicPathsToCheck.includes(window.location.pathname);


    if (!isPublic && hasCachedUser) {
      setIsReady(true);
      return;
    } else if (isPublic) {
      setIsReady(true);
    }
  }, []);

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

  // Main readiness effect
  useEffect(() => {
    // If we are already ready, do nothing (unless path changed to a protected route while logged out)
    if (isReady && pathname === lastPathname.current) {
      // Double check: if we are ready but lost auth on a private route, redirect
      if (!authLoading && !user && !isPublicPath) {
        router.replace('/auth');
      }
      return;
    }

    // Still waiting for critical auth state?
    if (authLoading) return;

    // Case 1: Public Path - Always allow
    if (isPublicPath) {
      // BOUNCE BACK: If user is logged in but on /auth, send them home
      if (user && pathname === '/auth') {
        console.log('🔄 PageLoader: User logged in on auth page, redirecting home');
        router.replace('/home');
        return;
      }

      if (!isReady) setIsReady(true);
      return;
    }

    // Case 2: Protected Path & No User - Redirect
    // ONLY redirect if initial load is complete and we truly have no user
    if (!user && !authLoading) {
      router.replace('/auth');
      return;
    }

    // Case 3: Protected Path & User Exists
    // Wait for zone to load if possible, but don't block forever if user is valid
    if (user && (!zoneLoading || IsZoneCacheValid())) {
      if (!isReady) setIsReady(true);
    }
  }, [authLoading, user, zoneLoading, pathname, isReady, isPublicPath, router]);

  // Timeout Fallback: If 5 seconds pass and we're still not ready, force it.
  // This saves users from being stuck on the splash screen due to network hangs.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isReady) {
        console.warn('⏱️ PageLoader timeout - resolving stuck state');
        if (!user && !isPublicPath) {
          router.replace('/auth');
        } else {
          setIsReady(true);
        }
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isReady, user, isPublicPath, router]);

  // Helper to check if we have a valid zone cache to speed up perceived loading
  const IsZoneCacheValid = () => {
    if (typeof window === 'undefined') return false;
    const cache = localStorage.getItem('lwsrh-zone-cache-v6');
    return !!cache;
  };

  if (!isReady) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
        <CustomLoader message="" />
        <p className="mt-4 text-xs font-medium text-gray-400 animate-pulse">Initializing...</p>
      </div>
    );
  }

  return <>{children}</>;
}

