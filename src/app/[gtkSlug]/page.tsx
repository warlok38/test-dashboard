import { notFound } from 'next/navigation'

import {
  getGtkNameBySlug,
  getSummaryQueryFromSearchParams,
  type SummarySearchParams
} from '@/entities/production-summary'
import { PageShell, PageSurface } from '@/shared/ui'
import { ContentHeader, homeBreadcrumbIcon, ProductionSummaryDashboard } from '@/widgets'

const CAMERA_BUTTON_GTK_SLUGS = new Set<string>(['natalka'])

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
          { label: 'ГРУППА', href: '/', icon: homeBreadcrumbIcon },
          { label: gtkName.toUpperCase() }
        ]}
      />
      <PageSurface variant="constrained">
        <ProductionSummaryDashboard
          query={getSummaryQueryFromSearchParams(searchParams, gtkName)}
          showCameraButton={CAMERA_BUTTON_GTK_SLUGS.has(params.gtkSlug)}
          showGraph
        />
      </PageSurface>
    </PageShell>
  )
}
