export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,        // 10MB
  MAX_STORAGE_QUOTA: 200 * 1024 * 1024,   // 200MB
  MAX_THUMBNAIL_SIZE: 500 * 1024,         // 500KB
} as const

export const JWT_EXPIRATION = '7d'
