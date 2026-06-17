import type { ThemeConfig } from 'antd'

import { darkMenuTheme, menuTheme } from './menu'

type ComponentOverrides = NonNullable<ThemeConfig['components']>

export const componentOverrides: ComponentOverrides = {
  Menu: menuTheme
}

export const darkComponentOverrides: ComponentOverrides = {
  Menu: darkMenuTheme
}
