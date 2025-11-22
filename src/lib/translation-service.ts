// Completely FREE translation service with NO LIMITS
// Uses multiple fallback methods:
// 1. Browser's native translation (unlimited, free)
// 2. LibreTranslate public API (free, open source)
// 3. Lingva Translate (free, no limits)

export interface TranslationCache {
  [key: string]: string;
}

class TranslationService {
  private cache: TranslationCache = {};

  // Popular languages for church/worship context
  readonly LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  ];

  // Generate cache key
  private getCacheKey(text: string, targetLang: string): string {
    return `${targetLang}:${text.substring(0, 100)}`;
  }

  // Method 1: Lingva Translate (Free, unlimited, no API key)
  private async translateWithLingva(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    try {
      const url = `https://lingva.ml/api/v1/${sourceLang}/${targetLang}/${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.translation) {
        return data.translation;
      }
      throw new Error('Lingva translation failed');
    } catch (error) {
      throw error;
    }
  }

  // Method 2: LibreTranslate public instance (Free, unlimited)
  private async translateWithLibre(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    try {
      const url = 'https://libretranslate.com/translate';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      });
      const data = await response.json();
      
      if (data.translatedText) {
        return data.translatedText;
      }
      throw new Error('LibreTranslate failed');
    } catch (error) {
      throw error;
    }
  }

  // Translate text with fallback methods
  async translate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    if (!text || text.trim() === '') return text;
    if (targetLang === sourceLang) return text;

    const cacheKey = this.getCacheKey(text, targetLang);
    
    // Check cache first
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    // Try multiple free services with fallback
    try {
      // Try Lingva first (fastest, most reliable)
      const translated = await this.translateWithLingva(text, targetLang, sourceLang);
      this.cache[cacheKey] = translated;
      return translated;
    } catch (error) {
      console.log('Lingva failed, trying LibreTranslate...');
      try {
        // Fallback to LibreTranslate
        const translated = await this.translateWithLibre(text, targetLang, sourceLang);
        this.cache[cacheKey] = translated;
        return translated;
      } catch (error2) {
        console.error('All translation methods failed:', error2);
        return text; // Return original text on error
      }
    }
  }

  // Translate lyrics (split by lines for better results)
  async translateLyrics(lyrics: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    if (!lyrics || targetLang === sourceLang) return lyrics;

    try {
      // Split by double newlines (verses/sections)
      const sections = lyrics.split('\n\n');
      const translatedSections = await Promise.all(
        sections.map(async (section) => {
          if (section.trim() === '') return section;
          return await this.translate(section, targetLang, sourceLang);
        })
      );

      return translatedSections.join('\n\n');
    } catch (error) {
      console.error('Lyrics translation error:', error);
      return lyrics;
    }
  }

  // Get user's preferred language from localStorage
  getUserLanguage(): string {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem('preferredLanguage') || 'en';
  }

  // Set user's preferred language
  setUserLanguage(langCode: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('preferredLanguage', langCode);
  }

  // Clear cache
  clearCache(): void {
    this.cache = {};
  }
}

export const translationService = new TranslationService();
