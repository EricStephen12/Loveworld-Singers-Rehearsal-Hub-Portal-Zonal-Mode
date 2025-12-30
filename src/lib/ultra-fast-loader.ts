// Stub for ultra-fast-loader
export const ultraFastLoader = {
  preloadData: () => Promise.resolve(),
  getCachedData: () => null,
  clearCache: () => {},
  getPages: async () => {
    console.log('UltraFastLoader getPages (stub)');
    return [];
  },
  getSongs: async (pageId: number) => {
    console.log(`UltraFastLoader getSongs for page ${pageId} (stub)`);
    return [];
  },
  getCacheStats: () => {
    console.log('UltraFastLoader getCacheStats (stub)');
    return { hits: 0, misses: 0, size: 0 };
  },
  getProfile: async (userId: string) => {
    console.log(`UltraFastLoader getProfile for user ${userId} (stub)`);
    return null;
  }
};
