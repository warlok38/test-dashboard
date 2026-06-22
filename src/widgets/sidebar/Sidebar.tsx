'use client'

import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Drawer } from 'antd'
import classNames from 'classnames'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useSidebar } from './SidebarProvider'
import { getOpenSidebarKeys, getSelectedSidebarKey, SIDEBAR_ITEMS } from './sidebarConfig'
import styles from './Sidebar.module.css'
import { CollapsedSidebarNav, SidebarMenu } from './ui'

type SidebarVariant = 'desktop' | 'drawer'

type SidebarContentProps = {
  collapsed?: boolean
  variant?: SidebarVariant
}

function SidebarContent({ collapsed = false, variant = 'desktop' }: SidebarContentProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { closeMobileSidebar, toggleCollapsed } = useSidebar()
  const isDrawer = variant === 'drawer'
  const isCollapsed = !isDrawer && collapsed
  const routeOpenKeys = useMemo(() => getOpenSidebarKeys(pathname), [pathname])
  const [openKeys, setOpenKeys] = useState(routeOpenKeys)

  useEffect(() => {
    setOpenKeys(routeOpenKeys)
  }, [routeOpenKeys])

  const queryString = searchParams.toString()
  const onRouteClick = useMemo(
    () => (isDrawer ? closeMobileSidebar : undefined),
    [closeMobileSidebar, isDrawer]
  )
  const selectedKey = getSelectedSidebarKey(pathname)

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

      {isCollapsed ? (
        <CollapsedSidebarNav items={SIDEBAR_ITEMS} pathname={pathname} queryString={queryString} />
      ) : (
        <SidebarMenu
          items={SIDEBAR_ITEMS}
          onOpenChange={setOpenKeys}
          onRouteClick={onRouteClick}
          openKeys={openKeys}
          queryString={queryString}
          selectedKey={selectedKey}
        />
      )}

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
        size={280}
        closable={false}
        rootClassName={styles.drawer}
      >
        <SidebarContent variant="drawer" />
      </Drawer>
    </>
  )
}
