import {
  BarChartOutlined,
  LineChartOutlined,
  PartitionOutlined,
  SettingOutlined
} from '@ant-design/icons'
import type { ComponentType } from 'react'

export type SidebarItem = {
  href: string
  label: string
  icon: ComponentType
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    href: '/',
    label: 'Сводка по стадиям',
    icon: BarChartOutlined
  },
  {
    href: '/compare',
    label: 'Сравнение объектов',
    icon: PartitionOutlined
  },
  {
    href: '/analytics',
    label: 'Аналитика',
    icon: LineChartOutlined
  },
  {
    href: '/settings',
    label: 'Настройки',
    icon: SettingOutlined
  }
]

export function isItemActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
