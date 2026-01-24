/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-safe configuration with minimal caching
  experimental: {
    // Disable all experimental features that might cause caching issues
    optimizeCss: false,
    optimizePackageImports: [],
  },
  
  // Basic optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: false,
  
  // Transpile Supabase for compatibility
  transpilePackages: ['@supabase/supabase-js'],
  
  // Image optimization with minimal caching
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 0, // No caching for images in production
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Minimal webpack optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // Minimal bundle optimization
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
    
    return config;
  },
  
  // Minimal headers - no aggressive caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Disable caching for HTML files
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300' // 5 minutes only
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;


