export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}
