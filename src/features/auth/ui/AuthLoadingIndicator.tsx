'use client'

import { useEffect, useState } from 'react'
import classNames from 'classnames'

import styles from './AuthLoadingIndicator.module.css'

const ACCESS_STAGE_DELAY_MS = 200

type AuthLoadingIndicatorProps = {
  isCheckingAccess: boolean
  isFinishing: boolean
}

export function AuthLoadingIndicator({ isCheckingAccess, isFinishing }: AuthLoadingIndicatorProps) {
  const [showAccessStage, setShowAccessStage] = useState(false)

  useEffect(() => {
    if (!isCheckingAccess || showAccessStage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setShowAccessStage(true)
    }, ACCESS_STAGE_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isCheckingAccess, showAccessStage])

  return (
    <div className={classNames(styles.loading, isFinishing && styles.finishing)}>
      <div className={styles.indicator}>
        <span className={styles.loadingText}>
          {showAccessStage ? 'Проверяем доступ...' : 'Загружаем интерфейс...'}
        </span>
        <div className={styles.progressTrack}>
          <div className={styles.progressLine} />
        </div>
      </div>
    </div>
  )
}
