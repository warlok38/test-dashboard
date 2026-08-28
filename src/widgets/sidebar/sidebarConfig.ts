import {
  BarChartOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  HomeOutlined,
  SettingOutlined
} from '@ant-design/icons'
import type { ComponentType } from 'react'

export const GTK_MENU_KEY = 'gtk-root'

export type SidebarMenuItem = {
  key: string
  label: string
  href?: string
  icon?: ComponentType
  isExternal?: boolean
  children?: SidebarMenuItem[]
  disabled?: boolean
  isSkeleton?: boolean
  isStatus?: boolean
}

export const BASE_SIDEBAR_ITEMS: SidebarMenuItem[] = [
  {
    key: '/',
    href: '/',
    label: 'Главная',
    icon: HomeOutlined
  },
  {
    key: GTK_MENU_KEY,
    label: 'Месторождения',
    icon: EnvironmentOutlined,
    children: []
  },
  {
    key: '/reporting',
    href: '/reporting',
    label: 'Отчётность',
    icon: BarChartOutlined
  },
  {
    key: 'factor-analysis',
    href: 'https://google.com',
    label: 'Факторный анализ',
    icon: ExportOutlined,
    isExternal: true
  },
  {
    key: '/settings',
    href: '/settings',
    label: 'Настройки',
    icon: SettingOutlined
  }
]

export function getSelectedSidebarKey(pathname: string) {
  if (pathname === '/') {
    return '/'
  }

  if (pathname === '/settings') {
    return '/settings'
  }

  return pathname
}

export function getOpenSidebarKeys() {
  return [GTK_MENU_KEY]
}
