'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { useAuth } from '../model/useAuth'

type InitAppProps = {
  children: ReactNode
}

export function InitApp({ children }: InitAppProps) {
  const { initApp } = useAuth()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) {
      return
    }

    initializedRef.current = true
    void initApp()
  }, [initApp])

  return children
}
