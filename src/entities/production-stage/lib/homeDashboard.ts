import { type HomeDashboardSummary } from '../model/types'

export function getHomeDashboardSummary(summary: HomeDashboardSummary): HomeDashboardSummary {
  return summary
}

export function getHomeDashboardHasCritical(summary: HomeDashboardSummary): boolean {
  return (
    summary.kpis.some((kpi) => kpi.status === 'danger') ||
    summary.deviations.some((deviation) => deviation.status === 'danger') ||
    summary.assets.some((asset) => asset.status === 'danger')
  )
}
