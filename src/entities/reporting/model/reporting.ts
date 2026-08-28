export type ReportingAssetKey =
  | 'group'
  | 'kbe'
  | 'olimpiada'
  | 'blagodatnoe'
  | 'kuranah'
  | 'suhoy-log-opr'
  | 'natalka'

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

export type ReportingMetricKey =
  | 'ore-volume'
  | 'au-processing'
  | 'cargo-turnover'
  | 'ore-processing'
  | 'gold-recovery'
  | 'avg-ore-au'
  | 'avg-dore-au'

export type ReportingMetricOption = {
  key: ReportingMetricKey
  label: string
}

export type ReportingKpiPoint = {
  label: string
  value: number
  caption: string
}

export type ReportingMonthlyPoint = {
  month: string
  fact: number
  plan: number
  forecast: number
}

export type ReportingBreakdownPoint = {
  name: string
  value: number
}

export type ReportingOverview = {
  metricKey: ReportingMetricKey
  unit: string
  kpis: ReportingKpiPoint[]
  deltas: string[]
  donutValue: number
  donutUnit: string
  breakdown: ReportingBreakdownPoint[]
  monthly: ReportingMonthlyPoint[]
}

export type ReportingProductionCard = {
  id: string
  title: string
  unit: string
  bars: ReportingKpiPoint[]
  deltas: string[]
  description: string
}

export type ReportingDataset = {
  assetKey: ReportingAssetKey
  overviews: ReportingOverview[]
  productionCards: ReportingProductionCard[]
}
