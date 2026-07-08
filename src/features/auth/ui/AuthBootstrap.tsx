'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { useAuthBootstrap } from '../model/useAuthBootstrap'

type AuthBootstrapProps = {
  children: ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const { bootstrapAuth } = useAuthBootstrap()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) {
      return
    }

    initializedRef.current = true
    void bootstrapAuth()
  }, [bootstrapAuth])

  return children
}
