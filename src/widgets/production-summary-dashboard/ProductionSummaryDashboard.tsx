'use client'

import { Alert, Skeleton } from 'antd'

import {
  getMiningStage,
  groupCardsByDeposit,
  type SummaryQuery,
  useGetSummaryQuery
} from '@/entities/production-summary'

import styles from './ProductionSummaryDashboard.module.css'
import { CollapsibleStagePanel, DepositGrid, StaticStagePanel } from './ui'

type ProductionSummaryDashboardProps = {
  query: SummaryQuery
  title?: string
}

export function ProductionSummaryDashboard({ query, title }: ProductionSummaryDashboardProps) {
  const { data: summary, error, isLoading } = useGetSummaryQuery(query)
  const miningStage = getMiningStage(summary)
  const deposits = groupCardsByDeposit(miningStage?.cards ?? [])

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
        <Alert showIcon type="error" message="Не удалось загрузить сводку производства" />
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
      <DepositGrid deposits={deposits} />
      <StaticStagePanel title="Минеральные ресурсы" />
      <StaticStagePanel title="Обогащение" />
    </section>
  )
}
