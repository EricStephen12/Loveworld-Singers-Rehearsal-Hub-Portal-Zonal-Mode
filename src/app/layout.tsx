import type { Metadata, Viewport } from 'next'
import './globals.css'
import 'kingschat-web-sdk/dist/stylesheets/style.min.css'
import PWAInstall from '@/components/PWAInstall'
import { AuthProvider } from '@/contexts/AuthContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { ChatProvider } from '@/app/pages/groups/_context/ChatContext'
import { MediaProvider } from '@/app/pages/media/_context/MediaContext'
import { AudioProvider } from '@/contexts/AudioContext'
import RealtimeNotifications from '@/components/RealtimeNotifications'
import { ActivityLogger } from '@/components/ActivityLogger'
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
import { CallProvider } from '@/contexts/CallContext'
import { CallOverlay } from '@/components/CallOverlay'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import { PermissionProvider } from '@/contexts/PermissionContext'
import '@/utils/safeAreaManager'
import { disableConsoleLogs } from "@/utils/disable-logs"
import AppBootstrap from '@/components/AppBootstrap'
import { PageLoader } from '@/components/PageLoader'

// FCM will be initialized in a client component instead

const isProduction = process.env.NODE_ENV === 'production'

// Side effects moved to AppBootstrap
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
    <html lang="en" suppressHydrationWarning>
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

        {/* Android WebView Notification Bridge */}
        <script src="/android-notification-bridge.js"></script>

        {/* Firebase Cloud Messaging Handler for Android */}
        <script src="/fcm-handler.js"></script>
      </head>
      <body className="font-sans">
        <AppBootstrap />
        <ErrorBoundary>
          <AuthProvider>
            <CallProvider>
              <AudioProvider>
                <MediaProvider>
                  <SubscriptionProvider>
                    <ChatProvider>
                      <AnalyticsProvider>
                        <PermissionProvider>
                          <ActivityLogger>
                            {/* FCM initialized in client components */}
                            {/* <ScreenshotPrevention /> */}
                            <main className="h-full w-full bg-gray-50">
                              <PageLoader>
                                {children}
                              </PageLoader>
                            </main>
                            {/* Browser will handle its own install prompt; custom UI removed */}
                            <RealtimeNotifications />
                            <PushNotificationListener />
                            <NotificationUrlHandler />
                            <CallOverlay />
                            <OfflineIndicator />
                            <FeatureUpdateChecker />
                            <ForceUpdateButton />
                          </ActivityLogger>
                        </PermissionProvider>
                      </AnalyticsProvider>
                    </ChatProvider>
                  </SubscriptionProvider>
                </MediaProvider>
              </AudioProvider>
            </CallProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}