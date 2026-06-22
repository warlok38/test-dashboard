import type { ThemeConfig } from 'antd'

import { darkMenuTheme, menuTheme } from './menu'
import { darkSwitchTheme, switchTheme } from './switch'

type ComponentOverrides = NonNullable<ThemeConfig['components']>

export const componentOverrides: ComponentOverrides = {
  Menu: menuTheme,
  Switch: switchTheme
}

export const darkComponentOverrides: ComponentOverrides = {
  Menu: darkMenuTheme,
  Switch: darkSwitchTheme
}
