'use client'

import classNames from 'classnames'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  getDeviationClassName,
  formatDeviation,
  formatSummaryNumber,
  type SummaryIndicatorCard
} from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'

type KpiCardProps = {
  active?: boolean
  card: SummaryIndicatorCard
  selectable?: boolean
}

const INDICATOR_PARAM = 'indicator'

export function KpiCard({ active = false, card, selectable = false }: KpiCardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const fractionDigits = card.indicator_name === 'Содержание Au' ? 2 : 1

  const selectIndicator = () => {
    if (!selectable || active) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set(INDICATOR_PARAM, card.indicator_name)

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const content = (
    <>
      <div className={styles.metricTitle}>
        <span className={styles.metricName}>{card.indicator_name}</span>
        <span className={styles.metricUnit}>{card.measure_unit}</span>
      </div>
      <b className={styles.metricValue}>{formatSummaryNumber(card.fact_value, fractionDigits)}</b>
      <span
        className={classNames(styles.deviation, styles[getDeviationClassName(card.deviation_pct)])}
      >
        {formatDeviation(card.deviation_pct)}
      </span>
    </>
  )

  if (!selectable) {
    return <article className={styles.kpiCard}>{content}</article>
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      className={classNames(
        styles.kpiCard,
        styles.kpiCardSelectable,
        active && styles.kpiCardActive
      )}
      onClick={selectIndicator}
    >
      {content}
    </button>
  )
}
