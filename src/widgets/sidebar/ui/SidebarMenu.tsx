import { Menu, type MenuProps } from 'antd'
import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { GTK_MENU_KEY, type SidebarMenuItem } from '../sidebarConfig'
import styles from '../Sidebar.module.css'

type SidebarMenuProps = {
  items: SidebarMenuItem[]
  onOpenChange: (openKeys: string[]) => void
  onRouteClick?: () => void
  openKeys: string[]
  selectedKey?: string
}

function getMenuLabel(item: SidebarMenuItem, onRouteClick?: () => void) {
  if (item.isSkeleton) {
    return <span className={styles.menuSkeletonLine} aria-hidden="true" />
  }

  if (item.isStatus) {
    return <span className={styles.menuStatusText}>{item.label}</span>
  }

  if (item.href && !item.children) {
    if (item.isExternal) {
      return (
        <a href={item.href} target="_blank" rel="noreferrer" onClick={onRouteClick}>
          {item.label}
        </a>
      )
    }

    return (
      <Link href={item.href} onClick={onRouteClick}>
        {item.label}
      </Link>
    )
  }

  return item.label
}

function getMenuItems(
  items: SidebarMenuItem[],
  onRouteClick: (() => void) | undefined,
  onTitleRouteClick: (item: SidebarMenuItem) => void
): MenuProps['items'] {
  return items.map((item) => {
    const Icon = item.icon
    const hasChildren = Boolean(item.children)

    return {
      key: item.key,
      icon: Icon ? <Icon /> : undefined,
      label: getMenuLabel(item, onRouteClick),
      children: item.children
        ? getMenuItems(item.children, onRouteClick, onTitleRouteClick)
        : undefined,
      onTitleClick: hasChildren && item.href ? () => onTitleRouteClick(item) : undefined,
      disabled: item.disabled
    }
  })
}

export function SidebarMenu({
  items,
  onOpenChange,
  onRouteClick,
  openKeys,
  selectedKey
}: SidebarMenuProps) {
  const router = useRouter()
  const onTitleRouteClick = (item: SidebarMenuItem) => {
    if (!item.href || item.isExternal) {
      return
    }

    router.push(item.href)
    onRouteClick?.()
  }

  return (
    <Menu
      className={classNames(styles.menu, {
        [styles.menuGtkOverviewSelected]: selectedKey === GTK_MENU_KEY
      })}
      items={getMenuItems(items, onRouteClick, onTitleRouteClick)}
      mode="inline"
      openKeys={openKeys}
      selectedKeys={selectedKey ? [selectedKey] : []}
      onOpenChange={onOpenChange}
      inlineIndent={12}
    />
  )
}
