import { type ReactNode } from 'react'
import { Header } from '../Header'
import { Sidebar, SidebarProvider } from '../Sidebar'
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
          <Sidebar />
          <div className={styles.contentColumn}>
            <main className={styles.mainContent}>{children}</main>
          </div>
        </section>
      </div>
    </SidebarProvider>
  )
}
