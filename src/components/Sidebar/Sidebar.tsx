'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Drawer } from 'antd'
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { useSidebar } from './SidebarProvider'
import { isItemActive, SIDEBAR_ITEMS } from './sidebarConfig'
import styles from './Sidebar.module.css'

type SidebarVariant = 'desktop' | 'drawer'

type SidebarContentProps = {
  collapsed?: boolean
  variant?: SidebarVariant
}

function SidebarContent({ collapsed = false, variant = 'desktop' }: SidebarContentProps) {
  const pathname = usePathname()
  const { closeMobileSidebar, toggleCollapsed } = useSidebar()
  const isDrawer = variant === 'drawer'
  const isCollapsed = !isDrawer && collapsed

  return (
    <aside
      className={classNames(styles.sidebar, {
        [styles.sidebarCollapsed]: isCollapsed,
        [styles.sidebarDrawer]: isDrawer
      })}
      aria-label="Навигация приложения"
    >
      <div className={styles.header}>
        <div className={styles.logoMark} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className={styles.brand}>
          <span className={styles.title}>COOL DASHBOARD</span>
          <span className={styles.subtitle}>Production Monitor</span>
        </div>

        {isDrawer && (
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeMobileSidebar}
            aria-label="Закрыть меню"
          >
            <CloseOutlined />
          </button>
        )}
      </div>

      <nav className={styles.nav} aria-label="Разделы панели">
        {SIDEBAR_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = isItemActive(pathname, href)

          return (
            <Link
              key={href}
              href={href}
              className={classNames(styles.navItem, isActive && styles.navItemActive)}
              title={isCollapsed ? label : undefined}
              aria-current={isActive ? 'page' : undefined}
              onClick={isDrawer ? closeMobileSidebar : undefined}
            >
              <Icon />
              <span className={styles.navLabel}>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className={styles.spacer} />

      {!isDrawer && (
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {isCollapsed ? <RightOutlined /> : <LeftOutlined />}
            <span className={styles.collapseLabel}>Свернуть</span>
          </button>
        </div>
      )}
    </aside>
  )
}

export function Sidebar() {
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useSidebar()

  return (
    <>
      <SidebarContent collapsed={isCollapsed} />

      <Drawer
        placement="left"
        open={isMobileOpen}
        onClose={closeMobileSidebar}
        width={280}
        closable={false}
        rootClassName={styles.drawer}
      >
        <SidebarContent variant="drawer" />
      </Drawer>
    </>
  )
}
