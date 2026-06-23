import { notFound } from 'next/navigation'

import { ContentHeader, homeBreadcrumbIcon, ProductionMetricDetail } from '@/widgets'
import {
  getProductionMetricDetail,
  getProductionStageHref,
  getProductionStagesHref,
  type ProductionStageSearchParams
} from '@/entities/production-stage'
import { PageShell, PageSurface } from '@/shared/ui'

type ProductionMetricDetailPageProps = {
  params: {
    stageSlug: string
    metricSlug: string
  }
  searchParams?: ProductionStageSearchParams
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
    <PageShell>
      <ContentHeader
        breadcrumbs={[
          { label: 'Главная', href: '/', icon: homeBreadcrumbIcon },
          { label: 'Сводка по стадиям', href: getProductionStagesHref(searchParams) },
          {
            label: detail.stageTitle,
            href: getProductionStageHref(params.stageSlug, searchParams)
          },
          { label: detail.metricTitle }
        ]}
      />
      <PageSurface>
        <ProductionMetricDetail stageSlug={params.stageSlug} metricSlug={params.metricSlug} />
      </PageSurface>
    </PageShell>
  )
}
