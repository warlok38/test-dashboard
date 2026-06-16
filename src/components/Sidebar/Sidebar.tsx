'use client'

import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Drawer, Menu, type MenuProps } from 'antd'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useSidebar } from './SidebarProvider'
import {
  getOpenSidebarKeys,
  getSelectedSidebarKey,
  PRODUCTION_MENU_KEY,
  SIDEBAR_ITEMS,
  type SidebarMenuItem
} from './sidebarConfig'
import styles from './Sidebar.module.css'

type SidebarVariant = 'desktop' | 'drawer'

type SidebarContentProps = {
  collapsed?: boolean
  variant?: SidebarVariant
}

function getHrefWithQuery(href: string, queryString: string) {
  if (!queryString || !href.startsWith('/production-stages')) {
    return href
  }

  return `${href}?${queryString}`
}

function getMenuItems(
  items: SidebarMenuItem[],
  queryString: string,
  onRouteClick?: () => void
): MenuProps['items'] {
  return items.map((item) => {
    const Icon = item.icon
    const label = item.href ? (
      <Link href={getHrefWithQuery(item.href, queryString)} onClick={onRouteClick}>
        {item.label}
      </Link>
    ) : (
      item.label
    )

    return {
      key: item.key,
      icon: Icon ? <Icon /> : undefined,
      label,
      children: item.children ? getMenuItems(item.children, queryString, onRouteClick) : undefined
    }
  })
}

function getCollapsedItemHref(item: SidebarMenuItem) {
  return item.href ?? item.children?.find((child) => child.href)?.href
}

function isCollapsedItemActive(item: SidebarMenuItem, pathname: string) {
  if (item.key === '/') {
    return pathname === '/'
  }

  if (item.key === PRODUCTION_MENU_KEY) {
    return pathname.startsWith('/production-stages')
  }

  return (
    typeof item.href === 'string' &&
    (pathname === item.href || pathname.startsWith(`${item.href}/`))
  )
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
  const menuItems = useMemo(
    () => getMenuItems(SIDEBAR_ITEMS, queryString, isDrawer ? closeMobileSidebar : undefined),
    [closeMobileSidebar, isDrawer, queryString]
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
        <nav className={styles.rail} aria-label="Разделы панели">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const href = getCollapsedItemHref(item)

            if (!Icon || !href) {
              return null
            }

            return (
              <Link
                key={item.key}
                href={getHrefWithQuery(href, queryString)}
                className={classNames(
                  styles.railItem,
                  isCollapsedItemActive(item, pathname) && styles.railItemActive
                )}
                title={item.label}
                aria-label={item.label}
                aria-current={isCollapsedItemActive(item, pathname) ? 'page' : undefined}
              >
                <Icon />
              </Link>
            )
          })}
        </nav>
      ) : (
        <Menu
          className={styles.menu}
          items={menuItems}
          mode="inline"
          openKeys={openKeys}
          selectedKeys={selectedKey ? [selectedKey] : []}
          onOpenChange={setOpenKeys}
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
