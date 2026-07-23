export type SummarySeverity = 'critical' | 'warning' | 'info' | string

export type SummaryPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type GtkName = string

export type GtkSlug = 'olimpiada' | 'blagodatnoe' | 'natalka' | 'kuranah' | 'suhoy-log'

export type SummaryQuery = {
  period?: SummaryPeriod
  production_date?: string
  indicator?: string
  gtk?: string
}

export type SummaryIndicatorDetail = {
  gtk_or_zif: string
  display_name: string
  plan_value: number | null
  fact_value: number | null
  deviation_pct: number | null
  severity: SummarySeverity
}

export type SummaryIndicatorCard = {
  indicator_name: string
  plan_value: number | null
  fact_value: number | null
  deviation_pct: number | null
  severity: SummarySeverity
  measure_unit: string
  details: SummaryIndicatorDetail[]
}

export type StageSummary = {
  display_name: string
  critical: number
  warning: number
  info: number
  cards: SummaryIndicatorCard[]
}

export type AlarmSummaryResponse = {
  production_date?: string
  production_date_from: string
  production_date_to: string
  shift: number
  total_critical: number
  total_warning: number
  total_incidents: number
  by_stage: Record<string, StageSummary>
  by_enrichment: StageSummary
}

export type GraphQuery = {
  indicator: string
  shift?: number
  production_date?: string
  gtk?: string
}

export type GraphPeriod = SummaryPeriod

export type GraphMode = 'gtk' | 'park' | 'stage' | 'quarry' | 'parkPercent' | 'block'

export type GraphPoint = {
  date: string
  fact: number | null
  measure_unit?: string
  plan: number | null
}

export type GraphMappingItem = {
  indicator: string
  unit: string
  modes: GraphMode[]
}

export type GraphMappingResponse = Record<string, GraphMappingItem[]>

export type GraphByModeQuery = {
  indicator: string
  shift?: number
  production_date?: string
  period?: GraphPeriod
  date_from?: string
  date_to?: string
  mode?: GraphMode
  gtk_name?: string
}

export type GraphByModeMetadata = {
  period: GraphPeriod
  start_date: string
  end_date: string
  shift: number
  gtk: string
}

export type GraphByModeDetail = {
  indicator: string
  gtk: string
  display_name?: string | null
  unit: string
  points: GraphPoint[]
}

export type GraphByModeResponse = {
  metadata: GraphByModeMetadata
  details: GraphByModeDetail[]
}

export type GraphWithGtkMetadata = {
  period: GraphPeriod
  production_date: string
  start_date: string
  end_date: string
}

export type GraphWithGtkDetail = {
  indicator: string
  gtk: string
  display_name?: string | null
  unit: string
  points: GraphPoint[]
}

export type GraphWithGtkResponse = {
  metadata: GraphWithGtkMetadata
  details: GraphWithGtkDetail[]
}

export type GraphWithDetailsMetadata = {
  period: GraphPeriod
  production_date: string
  start_date: string
  end_date: string
}

export type GraphWithDetailsDetail = {
  indicator: string
  unit: string
  points: GraphPoint[]
}

export type GraphWithDetailsResponse = {
  metadata: GraphWithDetailsMetadata
  details: GraphWithDetailsDetail[]
}

export type DepositMetricView = {
  id: string
  title: string
  unit: string
  factValue: number | null
  planValue: number | null
  deviationPct: number | null
  severity: SummarySeverity
}

export type DepositSummaryView = {
  name: string
  slug?: GtkSlug
  href?: string
  status: SummarySeverity
  statusLabel: string
  metrics: DepositMetricView[]
}

export type GeneralSummaryCard = {
  indicator_name: string
  plan_value: number
  fact_value: number
  deviation_pct: number
  measure_unit: string
  cards: GeneralSummaryCard[] | null
  details?: GeneralSummaryGtkBreakdown[] | null
}

export type GeneralSummaryGtkBreakdown = {
  gtk_or_zif: string
  plan_value: number | null
  fact_value: number | null
  deviation_pct: number | null
  display_name?: string | null
}

export type GeneralSummaryResponse = {
  production_date?: string
  production_date_from: string
  production_date_to: string
  shift: number
  cards: GeneralSummaryCard[]
}

export type GeneralSummaryParams = {
  shift?: number
  production_date?: string
  gtk?: string
}
