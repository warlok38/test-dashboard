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

export type HomeDashboardStatus = 'success' | 'warning' | 'danger' | 'neutral'

export type HomeDashboardMetricDirection = 'higher-is-better' | 'lower-is-better'

export type HomeDashboardSummaryCard = {
  id: string
  title: string
  value: string
  caption: string
  status: HomeDashboardStatus
}

export type HomeDashboardAttentionItem = {
  id: string
  title: string
  metricTitle: string
  factLabel: string
  planLabel: string
  deltaLabel: string
  impact: string
  status: Exclude<HomeDashboardStatus, 'success'>
  href?: string
}

export type HomeDashboardChainItem = {
  id: string
  title: string
  planText: string
  status: HomeDashboardStatus
  worstMetricTitle: string
  worstMetricDeltaLabel: string
  href?: string
}

export type HomeDashboardTrendPoint = {
  label: string
  fact: number
  plan: number
}

export type HomeDashboardBusinessUnit = {
  id: BusinessUnitSlug
  title: string
  status: HomeDashboardStatus
  worstMetricTitle: string
  worstMetricDeltaLabel: string
  contributionLabel: string
  metrics: Array<{
    id: string
    title: string
    value: string
    deltaLabel: string
    status: HomeDashboardStatus
  }>
}

export type HomeDashboardSummary = {
  status: HomeDashboardStatus
  statusTitle: string
  statusDescription: string
  cards: HomeDashboardSummaryCard[]
  attentionItems: HomeDashboardAttentionItem[]
  chain: HomeDashboardChainItem[]
  trend: HomeDashboardTrendPoint[]
  businessUnits: HomeDashboardBusinessUnit[]
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

export type ProductionStageFilters = {
  dateFrom?: string
  dateTo?: string
  businessUnit?: string[]
}

export type ProductionStagesQuery = ProductionStageFilters

export type ProductionStageMetricsQuery = ProductionStageFilters & {
  stageSlug: string
}

export type ProductionMetricDetailQuery = ProductionStageFilters & {
  stageSlug: string
  metricSlug: string
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
