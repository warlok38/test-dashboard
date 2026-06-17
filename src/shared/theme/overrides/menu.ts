import type { ThemeConfig } from 'antd'

type MenuTheme = NonNullable<NonNullable<ThemeConfig['components']>['Menu']>

export const menuTheme: MenuTheme = {
  itemBg: 'transparent',
  subMenuItemBg: 'transparent',
  itemColor: 'var(--color-text-sidebar)',
  itemHoverColor: 'var(--color-text-sidebar)',
  itemHoverBg: 'var(--color-bg-sidebar-hover)',
  itemActiveBg: 'var(--color-bg-sidebar-hover)',
  itemSelectedColor: 'var(--palette-accent-on-solid)',
  itemSelectedBg: 'var(--palette-accent-primary)',
  subMenuItemSelectedColor: 'var(--palette-accent-primary-hover)',
  itemBorderRadius: 5,
  subMenuItemBorderRadius: 5
}

export const darkMenuTheme: MenuTheme = {
  ...menuTheme,
  itemSelectedColor: 'var(--palette-accent-primary-hover)',
  itemSelectedBg: 'var(--palette-accent-soft)',
  subMenuItemSelectedColor: 'var(--palette-accent-primary-hover)',
  darkItemColor: 'var(--color-text-sidebar)',
  darkItemBg: 'transparent',
  darkSubMenuItemBg: 'transparent',
  darkItemHoverColor: 'var(--color-text-sidebar)',
  darkItemHoverBg: 'var(--color-bg-sidebar-hover)',
  darkItemSelectedColor: 'var(--palette-accent-primary-hover)',
  darkItemSelectedBg: 'var(--palette-accent-soft)'
}
