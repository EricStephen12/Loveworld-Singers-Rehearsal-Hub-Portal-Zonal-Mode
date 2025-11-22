import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/utils/analytics';

export const useAnalytics = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when pathname changes
    trackPageView(pathname);
  }, [pathname]);

  return {
    trackPageView,
    trackEvent: (type: string, metadata?: Record<string, any>) => {
      // This will be implemented in the analytics utility
      console.log('Tracking event:', type, metadata);
    }
  };
};

