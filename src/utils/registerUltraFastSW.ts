// Register Ultra Fast Service Worker for instant loading

export const registerUltraFastSW = () => {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw-ultra-fast.js', {
        scope: '/'
      })
      .then((registration) => {
        console.log('🚀 Ultra Fast SW registered successfully:', registration.scope);
        
        // Force update on page load
        registration.update();
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available, activate immediately
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('Ultra Fast SW registration failed:', error);
      });
    });

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        window.location.reload();
      }
    });

    // Pre-cache critical pages
    const preCachePages = () => {
      const criticalPages = [
        '/',
        '/home',
        '/pages/rehearsals',
        '/pages/profile',
        '/pages/praise-night'
      ];

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_URLS',
          urls: criticalPages
        });
      }
    };

    // Pre-cache when service worker is ready
    if (navigator.serviceWorker.controller) {
      preCachePages();
    } else {
      navigator.serviceWorker.addEventListener('controllerchange', preCachePages);
    }
  }
};

// Preload critical resources for instant loading
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    // Critical images
    { href: '/logo.png', as: 'image' },
    { href: '/lmm.png', as: 'image' },
    
    // Critical CSS
    { href: '/_next/static/css/app.css', as: 'style' },
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if ((resource as any).type) link.type = (resource as any).type;
    if ((resource as any).crossorigin) link.crossOrigin = (resource as any).crossorigin;
    
    document.head.appendChild(link);
  });
};

// Instant page transitions
export const enableInstantTransitions = () => {
  if (typeof window === 'undefined') return;

  // Prefetch on hover
  document.addEventListener('mouseover', (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href && link.href.startsWith(window.location.origin)) {
      const url = new URL(link.href);
      const pathname = url.pathname;
      
      // Prefetch the page
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = pathname;
      document.head.appendChild(prefetchLink);
    }
  });

  // Prefetch on focus (for keyboard navigation)
  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href && link.href.startsWith(window.location.origin)) {
      const url = new URL(link.href);
      const pathname = url.pathname;
      
      // Prefetch the page
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = pathname;
      document.head.appendChild(prefetchLink);
    }
  });
};

// Initialize all ultra-fast optimizations
export const initUltraFastMode = () => {
  registerUltraFastSW();
  preloadCriticalResources();
  enableInstantTransitions();
  
  console.log('🚀 Ultra Fast Mode initialized - App is now INSANELY FAST!');
};
