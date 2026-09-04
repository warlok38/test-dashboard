'use client'

import { useSearchParams } from 'next/navigation'

import {
  REPORTING_ASSET_PARAM,
  REPORTING_STAGE_PARAM,
  getReportingDataset,
  getReportingProductionCards,
  getReportingStage
} from '@/entities/reporting'

import styles from './ReportingProductionGroup.module.css'
import { ProductionCard } from './ui/ProductionCard'

export function ReportingProductionGroup() {
  const searchParams = useSearchParams()
  const dataset = getReportingDataset(searchParams.get(REPORTING_ASSET_PARAM))
  const stage = getReportingStage(searchParams.get(REPORTING_STAGE_PARAM))
  const cards = getReportingProductionCards(dataset, stage.metrics)

  return (
    <section className={styles.section}>
      <div className={styles.cardGrid}>
        {cards.map((card) => (
          <ProductionCard card={card} key={card.id} />
        ))}
      </div>
    </section>
  )
}
