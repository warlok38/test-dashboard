import { Suspense, type ReactNode } from 'react'
import { AppFooter } from '@/widgets/app-footer'
import { Header } from '@/widgets/header'
import { Sidebar, SidebarProvider } from '@/widgets/sidebar'
import styles from './Layout.module.css'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className={styles.layout}>
        <Header />
        <section className={styles.contentArea}>
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>
          <div className={styles.contentColumn}>
            <main className={styles.mainContent} data-main-content-scroll>
              {children}
            </main>
            <AppFooter />
          </div>
        </section>
      </div>
    </SidebarProvider>
  )
}
