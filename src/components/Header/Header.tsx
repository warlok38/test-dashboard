'use client'

import { useSidebar } from '../Sidebar'
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
        <span className={styles.title}>COOL DASHBOARD</span>
        <span className={styles.subtitle}>Production Monitor</span>
      </div>

      <div className={styles.actions} aria-label="Действия панели" />
    </header>
  )
}
