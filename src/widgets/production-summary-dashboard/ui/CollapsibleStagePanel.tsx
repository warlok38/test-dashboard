import { DownOutlined } from '@ant-design/icons'

import { getStageHealthText, type StageSummary } from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'
import { KpiCard } from './KpiCard'

type CollapsibleStagePanelProps = {
  activeIndicator?: string
  collapseLabel?: string
  emptyStateLabel?: string
  selectableIndicators?: boolean
  stage: StageSummary | undefined
  titleId?: string
}

export function CollapsibleStagePanel({
  activeIndicator,
  collapseLabel,
  emptyStateLabel,
  selectableIndicators = false,
  stage,
  titleId = 'stage-title'
}: CollapsibleStagePanelProps) {
  const title = stage?.display_name ?? 'Раздел'

  return (
    <section className={styles.stagePanel} aria-labelledby={titleId}>
      <header className={styles.stageHeader}>
        <div className={styles.stageTitle}>
          <h1 id={titleId}>{title}</h1>
          <span className={styles.stageBadge}>{getStageHealthText(stage)}</span>
        </div>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={collapseLabel ?? `Свернуть ${title}`}
        >
          <DownOutlined />
        </button>
      </header>
      {stage && stage.cards.length > 0 ? (
        <div className={styles.kpiGrid}>
          {stage.cards.map((card) => (
            <KpiCard
              key={card.indicator_name}
              active={card.indicator_name === activeIndicator}
              card={card}
              selectable={selectableIndicators}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>{emptyStateLabel ?? `Нет данных: ${title}`}</div>
      )}
    </section>
  )
}
