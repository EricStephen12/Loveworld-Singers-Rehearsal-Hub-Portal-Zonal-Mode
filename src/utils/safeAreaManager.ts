/**
 * Safe Area Manager - Handles device-specific safe area adjustments
 * Fixes bottom bar cut-off issues on mobile devices
 */

export class SafeAreaManager {
  private static instance: SafeAreaManager;
  private safeAreaBottom: number = 0;
  private isInitialized: boolean = false;

  static getInstance(): SafeAreaManager {
    if (!SafeAreaManager.instance) {
      SafeAreaManager.instance = new SafeAreaManager();
    }
    return SafeAreaManager.instance;
  }

  /**
   * Initialize safe area detection
   */
  init(): void {
    if (this.isInitialized) return;

    this.detectSafeArea();
    this.setupEventListeners();
    this.applySafeAreaStyles();

    this.isInitialized = true;
  }

  /**
   * Detect the device's safe area
   */
  private detectSafeArea(): void {
    // Get safe area from CSS environment variables
    const testElement = document.createElement('div');
    testElement.style.position = 'fixed';
    testElement.style.bottom = '0';
    testElement.style.left = '0';
    testElement.style.right = '0';
    testElement.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
    testElement.style.visibility = 'hidden';
    testElement.style.pointerEvents = 'none';

    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const paddingBottom = computedStyle.paddingBottom;

    // Parse the padding value
    this.safeAreaBottom = parseInt(paddingBottom) || 0;

    // Clean up
    document.body.removeChild(testElement);

    // Fallback detection for devices without proper safe area support
    if (this.safeAreaBottom === 0) {
      this.detectFallbackSafeArea();
    }
  }

  /**
   * Fallback detection for devices without proper safe area support
   */
  private detectFallbackSafeArea(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      // iPhone X and later have home indicators
      const isIPhoneX = /iphone/.test(userAgent) && window.screen.height >= 812;
      this.safeAreaBottom = isIPhoneX ? 34 : 20; // iPhone X+ has 34px, older iPhones have 20px
    } else if (isAndroid) {
      // Android devices with gesture navigation
      this.safeAreaBottom = 24;
    } else {
      // Desktop or other devices
      this.safeAreaBottom = 0;
    }
  }

  /**
   * Setup event listeners for orientation changes and resize
   */
  private setupEventListeners(): void {
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.detectSafeArea();
        this.applySafeAreaStyles();
      }, 100);
    });

    // Handle resize events
    window.addEventListener('resize', () => {
      this.detectSafeArea();
      this.applySafeAreaStyles();
    });

    // Handle visual viewport changes (for mobile browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.detectSafeArea();
        this.applySafeAreaStyles();
      });
    }

    // Handle page visibility changes (when navigating between pages)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          this.detectSafeArea();
          this.applySafeAreaStyles();
        }, 200);
      }
    });

    // Handle popstate events (back/forward navigation)
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.detectSafeArea();
        this.applySafeAreaStyles();
      }, 100);
    });
  }

  /**
   * Apply safe area styles to the document
   */
  private applySafeAreaStyles(): void {
    const root = document.documentElement;

    // Set CSS custom properties
    root.style.setProperty('--safe-area-bottom', `${this.safeAreaBottom}px`);
    root.style.setProperty('--enhanced-safe-area-bottom', `${Math.max(this.safeAreaBottom, 24)}px`);

    // Add device-specific classes
    root.classList.remove('has-safe-area', 'no-safe-area');
    if (this.safeAreaBottom > 0) {
      root.classList.add('has-safe-area');
    } else {
      root.classList.add('no-safe-area');
    }
  }

  /**
   * Get the current safe area bottom value
   */
  getSafeAreaBottom(): number {
    return this.safeAreaBottom;
  }

  /**
   * Get enhanced safe area bottom (minimum 24px)
   */
  getEnhancedSafeAreaBottom(): number {
    return Math.max(this.safeAreaBottom, 24);
  }

  /**
   * Check if device has safe area
   */
  hasSafeArea(): boolean {
    return this.safeAreaBottom > 0;
  }

  /**
   * Manually trigger safe area recalculation
   * Useful when navigating between pages or when layout changes
   */
  recalculate(): void {
    this.detectSafeArea();
    this.applySafeAreaStyles();
  }
}

// Initialized via AppBootstrap or manual call
