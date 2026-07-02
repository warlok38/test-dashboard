import { notFound } from 'next/navigation'

import {
  getGtkNameBySlug,
  getSummaryQueryFromSearchParams,
  type SummarySearchParams
} from '@/entities/production-summary'
import { PageShell, PageSurface } from '@/shared/ui'
import { ContentHeader, homeBreadcrumbIcon, ProductionSummaryDashboard } from '@/widgets'

type GtkPageProps = {
  params: {
    gtkSlug: string
  }
  searchParams?: SummarySearchParams
}

export default function GtkPage({ params, searchParams }: GtkPageProps) {
  const gtkName = getGtkNameBySlug(params.gtkSlug)

  if (!gtkName) {
    notFound()
  }

  return (
    <PageShell>
      <ContentHeader
        breadcrumbs={[
          { label: 'Главная', href: '/', icon: homeBreadcrumbIcon },
          { label: `Производство · ${gtkName}` }
        ]}
        showBusinessUnitFilter={false}
      />
      <PageSurface variant="constrained">
        <ProductionSummaryDashboard
          query={getSummaryQueryFromSearchParams(searchParams, gtkName)}
          showGraph
        />
      </PageSurface>
    </PageShell>
  )
}
