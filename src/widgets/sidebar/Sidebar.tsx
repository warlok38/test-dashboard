'use client'

import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Drawer } from 'antd'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'
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
import { CollapsedSidebarNav, SidebarDateTime, SidebarMenu } from './ui'

type SidebarVariant = 'desktop' | 'drawer'

const GTK_MENU_SKELETON_ITEMS = Array.from({ length: 4 }, (_, index) => ({
  key: `${GTK_MENU_KEY}-loading-${index}`,
  label: '',
  disabled: true,
  isSkeleton: true
}))

const SETTINGS_MENU_KEY = '/settings'

type SidebarContentProps = {
  collapsed?: boolean
  variant?: SidebarVariant
}

function SidebarContent({ collapsed = false, variant = 'desktop' }: SidebarContentProps) {
  const pathname = usePathname()
  const { closeMobileSidebar, toggleCollapsed } = useSidebar()
  const { data: gtkNames = [], error: gtkError, isLoading: isGtkLoading } = useGetGtkQuery()
  const isDrawer = variant === 'drawer'
  const isCollapsed = !isDrawer && collapsed
  const routeOpenKeys = useMemo(() => getOpenSidebarKeys(), [])
  const [openKeys, setOpenKeys] = useState(routeOpenKeys)
  const isGtkInitialLoading = isGtkLoading && gtkNames.length === 0
  const isGtkInitialError = Boolean(gtkError) && gtkNames.length === 0
  const sidebarItems = useMemo(
    () =>
      BASE_SIDEBAR_ITEMS.map((item) => {
        if (item.key !== GTK_MENU_KEY) {
          return item
        }

        if (isGtkInitialLoading) {
          return {
            ...item,
            children: GTK_MENU_SKELETON_ITEMS
          }
        }

        if (isGtkInitialError) {
          return {
            ...item,
            children: [
              {
                key: `${GTK_MENU_KEY}-error`,
                label: 'Список недоступен',
                disabled: true,
                isStatus: true
              }
            ]
          }
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
    [gtkNames, isGtkInitialError, isGtkInitialLoading]
  )
  const primarySidebarItems = useMemo(
    () => sidebarItems.filter((item) => item.key !== SETTINGS_MENU_KEY),
    [sidebarItems]
  )
  const footerSidebarItems = useMemo(
    () => sidebarItems.filter((item) => item.key === SETTINGS_MENU_KEY),
    [sidebarItems]
  )

  useEffect(() => {
    setOpenKeys(routeOpenKeys)
  }, [routeOpenKeys])

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
      {isDrawer && (
        <div className={styles.header}>
          <SidebarDateTime collapsed={isCollapsed} />
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeMobileSidebar}
            aria-label="Закрыть меню"
          >
            <CloseOutlined />
          </button>
        </div>
      )}

      {!isDrawer && <SidebarDateTime collapsed={isCollapsed} />}

      {isCollapsed ? (
        <CollapsedSidebarNav items={primarySidebarItems} pathname={pathname} />
      ) : (
        <SidebarMenu
          items={primarySidebarItems}
          onOpenChange={setOpenKeys}
          onRouteClick={onRouteClick}
          openKeys={openKeys}
          selectedKey={selectedKey}
        />
      )}

      <div className={styles.spacer} />

      {isCollapsed ? (
        <CollapsedSidebarNav items={footerSidebarItems} pathname={pathname} />
      ) : (
        <SidebarMenu
          items={footerSidebarItems}
          onOpenChange={setOpenKeys}
          onRouteClick={onRouteClick}
          openKeys={openKeys}
          selectedKey={selectedKey}
        />
      )}

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
