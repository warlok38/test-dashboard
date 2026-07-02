export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}
