export const API_TAGS = {
  businessUnits: 'BusinessUnits',
  gtk: 'Gtk',
  summary: 'Summary',
  graph: 'Graph',
  productionStages: 'ProductionStages',
  productionStageMetrics: 'ProductionStageMetrics',
  productionMetricDetail: 'ProductionMetricDetail',
  productionMetricComments: 'ProductionMetricComments'
} as const

export const API_TAG_TYPES = Object.values(API_TAGS)

export type ApiTagType = (typeof API_TAG_TYPES)[number]
