'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import MediaManager from '@/components/MediaManager';
import { ArrowLeft, Upload, Shield, Loader2 } from 'lucide-react';

// List of allowed sound team emails - add your sound team members here
const SOUND_TEAM_EMAILS: string[] = [
  'greatedafekome@gmail.com',
  'oyeghe@gmail.com',
  'legacyd77@gmail.com',
];

// List of allowed sound team user IDs (from Firebase Auth)
const SOUND_TEAM_USER_IDS: string[] = [
  // Add sound team member user IDs here
  // 'firebase-user-id-1',
  // 'firebase-user-id-2',
];

export default function MediaUploadPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { currentZone, userRole } = useZone();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Check authorization (PageLoader already ensures user exists)
    const checkAuthorization = () => {
      const isAdmin = userRole === 'super_admin' ||
        userRole === 'boss' ||
        userRole === 'zone_coordinator' ||
        userRole === 'hq_admin' ||
        profile?.role === 'admin' ||
        profile?.role === 'boss';

      if (isAdmin) {
        setIsAuthorized(true);
        setCheckingAuth(false);
        return;
      }

      const userEmail = user?.email?.toLowerCase();
      if (userEmail && SOUND_TEAM_EMAILS.map(e => e.toLowerCase()).includes(userEmail)) {
        setIsAuthorized(true);
        setCheckingAuth(false);
        return;
      }

      if (user?.uid && SOUND_TEAM_USER_IDS.includes(user.uid)) {
        setIsAuthorized(true);
        setCheckingAuth(false);
        return;
      }

      if (profile?.designation === 'Instrumentalist' ||
        profile?.administration?.toLowerCase().includes('sound') ||
        profile?.administration?.toLowerCase().includes('media')) {
        setIsAuthorized(true);
        setCheckingAuth(false);
        return;
      }

      // Not authorized
      setIsAuthorized(false);
      setCheckingAuth(false);
    };

    checkAuthorization();
  }, [user, profile, userRole, authLoading, router]);

  // Loading state
  if (authLoading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-slate-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">
            You don't have permission to access the Media Upload page.
            This page is only available to admins and sound team members.
          </p>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/home')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Video Manager</h1>
                <p className="text-xs text-slate-500">
                  {currentZone?.name || 'Upload and manage videos'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Manager - Full height scrollable container */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 pb-32">
          <MediaManager />
        </div>
      </div>
    </div>
  );
}
