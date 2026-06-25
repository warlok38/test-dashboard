'use client'

import { Alert, Skeleton } from 'antd'
import { useSearchParams } from 'next/navigation'

import {
  getProductionStageFiltersFromSearchParams,
  useGetProductionMetricDetailQuery
} from '@/entities/production-stage'
import { ProductionMetricCommentForm } from '@/features/production-metric-comment'

import styles from './ProductionMetricDetail.module.css'
import { SummaryCard, TotalPanel } from './ui'

type ProductionMetricDetailProps = {
  stageSlug: string
  metricSlug: string
}

export function ProductionMetricDetail({ stageSlug, metricSlug }: ProductionMetricDetailProps) {
  const searchParams = useSearchParams()
  const {
    data: detail,
    error,
    isLoading
  } = useGetProductionMetricDetailQuery({
    stageSlug,
    metricSlug,
    ...getProductionStageFiltersFromSearchParams(searchParams)
  })

  if (isLoading) {
    return (
      <section className={styles.detail} aria-labelledby="metric-detail-title">
        <Skeleton active paragraph={{ rows: 8 }} title={false} />
      </section>
    )
  }

  if (error || !detail) {
    return (
      <section className={styles.detail} aria-labelledby="metric-detail-title">
        <Alert showIcon type="error" message="Не удалось загрузить детализацию показателя" />
      </section>
    )
  }

  return (
    <section className={styles.detail} aria-labelledby="metric-detail-title">
      <TotalPanel detail={detail} />
      <ProductionMetricCommentForm stageSlug={stageSlug} metricSlug={metricSlug} />

      <div className={styles.summaryGrid}>
        {detail.summaries.map((unit) => (
          <SummaryCard key={unit.slug} unit={unit} />
        ))}
      </div>
    </section>
  )
}
