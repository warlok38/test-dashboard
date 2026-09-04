'use client'

import type { ReportingProductionCard } from '@/entities/reporting'

import styles from '../ReportingProductionGroup.module.css'
import { ProductionChart } from './ProductionChart'
import { ProductionDescriptionEditor } from './ProductionDescriptionEditor'

type ProductionCardProps = {
  card: ReportingProductionCard
}

export function ProductionCard({ card }: ProductionCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.chartColumn}>
          <div className={styles.cardHeader}>
            <h3>{card.title}</h3>
            {card.unit ? <span>{card.unit}</span> : null}
          </div>
          <ProductionChart card={card} />
        </div>
        <div className={styles.textColumn}>
          <ProductionDescriptionEditor
            descriptionKey={card.id}
            initialDescription={card.description}
          />
        </div>
      </div>
    </article>
  )
}
