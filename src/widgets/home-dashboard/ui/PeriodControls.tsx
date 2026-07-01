import styles from '../HomeDashboard.module.css'

type PeriodControlsProps = {
  periodLabel: string
  shiftLabel: string
  assetLabel: string
}

export function PeriodControls({ periodLabel, shiftLabel, assetLabel }: PeriodControlsProps) {
  return (
    <div className={styles.periodControls} aria-label="Параметры периода">
      <span>{periodLabel}</span>
      <span>{shiftLabel}</span>
      <span>{assetLabel}</span>
    </div>
  )
}
