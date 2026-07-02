'use client'

import { useEffect, useMemo, useState } from 'react'

import styles from '../Sidebar.module.css'

type SidebarDateTimeProps = {
  collapsed?: boolean
}

const LOCALE = 'ru-RU'
const MINUTE_MS = 60 * 1000

const fullDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
})

const yearFormatter = new Intl.DateTimeFormat(LOCALE, {
  year: 'numeric'
})

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit'
})

const shortWeekdayFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short'
})

const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit'
})

function capitalizeFirstLetter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getMsUntilNextMinute(date: Date): number {
  return MINUTE_MS - (date.getSeconds() * 1000 + date.getMilliseconds())
}

export function SidebarDateTime({ collapsed = false }: SidebarDateTimeProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    function scheduleDateUpdate() {
      const now = new Date()

      setCurrentDate(now)
      timeoutId = setTimeout(scheduleDateUpdate, getMsUntilNextMinute(now))
    }

    scheduleDateUpdate()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  const formattedDate = useMemo(() => {
    if (!currentDate) {
      return null
    }

    const fullDate = capitalizeFirstLetter(fullDateFormatter.format(currentDate))
    const shortWeekday = capitalizeFirstLetter(
      shortWeekdayFormatter.format(currentDate).replace('.', '')
    )
    const shortDate = shortDateFormatter.format(currentDate)
    const year = yearFormatter.format(currentDate)
    const time = timeFormatter.format(currentDate)
    const secondaryLabel = [year, time].filter(Boolean).join(' · ')
    const title = `${fullDate} ${secondaryLabel}`

    return {
      fullDate,
      secondaryLabel,
      shortDate,
      shortWeekday,
      time,
      title
    }
  }, [currentDate])

  if (!formattedDate) {
    return (
      <div
        className={collapsed ? styles.dateBlockCollapsed : styles.dateBlock}
        aria-hidden="true"
      />
    )
  }

  if (collapsed) {
    return (
      <div
        className={styles.dateBlockCollapsed}
        title={formattedDate.title}
        aria-label={formattedDate.title}
      >
        <span className={styles.dateCollapsedWeekday}>{formattedDate.shortWeekday}</span>
        <span className={styles.dateCollapsedDate}>{formattedDate.shortDate}</span>
        <span className={styles.dateCollapsedTime}>{formattedDate.time}</span>
      </div>
    )
  }

  return (
    <div className={styles.dateBlock} title={formattedDate.title} aria-label={formattedDate.title}>
      <span className={styles.dateLabel}>{formattedDate.fullDate}</span>
      <span className={styles.dateMeta}>{formattedDate.secondaryLabel}</span>
    </div>
  )
}
