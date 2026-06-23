import { productionMetricDetails } from '@/shared/mocks/production-stage/productionStageDetails'

import { DETAIL_PERIODS, type DetailPeriod } from '../model/types'

export function getProductionMetricDetail(stageSlug: string, metricSlug: string) {
  return productionMetricDetails.find(
    (detail) => detail.stageSlug === stageSlug && detail.metricSlug === metricSlug
  )
}

export function isDetailPeriod(value: string | null): value is DetailPeriod {
  return DETAIL_PERIODS.some((period) => period.value === value)
}
