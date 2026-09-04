export type ReportingAssetKey =
  | 'group'
  | 'olimpiada'
  | 'blagodatnoe'
  | 'kuranah'
  | 'suhoy-log'
  | 'natalka'

export const DEFAULT_REPORTING_ASSET_KEY: ReportingAssetKey = 'group'
export const REPORTING_ASSET_PARAM = 'asset'
export const REPORTING_STAGE_PARAM = 'stage'

export type ReportingMode = 'period' | 'cumulative' | 'forecast'

export type ReportingQuarter = {
  year: number
  quarter: 1 | 2 | 3 | 4
}

export type ReportingAssetOption = {
  key: ReportingAssetKey
  label: string
}

export type ReportingModeOption = {
  key: ReportingMode
  label: string
}

export type ReportingStageKey =
  | 'mining'
  | 'drilling-blasting'
  | 'excavation'
  | 'transportation'
  | 'processing-feed'
  | 'factory'

export type ReportingMetricKey = string

export type ReportingMetricOption = {
  key: ReportingMetricKey
  label: string
  uom?: string
}

export type ReportingStageOption = {
  key: ReportingStageKey
  label: string
  metrics: ReportingMetricOption[]
}

export type ReportingKpiPoint = {
  label: string
  value: number | null
  caption: string
}

export type ReportingKpiSummaryItem = {
  key: string
  label: string
  value: number | null
  unit?: string
  delta: number | null
  target?: number
  targetLabel: string
  fractionDigits?: number
  inverseDelta?: boolean
}

export type ReportingMonthlyPoint = {
  month: string
  fact: number | null
  plan: number | null
  forecast: number | null
}

export type ReportingBreakdownPoint = {
  name: string
  value: number | null
}

export type ReportingOverview = {
  metricKey: ReportingMetricKey
  unit: string
  kpis: ReportingKpiPoint[]
  deltas: string[]
  donutValue: number | null
  donutUnit: string
  breakdown: ReportingBreakdownPoint[]
  monthly: ReportingMonthlyPoint[]
}

export type ReportingProductionCard = {
  id: string
  metricKey: ReportingMetricKey
  title: string
  unit: string
  bars: ReportingKpiPoint[]
  deltas: string[]
  description: string
}

export type ReportingDataset = {
  assetKey: ReportingAssetKey
  kpiSummary: ReportingKpiSummaryItem[]
  overviews: ReportingOverview[]
  productionCards: ReportingProductionCard[]
}

export function getReportingProductionCards(
  dataset: ReportingDataset,
  metrics: ReportingMetricOption[]
): ReportingProductionCard[] {
  return metrics.flatMap((metric) => {
    const card = dataset.productionCards.find((item) => item.metricKey === metric.key)

    return card ? [card] : []
  })
}
