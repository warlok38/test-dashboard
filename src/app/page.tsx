import {
  getSummaryQueryFromSearchParams,
  type SummarySearchParams
} from '@/entities/production-summary'
import { PageShell, PageSurface } from '@/shared/ui'
import { ContentHeader, ProductionSummaryDashboard } from '@/widgets'

type HomePageProps = {
  searchParams?: SummarySearchParams
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <PageShell>
      <ContentHeader breadcrumbs={[{ label: 'ГРУППА' }]} />
      <PageSurface variant="constrained">
        <ProductionSummaryDashboard
          query={getSummaryQueryFromSearchParams(searchParams)}
          showGraph
        />
      </PageSurface>
    </PageShell>
  )
}
