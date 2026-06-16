import { ContentHeader, homeBreadcrumbIcon } from '@/components'
import styles from './page.module.css'

export default function Home() {
  return (
    <>
      <ContentHeader
        breadcrumbs={[{ label: 'Главная', icon: homeBreadcrumbIcon }]}
        showDateFilter={false}
      />
      <section className={styles.home}>
        <h1 className={styles.title}>Главная</h1>
      </section>
    </>
  )
}
