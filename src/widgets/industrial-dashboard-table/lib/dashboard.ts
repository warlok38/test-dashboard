import { type DashboardMetric, type DashboardStage } from '@/entities/production-stage'

export type DashboardRow = {
  key: number
  metrics: Record<string, DashboardMetric | undefined>
}

export type StagePlanProgress = {
  completed: number
  total: number
}

const DESKTOP_COLUMN_WIDTH = 240
const MEDIUM_COLUMN_WIDTH = 208
const TABLET_COLUMN_WIDTH = 184

export function getMetricStatus(metric: DashboardMetric): DashboardMetric['status'] {
  if (metric.value === null || metric.plan === null || metric.plan === 0) {
    return 'neutral'
  }

  return metric.status
}

export function getStagePlanProgress(stage: DashboardStage): StagePlanProgress {
  return stage.metrics.reduce<StagePlanProgress>(
    (acc, metric) => {
      const status = getMetricStatus(metric)

      if (status === 'neutral') {
        return acc
      }

      acc.total += 1

      if (status === 'success') {
        acc.completed += 1
      }

      return acc
    },
    { completed: 0, total: 0 }
  )
}

export function getMetricProgressPercent(
  metric: DashboardMetric,
  status: DashboardMetric['status']
) {
  if (status === 'neutral' || metric.value === null || metric.plan === null || metric.plan <= 0) {
    return null
  }

  if (status === 'success') {
    return 100
  }

  return Math.max(0, Math.min((metric.value / metric.plan) * 100, 100))
}

export function getRows(stages: DashboardStage[]): DashboardRow[] {
  const rowCount = Math.max(...stages.map((stage) => stage.metrics.length))

  return Array.from({ length: rowCount }, (_, rowIndex) => ({
    key: rowIndex,
    metrics: stages.reduce<DashboardRow['metrics']>((acc, stage) => {
      acc[stage.id] = stage.metrics[rowIndex]

      return acc
    }, {})
  }))
}

export function getColumnWidth(isTabletScreen: boolean, isMediumScreen: boolean) {
  if (isTabletScreen) {
    return TABLET_COLUMN_WIDTH
  }

  if (isMediumScreen) {
    return MEDIUM_COLUMN_WIDTH
  }

  return DESKTOP_COLUMN_WIDTH
}

export function getHrefWithQuery(href: string, queryString: string) {
  return queryString ? `${href}?${queryString}` : href
}
