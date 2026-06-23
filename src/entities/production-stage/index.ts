export { industrialDashboardStages } from './mock/industrialDashboard'
export type { DashboardMetric, DashboardMetricStatus, DashboardStage } from './model/types'
export {
  DEFAULT_DETAIL_PERIOD,
  DETAIL_PERIODS,
  productionMetricDetails
} from './mock/productionStageDetails'
export type {
  BusinessUnitSlug,
  BusinessUnitSummary,
  DetailPeriod,
  MetricTrendPoint,
  ProductionMetricDetail
} from './model/types'
export { miningStageMetrics } from './mock/miningStageOverview'
export type { MiningStageMetric, MiningStageMetricKind, MiningStagePoint } from './model/types'
export {
  useAddProductionMetricCommentMutation,
  useGetProductionMetricDetailQuery,
  useGetProductionStageMetricsQuery,
  useGetProductionStagesQuery
} from './api/productionStagesApi'
export type {
  CreateProductionMetricCommentRequest,
  ProductionMetricComment,
  ProductionStagesQuery
} from './model/types'
export * from './lib'
