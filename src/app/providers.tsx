'use client'

import type { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'

import { AuthRedirectWatcher, InitApp } from '@/features/auth'
import { store } from '@/shared/store'
import type { ThemeMode } from '@/shared/theme'
import { ThemeProvider } from '@/shared/theme'

type ProvidersProps = PropsWithChildren<{
  initialThemeMode?: ThemeMode
}>

export function Providers({ children, initialThemeMode }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider initialMode={initialThemeMode}>
        <InitApp>
          <AuthRedirectWatcher />
          {children}
        </InitApp>
      </ThemeProvider>
    </Provider>
  )
}
