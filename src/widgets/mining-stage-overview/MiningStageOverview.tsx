'use client'

import { useSearchParams } from 'next/navigation'

import { type MiningStageMetric } from '@/entities/production-stage'

import styles from './MiningStageOverview.module.css'
import { MiningMetricCard } from './ui'

type MiningStageOverviewProps = {
  metrics: MiningStageMetric[]
}

export function MiningStageOverview({ metrics }: MiningStageOverviewProps) {
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

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
