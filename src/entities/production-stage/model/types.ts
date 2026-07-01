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

export type HomeDashboardReasonType =
  | 'downtime'
  | 'kio'
  | 'ktg'
  | 'maintenance'
  | 'mill-constraint'
  | 'logistics'
  | 'grade'
  | 'data'
  | 'unclassified'

export type HomeDashboardMetricDirection = 'higher-is-better' | 'lower-is-better'

export type HomeDashboardKpi = {
  id: string
  title: string
  value: string
  unit?: string
  caption: string
  deltaLabel: string
  status: HomeDashboardStatus
  href?: string
}

export type HomeDashboardTrendMetric =
  | 'gold'
  | 'ore-mined'
  | 'ore-processed'
  | 'recovery'
  | 'au-grade'

export type HomeDashboardTrendPoint = {
  label: string
  fact: number
  plan: number
  event?: HomeDashboardReasonType
}

export type HomeDashboardTrend = {
  activeMetric: HomeDashboardTrendMetric
  tabs: Array<{
    id: HomeDashboardTrendMetric
    label: string
  }>
  unit: string
  factTotal: string
  planTotal: string
  deltaTotal: string
  status: HomeDashboardStatus
  points: HomeDashboardTrendPoint[]
}

export type HomeDashboardDeviation = {
  id: string
  assetTitle: string
  stageTitle: string
  metricTitle: string
  factPlanLabel: string
  deltaLabel: string
  reasonType: HomeDashboardReasonType
  reasonTitle: string
  impactLabel: string
  status: Exclude<HomeDashboardStatus, 'success'>
  href?: string
}

export type HomeDashboardAsset = {
  id: BusinessUnitSlug
  title: string
  status: HomeDashboardStatus
  goldLabel: string
  oreMinedLabel: string
  oreProcessedLabel: string
  recoveryLabel: string
  primaryReasonTitle: string
  contributionLabel: string
  contributionPercent: number
  href?: string
}

export type HomeDashboardFlowStage = {
  id: string
  title: string
  factPlanLabel: string
  deltaLabel: string
  status: HomeDashboardStatus
  reasonTitle?: string
  href?: string
}

export type HomeDashboardEvent = {
  id: string
  timeLabel: string
  assetTitle: string
  title: string
  durationLabel: string
  status: HomeDashboardStatus
  linkedDeviationId?: string
  href?: string
}

export type HomeDashboardPeriodControls = {
  periodLabel: string
  shiftLabel: string
  assetLabel: string
  updatedAtLabel: string
}

export type HomeDashboardSummary = {
  title: string
  subtitle: string
  controls: HomeDashboardPeriodControls
  kpis: HomeDashboardKpi[]
  trend: HomeDashboardTrend
  deviations: HomeDashboardDeviation[]
  assets: HomeDashboardAsset[]
  flow: HomeDashboardFlowStage[]
  events: HomeDashboardEvent[]
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
