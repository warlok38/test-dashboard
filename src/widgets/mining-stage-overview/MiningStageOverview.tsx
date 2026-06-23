'use client'

import { Alert, Empty, Skeleton } from 'antd'
import { useSearchParams } from 'next/navigation'

import { useGetProductionStageMetricsQuery } from '@/entities/production-stage'

import styles from './MiningStageOverview.module.css'
import { MiningMetricCard } from './ui'

type MiningStageOverviewProps = {
  stageSlug: string
}

export function MiningStageOverview({ stageSlug }: MiningStageOverviewProps) {
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const { data: metrics = [], error, isLoading } = useGetProductionStageMetricsQuery(stageSlug)

  if (isLoading) {
    return (
      <section className={styles.overview} aria-label="Обзор показателей добычи">
        <Skeleton active paragraph={{ rows: 8 }} title={false} />
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.overview} aria-label="Обзор показателей добычи">
        <Alert showIcon type="error" message="Не удалось загрузить показатели стадии" />
      </section>
    )
  }

  if (metrics.length === 0) {
    return (
      <section className={styles.overview} aria-label="Обзор показателей добычи">
        <Empty description="Нет данных по показателям стадии" />
      </section>
    )
  }

  return (
    <section className={styles.overview} aria-label="Обзор показателей добычи">
      <div className={styles.overviewHeader}>
        <div className={styles.legend} aria-hidden="true">
          <span className={styles.factLegend}>Факт</span>
          <span className={styles.planLegend}>План</span>
        </div>
      </div>

      <div className={styles.metricGrid}>
        {metrics.map((metric) => (
          <MiningMetricCard key={metric.id} metric={metric} queryString={queryString} />
        ))}
      </div>
    </section>
  )
}
