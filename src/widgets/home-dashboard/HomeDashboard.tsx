'use client'

import { Alert, Empty, Skeleton } from 'antd'
import { useSearchParams } from 'next/navigation'

import {
  getHomeDashboardSummary,
  getProductionStageFiltersFromSearchParams,
  useGetProductionStagesQuery
} from '@/entities/production-stage'
import {
  homeDashboardBusinessUnits,
  homeDashboardTrend
} from '@/shared/mocks/production-stage/homeDashboard'

import styles from './HomeDashboard.module.css'
import {
  AttentionList,
  BusinessUnitHealthGrid,
  ExecutiveSummary,
  PlanFactTrend,
  ProductionChain
} from './ui'

export function HomeDashboard() {
  const searchParams = useSearchParams()
  const {
    data: stages = [],
    error,
    isLoading
  } = useGetProductionStagesQuery(getProductionStageFiltersFromSearchParams(searchParams))

  if (isLoading) {
    return (
      <section className={styles.dashboard} aria-label="Главная сводка производства">
        <Skeleton active paragraph={{ rows: 10 }} title={false} />
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.dashboard} aria-label="Главная сводка производства">
        <Alert showIcon type="error" message="Не удалось загрузить главную сводку" />
      </section>
    )
  }

  if (stages.length === 0) {
    return (
      <section className={styles.dashboard} aria-label="Главная сводка производства">
        <Empty description="Нет данных для главной сводки" />
      </section>
    )
  }

  const summary = getHomeDashboardSummary(stages, homeDashboardTrend, homeDashboardBusinessUnits)

  return (
    <section className={styles.dashboard} aria-label="Главная сводка производства">
      <ExecutiveSummary summary={summary} />
      <div className={styles.insightGrid}>
        <AttentionList items={summary.attentionItems} />
        <PlanFactTrend data={summary.trend} />
      </div>
      <ProductionChain items={summary.chain} />
      <BusinessUnitHealthGrid units={summary.businessUnits} />
    </section>
  )
}
