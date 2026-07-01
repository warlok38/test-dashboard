import {
  type DashboardMetric,
  type DashboardStage,
  type HomeDashboardAttentionItem,
  type HomeDashboardBusinessUnit,
  type HomeDashboardChainItem,
  type HomeDashboardStatus,
  type HomeDashboardSummary,
  type HomeDashboardSummaryCard,
  type HomeDashboardTrendPoint
} from '../model/types'

const ATTENTION_LIMIT = 4

function formatDelta(delta: number | null): string {
  if (delta === null) {
    return 'нет данных'
  }

  const sign = delta > 0 ? '+' : ''

  return `${sign}${delta.toFixed(1)}%`
}

function formatMetricValue(value: number | null, fractionDigits = 1): string {
  if (value === null) {
    return 'нет данных'
  }

  return value.toLocaleString('ru-RU', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits
  })
}

function getMetricStatus(metric: DashboardMetric): HomeDashboardStatus {
  if (metric.value === null || metric.plan === null || metric.delta === null) {
    return 'neutral'
  }

  if (metric.status === 'danger') {
    return Math.abs(metric.delta) >= 10 ? 'danger' : 'warning'
  }

  if (metric.status === 'success') {
    return 'success'
  }

  return 'neutral'
}

function getWorstMetric(stage: DashboardStage): DashboardMetric | undefined {
  return [...stage.metrics].sort((first, second) => {
    const firstSeverity = first.status === 'danger' ? Math.abs(first.delta ?? 0) : -1
    const secondSeverity = second.status === 'danger' ? Math.abs(second.delta ?? 0) : -1

    return secondSeverity - firstSeverity
  })[0]
}

function getStageStatus(stage: DashboardStage): HomeDashboardStatus {
  const statuses = stage.metrics.map(getMetricStatus)

  if (statuses.includes('danger')) {
    return 'danger'
  }

  if (statuses.includes('warning')) {
    return 'warning'
  }

  if (statuses.every((status) => status === 'success')) {
    return 'success'
  }

  return 'neutral'
}

function getAttentionImpact(stage: DashboardStage): string {
  if (stage.id === 'processing-feed') {
    return 'Влияет на выполнение плана переработки'
  }

  if (stage.id === 'transport') {
    return 'Возможное узкое место логистики'
  }

  if (stage.id === 'mining') {
    return 'Риск недопоставки в следующий передел'
  }

  return 'Требуется проверка причины отклонения'
}

function getAttentionSeverity(status: HomeDashboardStatus) {
  if (status === 'danger') {
    return 3
  }

  if (status === 'warning') {
    return 2
  }

  if (status === 'neutral') {
    return 1
  }

  return 0
}

function getAttentionItems(stages: DashboardStage[]): HomeDashboardAttentionItem[] {
  return stages
    .flatMap((stage) =>
      stage.metrics.map((metric) => ({
        stage,
        metric,
        status: getMetricStatus(metric)
      }))
    )
    .filter(
      (item) => item.status === 'danger' || item.status === 'warning' || item.status === 'neutral'
    )
    .sort((first, second) => {
      const statusDiff = getAttentionSeverity(second.status) - getAttentionSeverity(first.status)

      if (statusDiff !== 0) {
        return statusDiff
      }

      return Math.abs(second.metric.delta ?? 0) - Math.abs(first.metric.delta ?? 0)
    })
    .slice(0, ATTENTION_LIMIT)
    .map(({ stage, metric, status }) => ({
      id: `${stage.id}-${metric.id}`,
      title: stage.title,
      metricTitle: metric.title,
      factLabel: formatMetricValue(metric.value, metric.valueFractionDigits ?? 1),
      planLabel: formatMetricValue(metric.plan, metric.planFractionDigits ?? 1),
      deltaLabel: formatDelta(metric.delta),
      impact: getAttentionImpact(stage),
      status: status === 'success' ? 'warning' : status,
      href: metric.detailRoute ?? stage.detailRoute
    }))
}

function getSummaryCards(
  stages: DashboardStage[],
  attentionItems: HomeDashboardAttentionItem[]
): HomeDashboardSummaryCard[] {
  const metrics = stages.flatMap((stage) => stage.metrics)
  const normalCount = metrics.filter((metric) => getMetricStatus(metric) === 'success').length
  const criticalCount = metrics.filter((metric) => getMetricStatus(metric) === 'danger').length
  const missingCount = metrics.filter(
    (metric) => metric.value === null || metric.plan === null
  ).length
  const worstItem = attentionItems[0]

  return [
    {
      id: 'normal-kpi',
      title: 'KPI в норме',
      value: `${normalCount}/${metrics.length}`,
      caption: 'по производственному контуру',
      status: criticalCount > 0 ? 'warning' : 'success'
    },
    {
      id: 'critical-kpi',
      title: 'Критично',
      value: String(criticalCount),
      caption: 'требуют внимания сегодня',
      status: criticalCount > 0 ? 'danger' : 'success'
    },
    {
      id: 'largest-gap',
      title: 'Макс. отклонение',
      value: worstItem?.deltaLabel ?? '0%',
      caption: worstItem ? worstItem.metricTitle : 'отклонений нет',
      status: worstItem?.status ?? 'success'
    },
    {
      id: 'missing-data',
      title: 'Нет данных',
      value: String(missingCount),
      caption: 'показателей без факта/плана',
      status: missingCount > 0 ? 'neutral' : 'success'
    }
  ]
}

function getChain(stages: DashboardStage[]): HomeDashboardChainItem[] {
  return stages.map((stage) => {
    const worstMetric = getWorstMetric(stage)
    const status = getStageStatus(stage)

    return {
      id: stage.id,
      title: stage.title,
      planText: `${stage.plan.completed}/${stage.plan.total}`,
      status,
      worstMetricTitle: worstMetric?.title ?? 'Нет показателей',
      worstMetricDeltaLabel: worstMetric ? formatDelta(worstMetric.delta) : 'нет данных',
      href: stage.detailRoute
    }
  })
}

export function getHomeDashboardSummary(
  stages: DashboardStage[],
  trend: HomeDashboardTrendPoint[],
  businessUnits: HomeDashboardBusinessUnit[]
): HomeDashboardSummary {
  const attentionItems = getAttentionItems(stages)
  const cards = getSummaryCards(stages, attentionItems)
  const hasCritical = attentionItems.some((item) => item.status === 'danger')
  const hasAttentionItems = attentionItems.length > 0
  let status: HomeDashboardStatus = 'success'
  let statusTitle = 'Все в норме'

  if (hasCritical) {
    status = 'danger'
    statusTitle = 'Есть критичные отклонения'
  } else if (hasAttentionItems) {
    status = 'warning'
    statusTitle = 'Есть отклонения'
  }

  return {
    status,
    statusTitle,
    statusDescription:
      attentionItems[0] !== undefined
        ? `Основной риск: ${attentionItems[0].title}, ${attentionItems[0].metricTitle.toLowerCase()}`
        : 'Производственный контур идет по плану',
    cards,
    attentionItems,
    chain: getChain(stages),
    trend,
    businessUnits
  }
}
