// ULTRA FAST Service Worker - INSTANT LOADING with Aggressive Caching

const CACHE_VERSION = 'ultra-fast-v3.0.0'; // ✅ Updated for instant loading
const CACHE_NAMES = {
  STATIC: 'static-ultra-fast-v3',
  API: 'api-ultra-fast-v3',
  IMAGES: 'images-ultra-fast-v3',
  PAGES: 'pages-ultra-fast-v3'
};

// Cache EVERYTHING aggressively
const AGGRESSIVE_CACHE_PATTERNS = [
  // All pages
  /^\/$/,
  /^\/home/,
  /^\/pages\/rehearsals/,
  /^\/pages\/profile/,
  /^\/pages\/praise-night/,
  /^\/admin/,
  /^\/auth/,
  
  // All API calls
  /^\/api\//,
  
  // All static assets
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)$/,
  
  // Cloudinary images
  /cloudinary\.com/,
  
  // Supabase calls
  /supabase\.co/
];

// Critical resources to pre-cache for offline use
const CRITICAL_RESOURCES = [
  '/',
  '/home',
  '/pages/rehearsals',
  '/pages/profile',
  '/pages/praise-night',
  '/logo.png',
  '/lmm.png',
  '/manifest.json'
];

// Install - Cache critical resources immediately
self.addEventListener('install', (event) => {
  console.log('🚀 ULTRA FAST SW installing...');

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.STATIC).then(cache => {
        return cache.addAll(CRITICAL_RESOURCES.filter(url =>
          url.endsWith('.png') || url.endsWith('.json')
        )).catch(err => {
          console.log('Failed to cache some static resources:', err);
        });
      }),
      caches.open(CACHE_NAMES.PAGES).then(cache => {
        return cache.addAll(CRITICAL_RESOURCES.filter(url =>
          !url.endsWith('.png') && !url.endsWith('.json')
        )).catch(err => {
          console.log('Failed to cache some pages:', err);
        });
      }),
      caches.open(CACHE_NAMES.API),
      caches.open(CACHE_NAMES.IMAGES)
    ]).then(() => {
      console.log('🚀 ULTRA FAST SW installed - Critical resources cached for offline use!');
      return self.skipWaiting();
    })
  );
});

// Activate - Take control immediately
self.addEventListener('activate', (event) => {
  console.log('🚀 ULTRA FAST SW activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🚀 ULTRA FAST SW activated - Taking control!');
      return self.clients.claim();
    })
  );
});

// Fetch - ULTRA AGGRESSIVE CACHING
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Determine cache strategy based on URL
  if (isPageRequest(request)) {
    event.respondWith(ultraFastPageStrategy(request));
  } else if (isImageRequest(request)) {
    event.respondWith(ultraFastImageStrategy(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(ultraFastAPIStrategy(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(ultraFastStaticStrategy(request));
  } else {
    event.respondWith(ultraFastDefaultStrategy(request));
  }
});

// ULTRA FAST STRATEGIES

// Pages: Cache first, then network, fallback to home page
async function ultraFastPageStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.PAGES);

  // Try cache first (INSTANT)
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Update cache in background
    fetchAndCache(request, cache);
    return cachedResponse;
  }

  // Try network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for page, serving cached content:', request.url);
  }

  // If offline and no cache for this specific page, try to serve home page or any cached page
  const url = new URL(request.url);

  // Try to serve home page if available
  const homeResponse = await cache.match('/home');
  if (homeResponse) {
    return homeResponse;
  }

  // Try to serve root page
  const rootResponse = await cache.match('/');
  if (rootResponse) {
    return rootResponse;
  }

  // Last resort: serve any cached HTML page
  const allCaches = await caches.keys();
  for (const cacheName of allCaches) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    for (const key of keys) {
      const response = await cache.match(key);
      if (response && response.headers.get('content-type')?.includes('text/html')) {
        return response;
      }
    }
  }

  // Only if absolutely nothing is cached, return minimal offline page
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>LWSRHP - Offline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: system-ui;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }
          h1 { margin-bottom: 20px; }
          button {
            background: white;
            color: #667eea;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>🎵 LWSRHP</h1>
        <p>You're currently offline. Please check your connection and try again.</p>
        <button onclick="location.reload()">Retry</button>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Images: Cache first, aggressive caching, serve placeholder when offline
async function ultraFastImageStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.IMAGES);

  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // When offline and image not cached, try to serve logo or return transparent pixel
    const logoResponse = await cache.match('/logo.png');
    if (logoResponse) {
      return logoResponse;
    }

    // Return 1x1 transparent pixel as fallback
    const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    return fetch(transparentPixel);
  }
}

