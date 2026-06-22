import classNames from 'classnames'

import { type DashboardStage } from '@/entities/production-stage'

import { getStagePlanProgress } from '../lib'
import styles from '../IndustrialDashboardTable.module.css'
import { getPlanClassName } from './classNames'

type MobileStageLabelProps = {
  stage: DashboardStage
}

export function MobileStageLabel({ stage }: MobileStageLabelProps) {
  const progress = getStagePlanProgress(stage)
  const planText = progress.total === 0 ? '0/0' : `${progress.completed}/${progress.total}`

  return (
    <div className={styles.mobileStageHeader}>
      <span className={styles.mobileStageTitle}>{stage.title}</span>
      <span className={classNames(styles.planBadge, getPlanClassName(progress))}>{planText}</span>
    </div>
  )
}
