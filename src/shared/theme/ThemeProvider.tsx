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

import { darkThemeConfig, themeConfig } from './themeConfig'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const current = window.localStorage.getItem(STORAGE_KEY)
  if (isThemeMode(current)) {
    return current
  }

  const fromAttr = document.documentElement.dataset.theme
  return isThemeMode(fromAttr) ? fromAttr : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeInternal] = useState<ThemeMode>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setModeInternal(readStoredMode())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    document.documentElement.dataset.theme = mode
    window.localStorage.setItem(STORAGE_KEY, mode)
  }, [mode, mounted])

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
