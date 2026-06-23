'use client'

import type { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'

import { ThemeProvider } from '@/shared/theme'
import { store } from './store'

export function Providers({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  )
}
