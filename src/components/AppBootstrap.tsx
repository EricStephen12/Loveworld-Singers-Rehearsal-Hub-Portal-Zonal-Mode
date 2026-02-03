"use client";

import { useEffect } from 'react';
import { PerformanceOptimizer } from '@/lib/performance-optimizer';
import { ViewportHeightFix } from '@/utils/viewport-height-fix';
import { NavigationManager } from '@/utils/navigation';
import { SafeAreaUtils } from '@/utils/safe-area-utils';
import { DeviceSafeArea } from '@/utils/device-safe-area';
import { lowDataOptimizer } from '@/utils/low-data-optimizer';

export default function AppBootstrap() {
    useEffect(() => {
        // Client-side only initializations
        PerformanceOptimizer.autoOptimize();
        ViewportHeightFix.init();

        // Initialize navigation states (async but we don't block boot)
        (async () => {
            await NavigationManager.init();
            const { navigationStateManager } = await import('@/utils/navigation-state');
            await navigationStateManager.init();
        })();

        SafeAreaUtils.init();
        DeviceSafeArea.getInstance().init();
        lowDataOptimizer.init();

        // Make utilities globally available for debugging
        if (typeof window !== 'undefined') {
            (window as any).ViewportHeightFix = ViewportHeightFix;
            (window as any).SafeAreaUtils = SafeAreaUtils;
            (window as any).DeviceSafeArea = DeviceSafeArea;
            (window as any).lowDataOptimizer = lowDataOptimizer;
        }

        // Service Worker registration (moved from layout.tsx script)
        if ('serviceWorker' in navigator) {
            // Register main service worker
            navigator.serviceWorker.register('/sw-optimized.js')
                .then((registration) => {
                })
                .catch((error) => {
                    console.warn('⚠️ Service Worker registration failed:', error);
                });

            // Register Firebase Messaging Service Worker
            navigator.serviceWorker.register('/firebase-messaging-sw.js')
                .then((registration) => {
                })
                .catch((error) => {
                    console.warn('⚠️ Firebase Messaging SW registration failed:', error);
                });
        }

    }, []);

    return null;
}
