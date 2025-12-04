// Media caching utility
interface Media {
  id: string
  title: string
  description?: string
  type: string
  [key: string]: any
}

const CACHE_KEY = 'media-cache'
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes (media changes less frequently)

interface CachedData {
  data: Media[]
  timestamp: number
}

export class MediaCache {
  // Save media to localStorage
  static saveMedia(media: Media[]): void {
    try {
      const cached: CachedData = {
        data: media,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
      console.log(`💾 Cached ${media.length} media items`)
    } catch (error) {
      console.error('Failed to cache media:', error)
    }
  }

  // Load media from localStorage
  static loadMedia(): Media[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) {
        console.log('📭 No cached media found')
        return null
      }

      const parsed: CachedData = JSON.parse(cached)
      
      // Check if cache is still valid
      const age = Date.now() - parsed.timestamp
      if (age > CACHE_DURATION) {
        console.log('⏰ Cached media expired')
        this.clearMedia()
        return null
      }

      console.log(`⚡ Cache hit: ${parsed.data.length} media items loaded instantly`)
      return parsed.data
    } catch (error) {
      console.error('Failed to load cached media:', error)
      return null
    }
  }

  // Clear cached media
  static clearMedia(): void {
    try {
      localStorage.removeItem(CACHE_KEY)
      console.log('🗑️ Cleared cached media')
    } catch (error) {
      console.error('Failed to clear cached media:', error)
    }
  }
}
