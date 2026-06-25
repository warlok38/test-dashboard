import { type ProductionStageFilters } from '../model/types'

const DATE_FROM_PARAM = 'dateFrom'
const DATE_TO_PARAM = 'dateTo'
const BUSINESS_UNIT_PARAM = 'businessUnit'

type ProductionStageSearchParams = Pick<URLSearchParams, 'get' | 'getAll'>

export function getProductionStageFiltersFromSearchParams(
  searchParams: ProductionStageSearchParams
): ProductionStageFilters {
  const businessUnit = searchParams.getAll(BUSINESS_UNIT_PARAM)

  return {
    dateFrom: searchParams.get(DATE_FROM_PARAM) ?? undefined,
    dateTo: searchParams.get(DATE_TO_PARAM) ?? undefined,
    businessUnit: businessUnit.length > 0 ? businessUnit : undefined
  }
}
