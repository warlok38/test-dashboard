'use client'

import type { ReactNode } from 'react'
import { Spin } from 'antd'

import { selectIsAuthInitialized, selectIsAuthInitializing } from '@/entities/auth'
import { useAppSelector } from '@/shared/store'

import styles from './AuthContentGate.module.css'

type AuthContentGateProps = {
  children: ReactNode
}

export function AuthContentGate({ children }: AuthContentGateProps) {
  const isInitialized = useAppSelector(selectIsAuthInitialized)
  const isInitializing = useAppSelector(selectIsAuthInitializing)

  if (!isInitialized) {
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
