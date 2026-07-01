import { DownOutlined } from '@ant-design/icons'

import styles from '../ProductionSummaryDashboard.module.css'

type StaticStagePanelProps = {
  title: string
}

export function StaticStagePanel({ title }: StaticStagePanelProps) {
  return (
    <section className={styles.staticPanel}>
      <div className={styles.stageTitle}>
        <h2>{title}</h2>
        <span className={styles.workBadge}>Виджет в работе</span>
      </div>
      <button type="button" className={styles.iconButton} aria-label={`Раскрыть ${title}`}>
        <DownOutlined />
      </button>
    </section>
  )
}
