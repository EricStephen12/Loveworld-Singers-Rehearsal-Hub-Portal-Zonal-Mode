import { useEffect, useCallback, useRef } from 'react';
import { performanceMonitoring, bundleOptimization } from '@/utils/performance';

export const usePerformance = () => {
  const startTimeRef = useRef<number>(0);

  // Start performance measurement
  const startMeasurement = useCallback((name: string) => {
    startTimeRef.current = performance.now();
    console.log(`Starting measurement: ${name}`);
  }, []);

  // End performance measurement
  const endMeasurement = useCallback((name: string) => {
    if (startTimeRef.current > 0) {
      const duration = performanceMonitoring.measureCustomMetric(name, startTimeRef.current);
      startTimeRef.current = 0;
      return duration;
    }
    return 0;
  }, []);

  // Preload critical resources
  const preloadCriticalResources = useCallback(() => {
    bundleOptimization.preloadCriticalResources();
  }, []);

  // Prefetch next likely resources
  const prefetchResources = useCallback((resources: string[]) => {
    bundleOptimization.prefetchNextResources(resources);
  }, []);

  // Optimize images on page load
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" if not already present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }, []);

  // Debounce function for performance
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // Throttle function for performance
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Initialize performance optimizations
  useEffect(() => {
    // Preload critical resources
    preloadCriticalResources();

    // Optimize images
    optimizeImages();

    // Prefetch likely next pages
    const likelyNextPages = [
      '/pages/rehearsals',
      '/pages/profile',
      '/pages/praise-night'
    ];
    prefetchResources(likelyNextPages);

    // Monitor performance
    if (process.env.NODE_ENV === 'production') {
      performanceMonitoring.measureWebVitals();
    }
  }, [preloadCriticalResources, optimizeImages, prefetchResources]);

  return {
    startMeasurement,
    endMeasurement,
    preloadCriticalResources,
    prefetchResources,
    optimizeImages,
    debounce,
    throttle
  };
};
