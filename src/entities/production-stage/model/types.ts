export type DashboardMetricStatus = 'success' | 'danger' | 'neutral'

export type DashboardMetric = {
  id: string
  title: string
  value: number | null
  plan: number | null
  delta: number | null
  detailRoute?: string
  valueFractionDigits?: number
  planFractionDigits?: number
  deltaFractionDigits?: number
  status: DashboardMetricStatus
}

export type DashboardStage = {
  id: string
  title: string
  detailRoute?: string
  plan: {
    completed: number
    total: number
  }
  metrics: DashboardMetric[]
}

export type MiningStageMetricKind = 'bar-line' | 'line'

export type MiningStagePoint = {
  day: string
  month: string
  fact: number
  plan: number
}

export type MiningStageMetric = {
  id: string
  title: string
  unit: string
  kind: MiningStageMetricKind
  detailRoute?: string
  summary: {
    fact: number
    plan: number
  }
  data: MiningStagePoint[]
}

export type DetailPeriod = 'day' | 'month-to-date' | 'year-to-date'

export type BusinessUnitSlug = 'olimpiada' | 'blagodatnoe' | 'natalka' | 'kuranah' | 'suhoy-log'

export type BusinessUnitSummary = {
  slug: BusinessUnitSlug
  title: string
  fact: number | null
  plan: number
}

export type MetricTrendPoint = {
  day: string
  month: string
  fact: number
  plan: number
}

export type ProductionMetricDetail = {
  stageSlug: string
  stageTitle: string
  metricSlug: string
  metricTitle: string
  unit: string
  summaries: BusinessUnitSummary[]
  trend: MetricTrendPoint[]
}

export const DETAIL_PERIODS: Array<{ value: DetailPeriod; label: string }> = [
  { value: 'day', label: 'Сутки' },
  { value: 'month-to-date', label: 'С начала месяца' },
  { value: 'year-to-date', label: 'С начала года' }
]

export const DEFAULT_DETAIL_PERIOD: DetailPeriod = 'day'

export type ProductionStagesQuery = {
  dateFrom?: string
  dateTo?: string
  businessUnit?: string[]
}

export type CreateProductionMetricCommentRequest = {
  author: string
  text: string
}

export type ProductionMetricComment = CreateProductionMetricCommentRequest & {
  id: string
  stageSlug: string
  metricSlug: string
  createdAt: string
}
