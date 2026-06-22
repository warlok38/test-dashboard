'use client'

import { type ProductionMetricDetail as ProductionMetricDetailData } from '@/entities/production-stage'

import styles from './ProductionMetricDetail.module.css'
import { SummaryCard, TotalPanel } from './ui'

type ProductionMetricDetailProps = {
  detail: ProductionMetricDetailData
}

export function ProductionMetricDetail({ detail }: ProductionMetricDetailProps) {
  return (
    <section className={styles.detail} aria-labelledby="metric-detail-title">
      <TotalPanel detail={detail} />

      <div className={styles.summaryGrid}>
        {detail.summaries.map((unit) => (
          <SummaryCard key={unit.slug} unit={unit} />
        ))}
      </div>
    </section>
  )
}
