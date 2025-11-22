// Safe logger - only logs in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  error: (...args: any[]) => {
    // Always log errors, but sanitize sensitive data
    const sanitized = args.map(arg => {
      if (typeof arg === 'string') {
        // Remove potential sensitive data patterns
        return arg
          .replace(/password[=:]\s*['"]?[^'"]+['"]?/gi, 'password=***')
          .replace(/token[=:]\s*['"]?[^'"]+['"]?/gi, 'token=***')
          .replace(/secret[=:]\s*['"]?[^'"]+['"]?/gi, 'secret=***')
          .replace(/key[=:]\s*['"]?[^'"]+['"]?/gi, 'key=***')
          .replace(/auth[=:]\s*['"]?[^'"]+['"]?/gi, 'auth=***')
      }
      return arg
    })
    console.error(...sanitized)
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  }
}

// Disable all console logs in production
if (typeof window !== 'undefined' && !isDevelopment) {
  // Override console methods in production
  const noop = () => {}
  console.log = noop
  console.warn = noop
  console.info = noop
  console.debug = noop
  // Keep console.error for critical errors, but sanitized
  const originalError = console.error
  console.error = (...args: any[]) => {
    const sanitized = args.map(arg => {
      if (typeof arg === 'string') {
        return arg
          .replace(/password[=:]\s*['"]?[^'"]+['"]?/gi, 'password=***')
          .replace(/token[=:]\s*['"]?[^'"]+['"]?/gi, 'token=***')
          .replace(/secret[=:]\s*['"]?[^'"]+['"]?/gi, 'secret=***')
          .replace(/key[=:]\s*['"]?[^'"]+['"]?/gi, 'key=***')
      }
      return arg
    })
    originalError(...sanitized)
  }
}
