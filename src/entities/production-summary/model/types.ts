export type SummarySeverity = 'critical' | 'warning' | 'info' | string

export type GtkName = string

export type GtkSlug = 'olimpiada' | 'blagodatnoe' | 'natalka' | 'kuranah' | 'suhoy-log'

export type SummaryQuery = {
  date_from: string
  date_to: string
  gtk?: string
}

export type SummaryIndicatorDetail = {
  gtk_or_zif: string
  plan_value: number
  fact_value: number
  deviation_pct: number
  severity: SummarySeverity
}

export type SummaryIndicatorCard = {
  indicator_name: string
  plan_value: number
  fact_value: number
  deviation_pct: number
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
  production_date_from: string
  production_date_to: string
  shift: number
  total_critical: number
  total_warning: number
  total_incidents: number
  by_stage: Record<string, StageSummary>
}

export type GraphQuery = {
  indicator: string
  date?: string
  date_from?: string
  date_to?: string
  gtk: string
}

export type GraphPoint = {
  date: string
  fact: number | null
  plan: number | null
}

export type DepositMetricView = {
  id: string
  title: string
  unit: string
  factValue: number
  planValue: number
  deviationPct: number
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
