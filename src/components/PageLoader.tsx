'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePathname, useRouter } from 'next/navigation';
import CustomLoader from '@/components/CustomLoader';
import { isPublicPath as checkIsPublicPath, AUTH_CACHE_KEY, ZONE_CACHE_KEY } from '@/config/routes';

interface PageLoaderProps {
  children: React.ReactNode;
}

export function PageLoader({ children }: PageLoaderProps) {
  const { user, isLoading: authLoading, isProfileLoading } = useAuth();
  const { currentZone, isLoading: zoneLoading } = useZone();
  // We explicitly wait for subscription to settle to avoid "flash of wrong rights"
  const { isLoading: subscriptionLoading } = useSubscription();
  const pathname = usePathname();
  const router = useRouter();

  // Initial state logic: If we are at root and have a user cache, we keep it false (showing loader)
  // until we redirect to home. If we are on a public path, we can show it faster.
  const [isReady, setIsReady] = useState(false);

  // Check cache immediately on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isReady) return;

    const hasCachedUser = localStorage.getItem(AUTH_CACHE_KEY) === 'true';
    const isPublic = checkIsPublicPath(window.location.pathname);

    if (!isPublic && hasCachedUser) {
      // Optimistic readiness for non-public paths IF we have a user
      setIsReady(true);
    } else if (isPublic) {
      // Always ready for public paths
      setIsReady(true);
    }
  }, []);

  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== lastPathname.current) {
      lastPathname.current = pathname;
    }
  }, [pathname]);

  // Main readiness effect
  useEffect(() => {
    const isPublicPath = checkIsPublicPath(pathname);
    const hasCachedUser = typeof window !== 'undefined' && localStorage.getItem(AUTH_CACHE_KEY) === 'true';

    // 1. Initial Load Cleanup: If we are already ready, do nothing (unless path changed to a protected route while logged out)
    if (isReady && pathname === lastPathname.current) {
      if (!authLoading && !user && !hasCachedUser && !isPublicPath) {
        router.replace('/auth');
      }
      return;
    }

    // 2. Patience for Cached Users: If we have a cached user but Firebase is still loading, wait.
    // This prevents the "flash" of redirect on refresh.
    if (authLoading && hasCachedUser && !isPublicPath) {
      // We know the user was logged in last time. Let's wait for Firebase.
      return;
    }

    // 3. Critically: If auth is still loading and we don't have cache, we might still want to wait 
    // a tiny bit to be safe, but generally it's okay to wait for the standard timeout.
    if (authLoading) return;

    // 4. Case 1: Public Path - Always allow
    if (isPublicPath) {
      if (user && (pathname === '/auth' || pathname === '/')) {
        // SILENT REDIRECT: Avoid the splash screen for logged in users at root
        router.replace('/home');
        return;
      }
      if (!isReady) setIsReady(true);
      return;
    }

    // 5. Case 2: Protected Path & No User - Redirect
    if (!user && !authLoading && !hasCachedUser) {
      router.replace('/auth');
      return;
    }

    // 6. Case 3: Protected Path & User Exists
    // Optimization: If we have valid zone cache OR we have a loaded zone, permit entry.
    // We do NOT wait for subscriptionLoading because SubscriptionContext now handles optimistic caching.
    // This removes the "double wait" penalty.
    const isZoneReady = !zoneLoading || IsZoneCacheValid();

    // We treat profile as "ready" if we have a user object, profile data loads in background mostly.
    // But if we want to be strict about profile specific data usage, we might check it.
    // For splash screen speed: User + Zone Cache + (Subscription Cache handles itself) = GO.
    if (user && isZoneReady) {
      if (!isReady) setIsReady(true);
    }
  }, [authLoading, user, zoneLoading, subscriptionLoading, isProfileLoading, pathname, isReady, router]);

  // Timeout Fallback: If 5 seconds pass and we're still not ready, force it.
  // This saves users from being stuck on the splash screen due to network hangs.
  useEffect(() => {
    const isPublicPath = checkIsPublicPath(pathname);
    const timeout = setTimeout(() => {
      if (!isReady) {
 console.warn('⏱️ PageLoader timeout - resolving stuck state');
        if (!user && !isPublicPath) {
          console.warn('[PageLoader] Redirecting to /auth due to timeout and no user.');
          router.replace('/auth');
        } else {
          setIsReady(true);
        }
      }
    }, 30000); // 30s fallback for slow networks (e.g. Nigeria)

    return () => clearTimeout(timeout);
  }, [isReady, user, pathname, router]);

  // Helper to check if we have a valid zone cache to speed up perceived loading
  const IsZoneCacheValid = () => {
    if (typeof window === 'undefined') return false;
    const cache = localStorage.getItem(ZONE_CACHE_KEY);
    return !!cache;
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a ref for the auth cache to avoid reading it on every render, 
  // but we still need it to be consistent with the initial client render.
  // HOWEVER, to avoid hydration mismatch, we MUST render the same as the server first.
  const hasAuthCache = mounted && typeof window !== 'undefined' && localStorage.getItem(AUTH_CACHE_KEY) === 'true';

  const [hasSuccessfullyLoaded, setHasSuccessfullyLoaded] = useState(false);

  const isPublicPath = checkIsPublicPath(pathname);
  const isProtectedAndLoading = !isPublicPath && user && (zoneLoading || isProfileLoading);

  // Once we successfully render children on a protected route, lock hasSuccessfullyLoaded to true
  useEffect(() => {
    if (!isPublicPath && user && !zoneLoading && !isProfileLoading && isReady) {
      setHasSuccessfullyLoaded(true);
    }
  }, [isPublicPath, user, zoneLoading, isProfileLoading, isReady]);

  // If we have already successfully loaded the protected page, NEVER show the full-screen loader again 
  // for background re-fetches. This completely prevents the annoying loading spinner when switching tabs.
  const shouldShowLoader = !mounted || authLoading || !isReady || (!hasSuccessfullyLoaded && isProtectedAndLoading);

  if (shouldShowLoader) {
    if (mounted) console.log(`[PageLoader] Showing loader. authLoading=${authLoading}, isReady=${isReady}, isProtectedAndLoading=${isProtectedAndLoading}, hasSuccessfullyLoaded=${hasSuccessfullyLoaded}`);
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
        <CustomLoader message="" />
      </div>
    );
  }

  // If we are on the auth page but we think the user might be logged in,
  // we keep showing the loader until we are SURE. This prevents the login form flicker.
  const isAuthPage = pathname === '/auth';
  if (isAuthPage && ((hasAuthCache && !user) || user)) {
    console.log(`[PageLoader] Anti-flicker active on /auth. hasAuthCache=${hasAuthCache}, user=${!!user}`);
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
        <CustomLoader message="" />
      </div>
    );
  }

  console.log(`[PageLoader] Rendering children. Path=${pathname}, user=${!!user}`);
  return <>{children}</>;
}

