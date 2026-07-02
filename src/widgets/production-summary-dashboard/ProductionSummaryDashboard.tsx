'use client'

import { Alert } from 'antd'

import {
  getFirstStageIndicator,
  getMiningStage,
  groupCardsByDeposit,
  type SummaryQuery,
  useGetSummaryQuery
} from '@/entities/production-summary'

import styles from './ProductionSummaryDashboard.module.css'
import {
  CollapsibleStagePanel,
  DepositGrid,
  GraphPanel,
  ProductionSummaryDashboardSkeleton,
  StaticStagePanel
} from './ui'

type ProductionSummaryDashboardProps = {
  query: SummaryQuery
  showGraph?: boolean
}

export function ProductionSummaryDashboard({
  query,
  showGraph = false
}: ProductionSummaryDashboardProps) {
  const { data: summary, error, isFetching, isLoading } = useGetSummaryQuery(query)
  const miningStage = getMiningStage(summary)
  const deposits = groupCardsByDeposit(miningStage?.cards ?? [])
  const firstIndicator = getFirstStageIndicator(miningStage)
  const isInitialLoading = isLoading && !summary
  const graphQuery =
    showGraph && query.gtk && firstIndicator
      ? {
          indicator: firstIndicator,
          date_from: query.date_from,
          date_to: query.date_to,
          gtk: query.gtk
        }
      : undefined

  if (isInitialLoading) {
    return (
      <section className={styles.dashboard} aria-label="Сводка производства">
        <ProductionSummaryDashboardSkeleton showDeposits={!showGraph} />
        <StaticStagePanel title="Минеральные ресурсы" />
        <StaticStagePanel title="Обогащение" />
      </section>
    )
  }

  if (error && !summary) {
    return (
      <section className={styles.dashboard} aria-label="Сводка производства">
        <Alert showIcon type="error" title="Не удалось загрузить сводку производства" />
      </section>
    )
  }

  return (
    <section className={styles.dashboard} aria-label="Сводка производства">
      {isFetching && (
        <div className={styles.refreshStatus} role="status" aria-live="polite">
          Обновляем показатели
        </div>
      )}
      {error && (
        <Alert
          showIcon
          type="warning"
          title="Не удалось обновить сводку, показаны последние загруженные данные"
        />
      )}
      <CollapsibleStagePanel stage={miningStage} />
      {showGraph && <GraphPanel query={graphQuery} />}
      {!showGraph && <DepositGrid deposits={deposits} />}
      <StaticStagePanel title="Минеральные ресурсы" />
      <StaticStagePanel title="Обогащение" />
    </section>
  )
}
