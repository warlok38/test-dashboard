'use client'

import { Suspense, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { isAuthStatusPath } from '@/features/auth/lib/redirect'
import { AuthContentGate } from '@/features/auth/ui/AuthContentGate'
import { ServiceAccessGate } from '@/features/permissions'
import { AppFooter } from '@/widgets/app-footer'
import { Header } from '@/widgets/header'
import { Sidebar, SidebarProvider } from '@/widgets/sidebar'
import styles from './Layout.module.css'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const isAuthStatusPage = isAuthStatusPath(pathname)

  return (
    <SidebarProvider>
      <div className={styles.layout}>
        <Header />
        <section className={styles.contentArea}>
          <AuthContentGate>
            {isAuthStatusPage ? (
              <div className={styles.contentColumn}>
                <main className={styles.mainContent} data-main-content-scroll>
                  {children}
                </main>
              </div>
            ) : (
              <ServiceAccessGate>
                <Suspense fallback={null}>
                  <Sidebar />
                </Suspense>
                <div className={styles.contentColumn}>
                  <main className={styles.mainContent} data-main-content-scroll>
                    {children}
                  </main>
                  <AppFooter />
                </div>
              </ServiceAccessGate>
            )}
          </AuthContentGate>
        </section>
      </div>
    </SidebarProvider>
  )
}
