import { DownOutlined } from '@ant-design/icons'

import { getStageHealthText, type StageSummary } from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'
import { KpiCard } from './KpiCard'

type CollapsibleStagePanelProps = {
  stage: StageSummary | undefined
}

export function CollapsibleStagePanel({ stage }: CollapsibleStagePanelProps) {
  return (
    <section className={styles.stagePanel} aria-labelledby="mining-title">
      <header className={styles.stageHeader}>
        <div className={styles.stageTitle}>
          <h1 id="mining-title">{stage?.display_name ?? 'Добыча'}</h1>
          <span className={styles.stageBadge}>{getStageHealthText(stage)}</span>
        </div>
        <button type="button" className={styles.iconButton} aria-label="Свернуть добычу">
          <DownOutlined />
        </button>
      </header>
      {stage && stage.cards.length > 0 ? (
        <div className={styles.kpiGrid}>
          {stage.cards.map((card) => (
            <KpiCard key={card.indicator_name} card={card} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>Нет данных по добыче</div>
      )}
    </section>
  )
}
