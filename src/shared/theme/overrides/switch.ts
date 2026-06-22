import type { ThemeConfig } from 'antd'

type SwitchTheme = NonNullable<NonNullable<ThemeConfig['components']>['Switch']>

export const switchTheme: SwitchTheme = {
  colorPrimary: '#b8b8b8',
  colorPrimaryHover: '#a9a9a9',
  colorTextQuaternary: '#aaaaaa',
  colorTextTertiary: '#c9c9c9',
  handleBg: '#ffffff',
  handleShadow: '0 2px 4px 0 rgb(0 0 0 / 18%)'
}

export const darkSwitchTheme: SwitchTheme = {
  colorPrimary: '#4c4c4a',
  colorPrimaryHover: '#5a5a57',
  colorTextQuaternary: '#484848',
  colorTextTertiary: '#4a4a47',
  handleBg: '#f7f2e8',
  handleShadow: '0 2px 4px 0 rgb(0 0 0 / 34%)'
}
