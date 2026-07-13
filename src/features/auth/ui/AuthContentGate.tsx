'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { selectAuth } from '@/shared/auth'
import { useAppSelector } from '@/shared/hooks'

import { isAuthStatusPath } from '../lib/redirect'
import { AuthLoadingIndicator } from './AuthLoadingIndicator'

const LOADER_REVEAL_DELAY_MS = 200
const LOADER_FINISH_DURATION_MS = 180

type AuthContentGateProps = {
  children: ReactNode
}

export function AuthContentGate({ children }: AuthContentGateProps) {
  const pathname = usePathname()
  const { isAuthorized, isInitialized, isInitializing } = useAppSelector(selectAuth)
  const shouldBlockProtectedContent = isInitialized && !isAuthorized && !isAuthStatusPath(pathname)
  const isContentBlocked = !isInitialized || shouldBlockProtectedContent
  const isCheckingAccess = isInitializing || shouldBlockProtectedContent
  const hasReachedRevealDelayRef = useRef(false)
  const [isLoaderMounted, setIsLoaderMounted] = useState(true)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    const remainingDelay = Math.max(0, LOADER_REVEAL_DELAY_MS - performance.now())

    if (remainingDelay === 0) {
      hasReachedRevealDelayRef.current = true

      return
    }

    const timeoutId = window.setTimeout(() => {
      hasReachedRevealDelayRef.current = true
    }, remainingDelay)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (isContentBlocked) {
      return
    }

    if (!hasReachedRevealDelayRef.current) {
      setIsLoaderMounted(false)

      return
    }

    setIsFinishing(true)

    const timeoutId = window.setTimeout(() => {
      setIsLoaderMounted(false)
    }, LOADER_FINISH_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isContentBlocked])

  if (isLoaderMounted) {
    return <AuthLoadingIndicator isCheckingAccess={isCheckingAccess} isFinishing={isFinishing} />
  }

  return children
}
