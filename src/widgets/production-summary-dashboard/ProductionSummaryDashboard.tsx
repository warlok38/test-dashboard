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
  showDeposits?: boolean
  showGraph?: boolean
}

export function ProductionSummaryDashboard({
  query,
  showDeposits,
  showGraph = false
}: ProductionSummaryDashboardProps) {
  const { indicator, ...summaryQuery } = query
  const { data: summary, error, isFetching, isLoading } = useGetSummaryQuery(summaryQuery)
  const miningStage = getMiningStage(summary)
  const deposits = groupCardsByDeposit(miningStage?.cards ?? [])
  const firstIndicator = getFirstStageIndicator(miningStage)
  const activeIndicator = miningStage?.cards.some((card) => card.indicator_name === indicator)
    ? indicator
    : firstIndicator
  const isInitialLoading = isLoading && !summary
  const shouldShowDeposits = showDeposits ?? !showGraph
  const graphQuery =
    showGraph && activeIndicator
      ? {
          indicator: activeIndicator,
          ...(query.gtk ? { gtk: query.gtk } : {})
        }
      : undefined

  if (isInitialLoading) {
    return (
      <section className={styles.dashboard} aria-label="Сводка производства">
        <ProductionSummaryDashboardSkeleton showDeposits={shouldShowDeposits} />
        {/* <StaticStagePanel title="Минеральные ресурсы" /> */}
        {/* <StaticStagePanel title="Обогащение" /> */}
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
      <CollapsibleStagePanel
        activeIndicator={activeIndicator}
        selectableIndicators={showGraph}
        stage={miningStage}
      />
      {showGraph && <GraphPanel query={graphQuery} />}
      {shouldShowDeposits && <DepositGrid deposits={deposits} />}
      {/* <StaticStagePanel title="Минеральные ресурсы" /> */}
      <StaticStagePanel title="Обогащение" />
    </section>
  )
}
