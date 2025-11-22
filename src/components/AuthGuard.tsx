'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireCompleteProfile?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireCompleteProfile = false, // Changed to false - no profile completion required
  redirectTo
}: AuthGuardProps) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    console.log('AuthGuard: Checking auth state...', { 
      isLoading, 
      user: !!user, 
      profile: !!profile, 
      requireAuth,
      requireCompleteProfile 
    });

    // Don't do anything while loading
    if (isLoading) {
      console.log('AuthGuard: Still loading...');
      return;
    }

    // Give auth system time to restore session (like Instagram does)
    if (!hasCheckedAuth) {
      // Check if user has any auth indicators - if so, let them through immediately
      const hasAuthIndicators = typeof window !== 'undefined' && (
        localStorage.getItem('userAuthenticated') === 'true' ||
        localStorage.getItem('hasCompletedProfile') === 'true' ||
        localStorage.getItem('bypassLogin') === 'true'
      );

      if (hasAuthIndicators) {
        console.log('AuthGuard: Auth indicators found, allowing immediate access');
        setHasCheckedAuth(true);
        setShouldRender(true);
        return;
      }

      console.log('AuthGuard: First check - waiting for session restoration...');
      const timer = setTimeout(() => {
        setHasCheckedAuth(true);
      }, 500); // Reduced to 500ms for faster restoration
      return () => clearTimeout(timer);
    }

    // Check if user is authenticated (be more lenient like Instagram)
    const isAuthenticated = user || 
      (typeof window !== 'undefined' && (
        localStorage.getItem('userAuthenticated') === 'true' ||
        localStorage.getItem('hasCompletedProfile') === 'true' ||
        localStorage.getItem('bypassLogin') === 'true'
      ));

    // Special user bypass - President gets full access without any validation
    const isSpecialUser = typeof window !== 'undefined' && localStorage.getItem('specialUser') === 'true';
    if (isSpecialUser) {
      console.log('AuthGuard: Special user detected, bypassing all validation');
      setShouldRender(true);
      return;
    }

    // Instagram-style bypass: If user was authenticated recently, just let them through
    const lastAuthTime = typeof window !== 'undefined' ? localStorage.getItem('lastAuthTime') : null;
    const timeSinceAuth = lastAuthTime ? Date.now() - parseInt(lastAuthTime) : Infinity;
    const recentlyAuthenticated = timeSinceAuth < 7 * 24 * 60 * 60 * 1000; // 1 week like Instagram
    const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;

    if (requireAuth && !isAuthenticated && recentlyAuthenticated) {
      console.log('AuthGuard: Recently authenticated, allowing access (Instagram-style)');
      setShouldRender(true);
      return;
    }

    // Offline mode: If user has auth indicators and we're offline, let them through
    if (requireAuth && !isAuthenticated && !isOnline) {
      const hasAuthIndicators = typeof window !== 'undefined' && (
        localStorage.getItem('userAuthenticated') === 'true' ||
        localStorage.getItem('hasCompletedProfile') === 'true' ||
        localStorage.getItem('bypassLogin') === 'true'
      );

      if (hasAuthIndicators) {
        console.log('AuthGuard: Offline mode with auth indicators, allowing access');
        setShouldRender(true);
        return;
      }
    }

    // If auth is required but user is not authenticated - load with demo data instead of redirecting
    if (requireAuth && !isAuthenticated) {
      console.log('AuthGuard: No user, loading with demo data instead of redirecting');
      setShouldRender(true);
      return;
    }

    // If user is authenticated but no profile yet, allow access (profile will be loaded)
    if (isAuthenticated && !profile) {
      console.log('AuthGuard: User authenticated but no profile yet, allowing access');
      setShouldRender(true);
      return;
    }

    // If complete profile is required but profile is not complete (be more lenient)
    if (requireCompleteProfile && isAuthenticated && profile && profile.profile_completed === false) {
      console.log('AuthGuard: Profile incomplete, redirecting to profile completion page');
      console.log('AuthGuard: Profile data:', profile);
      console.log('AuthGuard: profile_completed value:', profile.profile_completed);
      console.log('AuthGuard: Redirecting to /profile-completion');
      router.push('/profile-completion');
      return;
    }

    // Profile completion is no longer required - users go directly to app
    // This check is kept for backward compatibility but always passes
    if (requireCompleteProfile && isAuthenticated && profile) {
      console.log('AuthGuard: Profile completion check passed (no longer required)');
    }

    // If we get here, all requirements are met
    console.log('AuthGuard: All requirements met, rendering children');
    setShouldRender(true);
  }, [user, profile, isLoading, requireAuth, requireCompleteProfile, redirectTo, router, hasCheckedAuth]);

  // Show loading while checking auth
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : 'Restoring session...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render children until auth check is complete
  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
