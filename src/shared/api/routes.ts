export const API_ROUTES = {
  businessUnits: '/business-units',
  productionStages: '/production-stages',
  productionStageMetrics: (stageSlug: string) => `/production-stages/${stageSlug}/metrics`,
  productionMetricDetail: (stageSlug: string, metricSlug: string) =>
    `/production-stages/${stageSlug}/metrics/${metricSlug}`,
  productionMetricComments: (stageSlug: string, metricSlug: string) =>
    `/production-stages/${stageSlug}/metrics/${metricSlug}/comments`
} as const
