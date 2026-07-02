'use client'

import { useEffect, useState } from 'react'
import { getLocalGreeting, getMsUntilNextLocalGreetingChange } from '@/shared/utils/localGreeting'
import { useSidebar } from '@/widgets/sidebar'
import styles from './Header.module.css'

export function Header() {
  const { openMobileSidebar } = useSidebar()
  const [greeting, setGreeting] = useState(() => getLocalGreeting())

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    function scheduleGreetingUpdate() {
      timeoutId = setTimeout(() => {
        setGreeting(getLocalGreeting())
        scheduleGreetingUpdate()
      }, getMsUntilNextLocalGreetingChange())
    }

    setGreeting(getLocalGreeting())
    scheduleGreetingUpdate()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

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
        <span className={styles.accent}>ГОК</span>
      </div>

      <div className={styles.user}>
        <span>{greeting}, Ярослав Сергеевич</span>
        <span className={styles.avatar} aria-hidden="true" />
      </div>
    </header>
  )
}
