import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { trackPageView } from '@/utils/analytics'

export const useAnalytics = () => {
  const pathname = usePathname()

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  return {
    trackPageView,
    trackEvent: (type: string, metadata?: Record<string, any>) => {
      console.log('Tracking event:', type, metadata)
    }
  }
}
