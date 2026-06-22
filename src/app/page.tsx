import { PageShell, PageSurface } from '@/shared/ui'
import { ContentHeader, homeBreadcrumbIcon } from '@/widgets'
import styles from './page.module.css'

export default function Home() {
  return (
    <PageShell>
      <ContentHeader
        breadcrumbs={[{ label: 'Главная', icon: homeBreadcrumbIcon }]}
        showBusinessUnitFilter={false}
        showDateFilter={false}
      />
      <PageSurface>
        <section className={styles.home}>
          <h1 className={styles.title}>Главная</h1>
        </section>
      </PageSurface>
    </PageShell>
  )
}
