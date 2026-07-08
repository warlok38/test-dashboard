'use client'

import type { ReactNode } from 'react'
import { Spin } from 'antd'
import { usePathname } from 'next/navigation'

import { selectAuth } from '@/shared/auth'
import { useAppSelector } from '@/shared/hooks'

import { isAuthStatusPath } from '../lib/redirect'
import styles from './AuthContentGate.module.css'

type AuthContentGateProps = {
  children: ReactNode
}

export function AuthContentGate({ children }: AuthContentGateProps) {
  const pathname = usePathname()
  const { isAuthorized, isInitialized, isInitializing } = useAppSelector(selectAuth)
  const shouldBlockProtectedContent = isInitialized && !isAuthorized && !isAuthStatusPath(pathname)

  if (!isInitialized || shouldBlockProtectedContent) {
    return (
      <div className={styles.loading}>
        <Spin />
        <span className={styles.loadingText}>
          {isInitializing ? 'Авторизация...' : 'Загрузка приложения...'}
        </span>
      </div>
    )
  }

  return children
}
