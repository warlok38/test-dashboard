import styles from '../HomeDashboard.module.css'

type PeriodControlsProps = {
  periodLabel: string
  shiftLabel: string
  assetLabel: string
}

export function PeriodControls({ periodLabel, shiftLabel, assetLabel }: PeriodControlsProps) {
  return (
    <div className={styles.summaryCards} aria-label="Параметры периода">
      <div className={styles.summaryCard}>
        <span>Период</span>
        <strong>{periodLabel}</strong>
        <p>Производственный интервал</p>
      </div>
      <div className={styles.summaryCard}>
        <span>Смена</span>
        <strong>{shiftLabel}</strong>
        <p>Текущая смена</p>
      </div>
      <div className={styles.summaryCard}>
        <span>Активы</span>
        <strong>{assetLabel}</strong>
        <p>Контур мониторинга</p>
      </div>
    </div>
  )
}
