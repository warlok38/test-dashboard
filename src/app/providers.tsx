'use client'

import type { PropsWithChildren } from 'react'

import { ThemeProvider } from '@/shared/theme'

export function Providers({ children }: PropsWithChildren) {
  return <ThemeProvider>{children}</ThemeProvider>
}
