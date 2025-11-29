  import type { Metadata, Viewport } from 'next'
import './globals.css'
import 'kingschat-web-sdk/dist/stylesheets/style.min.css'
import PWAInstall from '@/components/PWAInstall'
import '@/stores/authStore' // Initialize auth store
import '@/stores/zoneStore' // Initialize zone store
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { ChatProvider } from '@/app/pages/groups/_context/ChatContext'
import { MediaProvider } from '@/app/pages/media/_context/MediaContext'
import { AudioProvider } from '@/contexts/AudioContext'
import RealtimeNotifications from '@/components/RealtimeNotifications'
import PushNotificationListener from '@/components/PushNotificationListener'
import NotificationUrlHandler from '@/components/NotificationUrlHandler'
import VersionChecker from '@/components/VersionChecker'
import ScreenshotPrevention from '@/components/ScreenshotPrevention'
import SuperFastServiceWorker from '@/components/SuperFastServiceWorker'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PerformanceOptimizer } from '@/lib/performance-optimizer'
import { ViewportHeightFix } from '@/utils/viewport-height-fix'
import { NavigationManager } from '@/utils/navigation'
import { SafeAreaUtils } from '@/utils/safe-area-utils'
import { DeviceSafeArea } from '@/utils/device-safe-area'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { lowDataOptimizer } from '@/utils/low-data-optimizer'
import { EmergencyRecovery } from '@/utils/emergency-recovery'
import FeatureUpdateChecker from '@/components/FeatureUpdateChecker'
import OfflineIndicator from '@/components/OfflineIndicator'
import ForceUpdateButton from '@/components/ForceUpdateButton'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import '@/utils/auth-debug'
import '@/utils/safeAreaManager'
import '@/utils/logger' // Disable console logs in production
import { disableConsoleLogs } from '@/utils/disable-logs'

const isProduction = process.env.NODE_ENV === 'production'

// Auto-optimize for low data on app startup
if (typeof window !== 'undefined') {
  // Disable all console logs for security
  disableConsoleLogs()
  
  PerformanceOptimizer.autoOptimize()
  ViewportHeightFix.init()
  NavigationManager.init()
  SafeAreaUtils.init()
  DeviceSafeArea.getInstance().init()
  // Don't force auth persistence - zustand auth store handles it
  lowDataOptimizer.init()
  
  // Make utilities globally available for debugging
  ;(window as any).ViewportHeightFix = ViewportHeightFix
  ;(window as any).SafeAreaUtils = SafeAreaUtils
  ;(window as any).DeviceSafeArea = DeviceSafeArea
  ;(window as any).FirebaseAuthService = FirebaseAuthService
  ;(window as any).lowDataOptimizer = lowDataOptimizer
  ;(window as any).EmergencyRecovery = EmergencyRecovery
}
// import GlobalMiniPlayer from '@/components/GlobalMiniPlayer'

// Use system fonts for faster loading

