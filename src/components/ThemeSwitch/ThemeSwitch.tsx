'use client'

import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Switch } from 'antd'

import { useTheme } from '@/shared/theme'

export type ThemeSwitchSize = 'default' | 'small'

type ThemeSwitchProps = {
  size?: ThemeSwitchSize
}

export function ThemeSwitch({ size = 'default' }: ThemeSwitchProps) {
  const { mode, toggleTheme } = useTheme()
  const isDark = mode === 'dark'

  return (
    <Switch
      checked={isDark}
      checkedChildren={<MoonOutlined />}
      unCheckedChildren={<SunOutlined />}
      onChange={toggleTheme}
      size={size === 'small' ? 'small' : undefined}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
    />
  )
}
