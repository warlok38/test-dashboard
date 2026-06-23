export type {
  DashboardMetric,
  DashboardMetricStatus,
  DashboardStage
} from '../mock/industrialDashboard'
export type {
  BusinessUnitSlug,
  BusinessUnitSummary,
  DetailPeriod,
  MetricTrendPoint,
  ProductionMetricDetail
} from '../mock/productionStageDetails'
export type {
  MiningStageMetric,
  MiningStageMetricKind,
  MiningStagePoint
} from '../mock/miningStageOverview'

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