// Static version for PWA stability (only change when manifest actually changes)
const APP_VERSION = '3.0.0'; // ✅ Updated for instant loading optimizations

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'LoveWorld Singers Rehearsal Hub - Praise & Worship App',
  description: 'Join the LoveWorld Singers community! Access rehearsals, chat with fellow singers, and grow in praise and worship. Install our app for the best experience!',
  manifest: `/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LoveWorld Singers',
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: 'LoveWorld Singers',
  generator: 'Next.js',
  keywords: ['praise', 'worship', 'rehearsal', 'music', 'loveworld', 'singers', 'choir', 'church', 'christian'],
  authors: [{ name: 'LoveWorld Singers' }],
  creator: 'LoveWorld Singers',
  publisher: 'LoveWorld Singers',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    siteName: 'LoveWorld Singers Rehearsal Hub',
    title: 'LoveWorld Singers Rehearsal Hub - Join Our Community!',
    description: 'Join the LoveWorld Singers community! Access rehearsals, chat with fellow singers, and grow in praise and worship. Install our app for the best experience!',
    url: 'https://loveworldsingers.com',
    images: [
      {
        url: '/APP ICON/pwa_512_filled.png',
        width: 512,
        height: 512,
        alt: 'LoveWorld Singers Rehearsal Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LoveWorld Singers Rehearsal Hub - Join Our Community!',
    description: 'Join the LoveWorld Singers community! Access rehearsals, chat with fellow singers, and grow in praise and worship.',
    images: ['/APP ICON/pwa_512_filled.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
  viewportFit: 'cover', // Enable safe area support for notched devices
        // ✅ Enhanced touch responsiveness
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/logo.png" />

        {/* ✅ INSTANT LOADING - Resource Hints */}
        <link rel="preconnect" href="https://firebase.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebase.googleapis.com" />
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preload" href="/lmm.png" as="image" />
        <link rel="preload" href="/APP ICON/pwa_192_filled.png" as="image" />
        
        {/* Critical CSS and JS preloading */}
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
        <link rel="preload" href="/_next/static/chunks/webpack.js" as="script" />
        
        {/* Fonts removed for faster loading */}

        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LWSRHP - LOVEWORLD SINGERS REHEARSAL HUB PORTAL" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-navbutton-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Cloudinary Upload Widget */}
        <script src="https://upload-widget.cloudinary.com/global/all.js" async></script>
      </head>
      <body className="font-sans">
        {isProduction && (
          <script
            dangerouslySetInnerHTML={{
          __html: `
            // Detect if running in native app and hide install prompts
            function isRunningInNativeApp() {
              const userAgent = navigator.userAgent || navigator.vendor || window.opera;
              // Check for common in-app browser indicators
              return (
                userAgent.includes('wv') || // Android WebView
                userAgent.includes('InAppBrowser') ||
                window.ReactNativeWebView !== undefined ||
                // Check if running in standalone mode (PWA installed)
                window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true
              );
            }

            // Hide install prompt if running in native app
            if (isRunningInNativeApp()) {
              // Add CSS to hide install prompts
              const style = document.createElement('style');
              style.textContent = \`
                /* Hide common install prompt selectors */
                .install-prompt,
                .pwa-install,
                .add-to-home,
                [class*="install"],
                [id*="install"],
                .beforeinstallprompt {
                  display: none !important;
                }
              \`;
              document.head.appendChild(style);

              // Prevent beforeinstallprompt event
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                return false;
              });

              // Add flag to localStorage
              localStorage.setItem('isNativeApp', 'true');
              console.log('📱 Running in native app - install prompts hidden');
            }

            // Export for use in your app
            window.isNativeApp = isRunningInNativeApp();

            // Register Optimized Service Worker for fast first load
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw-optimized.js')
                  .then((registration) => {
                    console.log('⚡ Optimized Service Worker registered:', registration);
                    // Update service worker when new version available
                    registration.addEventListener('updatefound', () => {
                      console.log('🔄 New service worker version found');
                    });
                  })
                  .catch((error) => {
                    console.warn('⚠️ Service Worker registration failed:', error);
                  });
              });
            }

            // Optimize performance on load
            if (typeof window !== 'undefined') {
              window.addEventListener('load', () => {
                console.log('🚀 Optimizing PWA performance...');
                
                // Preload critical data
                const preloadData = () => {
                  const cachedData = localStorage.getItem('app_cache');
                  if (cachedData) {
                    console.log('📦 Found cached data, app will load instantly');
                  }
                };
                
                preloadData();
                
                // Cache current page
                const cacheCurrentPage = () => {
                  const currentPage = window.location.pathname;
                  const pageData = {
                    url: currentPage,
                    timestamp: Date.now(),
                    title: document.title
                  };
                  localStorage.setItem('last_page', JSON.stringify(pageData));
                };
                
                cacheCurrentPage();
                console.log('✅ Performance optimized!');
              });
            }
              `,
            }}
          />
        )}
        <ErrorBoundary>
          <AudioProvider>
          <MediaProvider>
            <SubscriptionProvider>
              <ChatProvider>
                <AnalyticsProvider>
                  {/* <ScreenshotPrevention /> */}
                  <main className="h-full w-full bg-gray-50">
                    {children}
                  </main>
                  <PWAInstall />
                  <RealtimeNotifications />
                  <PushNotificationListener />
                  <NotificationUrlHandler />
                  <OfflineIndicator />
                  <FeatureUpdateChecker />
                  <ForceUpdateButton />
                </AnalyticsProvider>
              </ChatProvider>
            </SubscriptionProvider>
          </MediaProvider>
          </AudioProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}