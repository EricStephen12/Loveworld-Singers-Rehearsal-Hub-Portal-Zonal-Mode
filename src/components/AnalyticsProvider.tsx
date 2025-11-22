'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/utils/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when pathname changes
    trackPageView(pathname);
  }, [pathname]);

  return <>{children}</>;
};

