export type ProductionStageSearchParams = Record<string, string | string[] | undefined>

function getProductionStageDateQuery(searchParams?: ProductionStageSearchParams) {
  const params = new URLSearchParams()
  const dateFrom = searchParams?.dateFrom
  const dateTo = searchParams?.dateTo

  if (typeof dateFrom === 'string') {
    params.set('dateFrom', dateFrom)
  }

  if (typeof dateTo === 'string') {
    params.set('dateTo', dateTo)
  }

  return params.toString()
}

function withQuery(href: string, query: string) {
  return query ? `${href}?${query}` : href
}

export function getProductionStagesHref(searchParams?: ProductionStageSearchParams) {
  return withQuery('/production-stages', getProductionStageDateQuery(searchParams))
}

export function getProductionStageHref(
  stageSlug: string,
  searchParams?: ProductionStageSearchParams
) {
  return withQuery(`/production-stages/${stageSlug}`, getProductionStageDateQuery(searchParams))
}

export function getProductionMetricHref(
  stageSlug: string,
  metricSlug: string,
  searchParams?: ProductionStageSearchParams
) {
  return withQuery(
    `/production-stages/${stageSlug}/${metricSlug}`,
    getProductionStageDateQuery(searchParams)
  )
}
