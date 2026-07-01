'use client'

import { useSidebar } from '@/widgets/sidebar'
import styles from './Header.module.css'

export function Header() {
  const { openMobileSidebar } = useSidebar()

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={openMobileSidebar}
        aria-label="Открыть меню"
      >
        <span />
        <span />
        <span />
      </button>

      <div className={styles.titleGroup}>
        <span className={styles.title}>ЦИФРОВОЙ</span>
        <strong className={styles.accent}>ГОК</strong>
      </div>

      <div className={styles.user}>
        <span>Доброе утро, Ярослав Сергеевич</span>
        <span className={styles.avatar} aria-hidden="true" />
      </div>
    </header>
  )
}
