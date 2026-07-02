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
      <ContentHeader breadcrumbs={[{ label: 'Производство' }]} showBusinessUnitFilter={false} />
      <PageSurface variant="constrained">
        <ProductionSummaryDashboard query={getSummaryQueryFromSearchParams(searchParams)} />
      </PageSurface>
    </PageShell>
  )
}
