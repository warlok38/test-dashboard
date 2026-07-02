'use client'

import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Drawer } from 'antd'
import classNames from 'classnames'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { getGtkHrefByName, getGtkSlugByName, useGetGtkQuery } from '@/entities/production-summary'
import { useSidebar } from './SidebarProvider'
import {
  BASE_SIDEBAR_ITEMS,
  getOpenSidebarKeys,
  getSelectedSidebarKey,
  GTK_MENU_KEY
} from './sidebarConfig'
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
  const { data: gtkNames = [] } = useGetGtkQuery()
  const isDrawer = variant === 'drawer'
  const isCollapsed = !isDrawer && collapsed
  const routeOpenKeys = useMemo(() => getOpenSidebarKeys(), [])
  const [openKeys, setOpenKeys] = useState(routeOpenKeys)
  const sidebarItems = useMemo(
    () =>
      BASE_SIDEBAR_ITEMS.map((item) => {
        if (item.key !== GTK_MENU_KEY) {
          return item
        }

        return {
          ...item,
          children: gtkNames
            .filter((name) => getGtkSlugByName(name))
            .map((name) => {
              const href = getGtkHrefByName(name)

              return {
                key: href ?? name,
                href,
                label: name
              }
            })
        }
      }),
    [gtkNames]
  )

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
          <span className={styles.title}>ЦИФРОВОЙ ГОК</span>
          <span className={styles.subtitle}>Планерка</span>
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

      {!isCollapsed && (
        <div className={styles.dateBlock}>
          <span className={styles.dateLabel}>Пятница, 26 июня</span>
          <span>2026 · 09:14 МСК</span>
        </div>
      )}

      {isCollapsed ? (
        <CollapsedSidebarNav items={sidebarItems} pathname={pathname} queryString={queryString} />
      ) : (
        <SidebarMenu
          items={sidebarItems}
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
