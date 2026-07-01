'use client'

import { Alert, Skeleton } from 'antd'

import {
  getFirstStageIndicator,
  getMiningStage,
  groupCardsByDeposit,
  type SummaryQuery,
  useGetSummaryQuery
} from '@/entities/production-summary'

import styles from './ProductionSummaryDashboard.module.css'
import { CollapsibleStagePanel, DepositGrid, GraphPanel, StaticStagePanel } from './ui'

type ProductionSummaryDashboardProps = {
  query: SummaryQuery
  title?: string
  showGraph?: boolean
}

export function ProductionSummaryDashboard({
  query,
  title,
  showGraph = false
}: ProductionSummaryDashboardProps) {
  const { data: summary, error, isLoading } = useGetSummaryQuery(query)
  const miningStage = getMiningStage(summary)
  const deposits = groupCardsByDeposit(miningStage?.cards ?? [])
  const firstIndicator = getFirstStageIndicator(miningStage)
  const graphQuery =
    showGraph && query.gtk && firstIndicator
      ? {
          indicator: firstIndicator,
          date_from: query.date_from,
          date_to: query.date_to,
          gtk: query.gtk
        }
      : undefined

  if (isLoading) {
    return (
      <section className={styles.dashboard} aria-label="Сводка производства">
        <Skeleton active paragraph={{ rows: 14 }} title={false} />
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.dashboard} aria-label="Сводка производства">
        <Alert showIcon type="error" title="Не удалось загрузить сводку производства" />
      </section>
    )
  }

  return (
    <section className={styles.dashboard} aria-label="Сводка производства">
      <div className={styles.breadcrumbLine}>
        <span aria-hidden="true" />
        <p>{title ?? 'ПРОИЗВОДСТВО · 26 июня 2026'}</p>
      </div>
      <CollapsibleStagePanel stage={miningStage} />
      {showGraph && <GraphPanel query={graphQuery} />}
      {!showGraph && <DepositGrid deposits={deposits} />}
      <StaticStagePanel title="Минеральные ресурсы" />
      <StaticStagePanel title="Обогащение" />
    </section>
  )
}
