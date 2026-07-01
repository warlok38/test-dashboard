import { HomeOutlined, SettingOutlined } from '@ant-design/icons'
import type { ComponentType } from 'react'

export const GTK_MENU_KEY = 'gtk-root'

export type SidebarMenuItem = {
  key: string
  label: string
  href?: string
  icon?: ComponentType
  children?: SidebarMenuItem[]
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
    children: []
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
