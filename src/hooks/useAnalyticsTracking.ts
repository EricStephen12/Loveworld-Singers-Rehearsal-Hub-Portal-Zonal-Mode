'use client';

import { useEffect, useRef } from 'react';
import { SimplifiedAnalyticsService } from '@/lib/simplified-analytics-service';

/**
 * Hook to track feature engagement when a page/feature is used
 * @param featureName - Name of the feature being tracked (e.g., 'audiolab', 'praise_night', 'groups')
 * @param enabled - Whether tracking is enabled (default: true)
 */
export function useFeatureTracking(featureName: string, enabled: boolean = true) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!enabled || hasTracked.current) return;
    
    const trackFeature = async () => {
      try {
        await SimplifiedAnalyticsService.incrementFeatureEngagements(featureName, 1);
        hasTracked.current = true;
      } catch (error) {
        console.error('Feature tracking failed:', error);
      }
    };

    // Small delay to ensure page is actually being used
    const timer = setTimeout(trackFeature, 2000);
    return () => clearTimeout(timer);
  }, [featureName, enabled]);
}

/**
 * Track a one-time feature engagement manually
 */
export async function trackFeatureEngagement(featureName: string) {
  try {
    await SimplifiedAnalyticsService.incrementFeatureEngagements(featureName, 1);
  } catch (error) {
    console.error('Feature tracking failed:', error);
  }
}