// API: Network first with aggressive caching, serve cached data when offline
async function ultraFastAPIStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.API);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache API responses
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    // When offline, serve cached API data
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Serving cached API data:', request.url);
      return cachedResponse;
    }

    // If no cache, return empty array/object instead of error
    const url = new URL(request.url);
    const isArrayEndpoint = url.pathname.includes('songs') ||
                           url.pathname.includes('categories') ||
                           url.pathname.includes('praise-nights');

    return new Response(
      JSON.stringify(isArrayEndpoint ? [] : {}),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Static assets: Cache forever, serve cached when offline
async function ultraFastStaticStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.STATIC);

  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // When offline, return empty response with appropriate content type
    const url = new URL(request.url);
    const ext = url.pathname.split('.').pop();

    const contentTypes = {
      'js': 'application/javascript',
      'css': 'text/css',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf'
    };

    return new Response('', {
      status: 200,
      headers: { 'Content-Type': contentTypes[ext] || 'text/plain' }
    });
  }
}

// Default: Cache first, serve cached when offline
async function ultraFastDefaultStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.STATIC);

  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // When offline, try to find any cached version
    const allCaches = await caches.keys();
    for (const cacheName of allCaches) {
      const cache = await caches.open(cacheName);
      const response = await cache.match(request);
      if (response) {
        return response;
      }
    }

    // Return empty response instead of error
    return new Response('', { status: 200 });
  }
}

// Helper function to fetch and cache in background
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    // Ignore background fetch errors
  }
}

// Helper functions
function isPageRequest(request) {
  return request.mode === 'navigate' || 
         request.headers.get('accept')?.includes('text/html');
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/) ||
         url.hostname.includes('cloudinary.com');
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('supabase.co');
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/) ||
         url.pathname.startsWith('/_next/static/');
}

// Background sync for instant updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 Background sync - keeping cache fresh');
  
  // Pre-cache likely next pages
  const likelyPages = [
    '/',
    '/home',
    '/pages/rehearsals',
    '/pages/profile',
    '/pages/praise-night'
  ];
  
  const cache = await caches.open(CACHE_NAMES.PAGES);
  
  for (const page of likelyPages) {
    try {
      const response = await fetch(page);
      if (response.ok) {
        cache.put(page, response.clone());
      }
    } catch (error) {
      // Ignore errors
    }
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAMES.PAGES).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  // Handle cache clearing requests
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(CACHE_NAMES.STATIC),
        caches.delete(CACHE_NAMES.API),
        caches.delete(CACHE_NAMES.IMAGES),
        caches.delete(CACHE_NAMES.PAGES)
      ]).then(() => {
        console.log('🧹 Service Worker cache cleared');
        event.ports[0]?.postMessage({ success: true });
      })
    );
  }
  
  // Handle version-based cache invalidation
  if (event.data && event.data.type === 'VERSION_UPDATE') {
    const newVersion = event.data.version;
    if (newVersion !== CACHE_VERSION) {
      console.log('🔄 Version changed, clearing cache...');
      event.waitUntil(
        Promise.all([
          caches.delete(CACHE_NAMES.STATIC),
          caches.delete(CACHE_NAMES.API),
          caches.delete(CACHE_NAMES.IMAGES),
          caches.delete(CACHE_NAMES.PAGES)
        ]).then(() => {
          console.log('✅ Cache cleared for new version');
        })
      );
    }
  }
});

console.log('🚀 ULTRA FAST Service Worker loaded - Ready for instant speed!');
