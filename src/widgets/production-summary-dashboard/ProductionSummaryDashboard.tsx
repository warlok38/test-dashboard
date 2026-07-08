'use client'

import {
  getFirstStageIndicator,
  getMiningStage,
  groupCardsByDeposit,
  type SummaryQuery,
  useGetSummaryQuery
} from '@/entities/production-summary'
import { ApiErrorAlert } from '@/shared/ui'

import styles from './ProductionSummaryDashboard.module.css'
import {
  CollapsibleStagePanel,
  DepositGrid,
  GraphPanel,
  ProductionSummaryDashboardSkeleton
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
  const zifItems = groupCardsByDeposit(summary?.by_enrichment?.cards ?? [])
  const firstIndicator = getFirstStageIndicator(miningStage)
  const activeIndicator = miningStage?.cards.some((card) => card.indicator_name === indicator)
    ? indicator
    : firstIndicator
  const isInitialLoading = isLoading && !summary
  const shouldShowDeposits = showDeposits ?? !showGraph
  const shouldShowZif = showDeposits ?? true
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
        <ApiErrorAlert error={error} title="Не удалось загрузить сводку производства" />
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
        <ApiErrorAlert
          error={error}
          type="warning"
          title="Не удалось обновить сводку, показаны последние загруженные данные"
        />
      )}
      <CollapsibleStagePanel
        activeIndicator={activeIndicator}
        collapseLabel="Свернуть добычу"
        emptyStateLabel="Нет данных по добыче"
        selectableIndicators={showGraph}
        stage={miningStage}
        titleId="mining-title"
      />
      {showGraph && (
        <GraphPanel
          key={`${graphQuery?.gtk ?? ''}:${graphQuery?.indicator ?? ''}`}
          query={graphQuery}
        />
      )}
      {shouldShowDeposits && (
        <DepositGrid items={deposits} title="Месторождения" titleId="deposits-title" />
      )}
      {shouldShowDeposits && (
        <CollapsibleStagePanel
          collapseLabel="Свернуть обогащение"
          emptyStateLabel="Нет данных по обогащению"
          stage={summary?.by_enrichment}
          titleId="enrichment-title"
        />
      )}
      {shouldShowZif && <DepositGrid items={zifItems} title="ЗИФ" titleId="zif-title" />}
    </section>
  )
}
