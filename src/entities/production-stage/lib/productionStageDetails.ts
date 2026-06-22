import {
  DETAIL_PERIODS,
  productionMetricDetails,
  type DetailPeriod
} from '../mock/productionStageDetails'

export function getProductionMetricDetail(stageSlug: string, metricSlug: string) {
  return productionMetricDetails.find(
    (detail) => detail.stageSlug === stageSlug && detail.metricSlug === metricSlug
  )
}

export function isDetailPeriod(value: string | null): value is DetailPeriod {
  return DETAIL_PERIODS.some((period) => period.value === value)
}
