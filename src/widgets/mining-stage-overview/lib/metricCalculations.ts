import { type MiningStageMetric } from '@/entities/production-stage'
import { formatNumber } from '@/shared/utils/formatNumber'

export function formatMetricNumber(value: number) {
  return formatNumber(value, { fractionDigits: value % 1 === 0 ? 0 : 1 })
}

export function getSummaryDelta(metric: MiningStageMetric) {
  if (metric.summary.plan === 0) {
    return metric.summary.fact === 0 ? 0 : null
  }

  return ((metric.summary.fact - metric.summary.plan) / metric.summary.plan) * 100
}

export function getProgressPercent(metric: MiningStageMetric) {
  if (metric.summary.plan <= 0) {
    return metric.summary.fact > 0 ? 100 : 0
  }

  return Math.max(0, Math.min((metric.summary.fact / metric.summary.plan) * 100, 100))
}
