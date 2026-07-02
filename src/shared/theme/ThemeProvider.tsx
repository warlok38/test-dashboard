'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'

import ruRU from 'antd/locale/ru_RU'
import { App as AntApp, ConfigProvider, theme as antdTheme } from 'antd'
import type { ThemeConfig } from 'antd'

import { THEME_COOKIE_MAX_AGE, THEME_STORAGE_KEY, isThemeMode, type ThemeMode } from './constants'
import { darkThemeConfig, themeConfig } from './themeConfig'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function readStoredMode(fallback: ThemeMode): ThemeMode {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const current = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (isThemeMode(current)) {
      return current
    }
  } catch {
    // Ignore storage access errors and fall back to the document attribute.
  }

  const fromAttr = document.documentElement.dataset.theme
  return isThemeMode(fromAttr) ? fromAttr : fallback
}

export function ThemeProvider({
  children,
  initialMode = 'light'
}: {
  children: ReactNode
  initialMode?: ThemeMode
}) {
  const [mode, setModeInternal] = useState<ThemeMode>(() => readStoredMode(initialMode))

  useEffect(() => {
    document.documentElement.dataset.theme = mode
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch {
      // Ignore storage access errors; the in-memory theme still applies.
    }
    document.cookie = `${THEME_STORAGE_KEY}=${mode}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`
  }, [mode])

  const setMode = useCallback((next: ThemeMode) => {
    setModeInternal(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setModeInternal((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const mergedTheme = useMemo((): ThemeConfig => {
    const base: ThemeConfig = mode === 'light' ? themeConfig : darkThemeConfig
    return {
      ...base,
      algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      cssVar: {},
      hashed: false,
      token: {
        ...base.token
      }
    }
  }, [mode])

  const value = useMemo(
    (): ThemeContextType => ({
      mode,
      toggleTheme,
      setMode
    }),
    [mode, toggleTheme, setMode]
  )

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider locale={ruRU} theme={mergedTheme}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
