import { getGtkHrefByName, getGtkSlugByName } from '../model/gtk'
import {
  type AlarmSummaryResponse,
  type DepositSummaryView,
  type StageSummary,
  type SummaryIndicatorCard,
  type SummarySeverity
} from '../model/types'

const PROBLEM_SEVERITIES = new Set(['critical', 'warning'])

export function getSeverityRank(severity: SummarySeverity) {
  if (severity === 'critical') {
    return 2
  }

  if (severity === 'warning') {
    return 1
  }

  return 0
}

export function getStatusLabel(severity: SummarySeverity) {
  if (severity === 'critical') {
    return 'Критично'
  }

  if (severity === 'warning') {
    return 'Отклонение'
  }

  return 'В норме'
}

export function getMiningStage(
  summary: AlarmSummaryResponse | undefined
): StageSummary | undefined {
  if (!summary) {
    return undefined
  }

  return (
    summary.by_stage.mining ??
    Object.values(summary.by_stage).find((stage) => stage.display_name === 'Добыча')
  )
}

export function getStageHealthText(stage: StageSummary | undefined) {
  if (!stage || stage.cards.length === 0) {
    return '0/0'
  }

  const healthyCount = stage.cards.filter((card) => !PROBLEM_SEVERITIES.has(card.severity)).length

  return `${healthyCount}/${stage.cards.length}`
}

export function getFirstStageIndicator(stage: StageSummary | undefined) {
  return stage?.cards[0]?.indicator_name
}

export function getSeverityClassName(severity: SummarySeverity) {
  if (severity === 'critical') {
    return 'severityCritical'
  }

  if (severity === 'warning') {
    return 'severityWarning'
  }

  return 'severityInfo'
}

export function groupCardsByDeposit(cards: SummaryIndicatorCard[]): DepositSummaryView[] {
  const deposits = new Map<string, DepositSummaryView>()

  cards.forEach((card) => {
    card.details.forEach((detail) => {
      const existing = deposits.get(detail.gtk_or_zif)
      const severity =
        !existing || getSeverityRank(detail.severity) > getSeverityRank(existing.status)
          ? detail.severity
          : existing.status

      const metrics = [
        ...(existing?.metrics ?? []),
        {
          id: card.indicator_name,
          title: card.indicator_name === 'Содержание Au' ? 'Содержание' : card.indicator_name,
          unit: card.measure_unit,
          factValue: detail.fact_value,
          planValue: detail.plan_value,
          deviationPct: detail.deviation_pct,
          severity: detail.severity
        }
      ]

      deposits.set(detail.gtk_or_zif, {
        name: detail.gtk_or_zif,
        slug: getGtkSlugByName(detail.gtk_or_zif),
        href: getGtkHrefByName(detail.gtk_or_zif),
        status: severity,
        statusLabel: getStatusLabel(severity),
        metrics
      })
    })
  })

  return Array.from(deposits.values())
}
