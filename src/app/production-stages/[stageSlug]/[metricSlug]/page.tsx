import { notFound } from 'next/navigation'

import { ContentHeader, homeBreadcrumbIcon, ProductionMetricDetail } from '@/components'
import { getProductionMetricDetail } from '@/shared/mocks'

type ProductionMetricDetailPageProps = {
  params: {
    stageSlug: string
    metricSlug: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

function getProductionStagesHref(searchParams?: ProductionMetricDetailPageProps['searchParams']) {
  const params = new URLSearchParams()
  const dateFrom = searchParams?.dateFrom
  const dateTo = searchParams?.dateTo

  if (typeof dateFrom === 'string') {
    params.set('dateFrom', dateFrom)
  }

  if (typeof dateTo === 'string') {
    params.set('dateTo', dateTo)
  }

  const query = params.toString()

  return query ? `/production-stages?${query}` : '/production-stages'
}

export default function ProductionMetricDetailPage({
  params,
  searchParams
}: ProductionMetricDetailPageProps) {
  const detail = getProductionMetricDetail(params.stageSlug, params.metricSlug)

  if (!detail) {
    notFound()
  }

  return (
    <>
      <ContentHeader
        breadcrumbs={[
          { label: 'Главная', href: '/', icon: homeBreadcrumbIcon },
          { label: 'Сводка по стадиям', href: getProductionStagesHref(searchParams) },
          { label: detail.stageTitle },
          { label: detail.metricTitle }
        ]}
      />
      <ProductionMetricDetail detail={detail} />
    </>
  )
}
