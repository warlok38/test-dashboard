'use client'

import styles from './AuthLoadingIndicator.module.css'

type AuthLoadingIndicatorProps = {
  text: string
}

export function AuthLoadingIndicator({ text }: AuthLoadingIndicatorProps) {
  return (
    <div className={styles.loading}>
      <div className={styles.indicator}>
        <span className={styles.loadingText}>{text}</span>
        <div className={styles.progressTrack}>
          <div className={styles.progressLine} />
        </div>
      </div>
    </div>
  )
}
