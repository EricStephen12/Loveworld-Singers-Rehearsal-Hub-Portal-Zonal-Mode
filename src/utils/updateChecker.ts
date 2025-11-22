// Update checker for PWA - notifies users when new version is available
export class UpdateChecker {
  private static instance: UpdateChecker;
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  static getInstance(): UpdateChecker {
    if (!UpdateChecker.instance) {
      UpdateChecker.instance = new UpdateChecker();
    }
    return UpdateChecker.instance;
  }

  async initialize() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('🚀 Service Worker registered:', this.registration);

        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          console.log('🔄 New Service Worker found, updating...');
          this.updateAvailable = true;
          this.showUpdateNotification();
        });

        // Check for updates every 5 minutes
        setInterval(() => {
          this.checkForUpdates();
        }, 5 * 60 * 1000);

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  private async checkForUpdates() {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('🔍 Checking for updates...');
      } catch (error) {
        console.error('❌ Update check failed:', error);
      }
    }
  }

  private showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span class="font-medium">Update Available!</span>
      </div>
      <button id="update-btn" class="bg-white text-green-600 px-3 py-1 rounded text-sm font-medium hover:bg-green-50 transition-colors">
        Update Now
      </button>
      <button id="dismiss-btn" class="text-green-200 hover:text-white transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;

    document.body.appendChild(notification);

    // Handle update button click
    const updateBtn = notification.querySelector('#update-btn');
    const dismissBtn = notification.querySelector('#dismiss-btn');

    updateBtn?.addEventListener('click', () => {
      this.applyUpdate();
      notification.remove();
    });

    dismissBtn?.addEventListener('click', () => {
      notification.remove();
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  private async applyUpdate() {
    if (this.registration && this.registration.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to use the new service worker
      window.location.reload();
    }
  }

  // Force check for updates (call this when user manually refreshes)
  async forceUpdate() {
    console.log('🔄 Force checking for updates...');
    await this.checkForUpdates();
  }
}

// Initialize update checker when the app loads
export const initializeUpdateChecker = () => {
  const updateChecker = UpdateChecker.getInstance();
  updateChecker.initialize();
};
