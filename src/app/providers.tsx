'use client'

import type { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'

import { AuthBootstrap, AuthRedirectWatcher } from '@/features/auth'
import { ThemeProvider } from '@/shared/theme'

import { store } from './store'

export function Providers({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthBootstrap>
          <AuthRedirectWatcher />
          {children}
        </AuthBootstrap>
      </ThemeProvider>
    </Provider>
  )
}
