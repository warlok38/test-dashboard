import classNames from 'classnames'

import { type DashboardMetric } from '@/entities/production-stage'
import { getKpiValueTone } from '@/shared/ui'

import { type StagePlanProgress } from '../lib'
import styles from '../IndustrialDashboardTable.module.css'

export function getPlanClassName({ completed, total }: StagePlanProgress) {
  if (total === 0) {
    return styles.planNeutral
  }

  if (completed === 0) {
    return styles.planDanger
  }

  if (completed === total) {
    return styles.planSuccess
  }

  return styles.planWarning
}

export function getMetricClassName(status: DashboardMetric['status']) {
  if (status === 'success') {
    return styles.metricSuccess
  }

  if (status === 'danger') {
    return styles.metricDanger
  }

  return styles.metricNeutral
}

export function getDeltaBadgeClassName(delta: number) {
  return classNames(styles.deltaBadge, {
    [styles.deltaBadgeNeutral]: getKpiValueTone(delta, { kind: 'delta' }) === 'neutral'
  })
}
