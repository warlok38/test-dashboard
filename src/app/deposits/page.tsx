import { PageShell, PageSurface } from '@/shared/ui'
import { ContentHeader, homeBreadcrumbIcon } from '@/widgets'

export default function DepositsPage() {
  return (
    <PageShell>
      <ContentHeader
        breadcrumbs={[
          { label: 'ГРУППА', href: '/', icon: homeBreadcrumbIcon },
          { label: 'МЕСТОРОЖДЕНИЯ' }
        ]}
        showDateFilter={false}
      />
      <PageSurface variant="constrained">Месторождения</PageSurface>
    </PageShell>
  )
}
