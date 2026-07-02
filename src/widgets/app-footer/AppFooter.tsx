import Link from 'next/link'

import { formatFooterCount } from '@/entities/production-summary'

import styles from './AppFooter.module.css'

const requestStats = {
  today: 0,
  week: 14,
  total: 25
}

const userStats = {
  today: 0,
  week: 6,
  total: 10
}

type FooterStats = typeof requestStats

function StatGroup({ title, stats }: { title: string; stats: FooterStats }) {
  return (
    <div className={styles.statGroup}>
      <span className={styles.statTitle}>{title}</span>
      <span>
        Сегодня: <b>{formatFooterCount(stats.today)}</b>
      </span>
      <span>
        За неделю: <b>{formatFooterCount(stats.week)}</b>
      </span>
      <span>
        Всего: <b>{formatFooterCount(stats.total)}</b>
      </span>
    </div>
  )
}

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label="Сервисы">
        <Link href="/">Цифровой ЗИФ</Link>
        <Link href="/">Сервис LLM</Link>
      </nav>
      <div className={styles.stats}>
        <StatGroup title="Запросов" stats={requestStats} />
        <span className={styles.divider} aria-hidden="true" />
        <StatGroup title="Пользователей" stats={userStats} />
      </div>
    </footer>
  )
}
