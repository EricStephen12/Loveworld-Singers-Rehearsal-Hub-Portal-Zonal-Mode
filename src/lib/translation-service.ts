// AI Translation Service for Song Lyrics

export type SupportedLanguage = 
  | 'en' // English
  | 'fr' // French
  | 'es' // Spanish
  | 'pt' // Portuguese
  | 'sw' // Swahili
  | 'yo' // Yoruba
  | 'ig' // Igbo
  | 'ha' // Hausa
  | 'ar' // Arabic
  | 'zh' // Chinese

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  fr: { name: 'French', flag: '🇫🇷' },
  es: { name: 'Spanish', flag: '🇪🇸' },
  pt: { name: 'Portuguese', flag: '🇵🇹' },
  sw: { name: 'Swahili', flag: '🇰🇪' },
  yo: { name: 'Yoruba', flag: '🇳🇬' },
  ig: { name: 'Igbo', flag: '🇳🇬' },
  ha: { name: 'Hausa', flag: '🇳🇬' },
  ar: { name: 'Arabic', flag: '🇸🇦' },
  zh: { name: 'Chinese', flag: '🇨🇳' },
}

export interface TranslationResult {
  success: boolean
  translatedText?: string
  error?: string
  cached?: boolean
}

export class TranslationService {
  
  /**
   * Translate lyrics to target language
   */
  static async translateLyrics(
    lyrics: string,
    targetLanguage: SupportedLanguage,
    userId: string,
    songId: string
  ): Promise<TranslationResult> {
    try {
      // Check if translation is cached
      const cached = await this.getCachedTranslation(userId, songId, targetLanguage)
      if (cached) {
        return {
          success: true,
          translatedText: cached,
          cached: true
        }
      }

      // Call translation API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: lyrics,
          targetLanguage,
          userId,
          songId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Translation failed'
        }
      }

      // Cache the translation
      await this.cacheTranslation(userId, songId, targetLanguage, data.translatedText)

      return {
        success: true,
        translatedText: data.translatedText,
        cached: false
      }
    } catch (error) {
      console.error('Translation error:', error)
      return {
        success: false,
        error: 'Failed to translate. Please try again.'
      }
    }
  }

  /**
   * Get cached translation from localStorage
   */
  private static async getCachedTranslation(
    userId: string,
    songId: string,
    language: SupportedLanguage
  ): Promise<string | null> {
    try {
      const cacheKey = `translation_${userId}_${songId}_${language}`
      const cached = localStorage.getItem(cacheKey)
      
      if (cached) {
        const data = JSON.parse(cached)
        // Check if cache is less than 30 days old
        const cacheAge = Date.now() - data.timestamp
        const thirtyDays = 30 * 24 * 60 * 60 * 1000
        
        if (cacheAge < thirtyDays) {
          return data.text
        } else {
          // Remove expired cache
          localStorage.removeItem(cacheKey)
        }
      }
      
      return null
    } catch (error) {
      console.error('Error reading cache:', error)
      return null
    }
  }

  /**
   * Cache translation in localStorage
   */
  private static async cacheTranslation(
    userId: string,
    songId: string,
    language: SupportedLanguage,
    text: string
  ): Promise<void> {
    try {
      const cacheKey = `translation_${userId}_${songId}_${language}`
      const data = {
        text,
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error caching translation:', error)
    }
  }

  /**
   * Clear all cached translations for a user
   */
  static clearCache(userId: string): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(`translation_${userId}_`)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }
}
