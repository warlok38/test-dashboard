import { notFound } from 'next/navigation'

import {
  getProductionStagesHref,
  type ProductionStageSearchParams
} from '@/entities/production-stage'
import { PageShell, PageSurface } from '@/shared/ui'
import { ContentHeader, homeBreadcrumbIcon, MiningStageOverview } from '@/widgets'

type ProductionStagePageProps = {
  params: {
    stageSlug: string
  }
  searchParams?: ProductionStageSearchParams
}

export default function ProductionStagePage({ params, searchParams }: ProductionStagePageProps) {
  if (params.stageSlug !== 'mining') {
    notFound()
  }

  return (
    <PageShell>
      <ContentHeader
        breadcrumbs={[
          { label: 'Главная', href: '/', icon: homeBreadcrumbIcon },
          { label: 'Сводка по стадиям', href: getProductionStagesHref(searchParams) },
          { label: 'Добыча' }
        ]}
      />
      <PageSurface>
        <MiningStageOverview stageSlug={params.stageSlug} />
      </PageSurface>
    </PageShell>
  )
}
