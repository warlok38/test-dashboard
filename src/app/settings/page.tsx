import { SettingOutlined } from '@ant-design/icons'

import { ThemeSwitch } from '@/features'
import { PageShell, PageSurface } from '@/shared/ui'
import { ContentHeader, homeBreadcrumbIcon } from '@/widgets'

import styles from './page.module.css'

export default function SettingsPage() {
  return (
    <PageShell>
      <ContentHeader
        breadcrumbs={[
          { label: 'Главная', href: '/', icon: homeBreadcrumbIcon },
          { label: 'Настройки', icon: <SettingOutlined /> }
        ]}
        showBusinessUnitFilter={false}
        showDateFilter={false}
      />

      <PageSurface>
        <section className={styles.settings}>
          <div className={styles.content}>
            <h1 className={styles.title}>Настройки</h1>

            <div className={styles.settingRow}>
              <div className={styles.settingText}>
                <h2 className={styles.settingTitle}>Тема</h2>
                <p className={styles.settingDescription}>Переключение светлого и темного режима.</p>
              </div>
              <ThemeSwitch />
            </div>
          </div>
        </section>
      </PageSurface>
    </PageShell>
  )
}
