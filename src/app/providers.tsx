'use client'

import type { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'

import { AuthBootstrap, AuthRedirectWatcher } from '@/features/auth'
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
        <AuthBootstrap>
          <AuthRedirectWatcher />
          {children}
        </AuthBootstrap>
      </ThemeProvider>
    </Provider>
  )
}
