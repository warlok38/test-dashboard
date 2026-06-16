import { notFound } from 'next/navigation'

import { ContentHeader, homeBreadcrumbIcon, MiningStageOverview } from '@/components'
import { getMiningStageMetrics } from '@/shared/mocks'

type ProductionStagePageProps = {
  params: {
    stageSlug: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

function getProductionStagesHref(searchParams?: ProductionStagePageProps['searchParams']) {
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

export default function ProductionStagePage({ params, searchParams }: ProductionStagePageProps) {
  if (params.stageSlug !== 'mining') {
    notFound()
  }

  return (
    <>
      <ContentHeader
        breadcrumbs={[
          { label: 'Главная', href: '/', icon: homeBreadcrumbIcon },
          { label: 'Сводка по стадиям', href: getProductionStagesHref(searchParams) },
          { label: 'Добыча' }
        ]}
      />
      <MiningStageOverview metrics={getMiningStageMetrics()} />
    </>
  )
}
