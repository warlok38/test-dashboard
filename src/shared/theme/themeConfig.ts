import type { ThemeConfig } from 'antd'

import { componentOverrides, darkComponentOverrides } from './overrides'

type ThemeToken = NonNullable<ThemeConfig['token']>

const sharedToken: ThemeToken = {
  fontFamily: 'var(--font-montserrat), Arial, Helvetica, sans-serif',
  borderRadiusXS: 5,
  borderRadiusSM: 5,
  borderRadius: 5,
  borderRadiusLG: 5
}

export const themeConfig: ThemeConfig = {
  token: {
    ...sharedToken,
    colorPrimary: '#fab529',
    colorLink: '#fab529',
    colorInfo: '#fab529',
    colorText: '#2f2f2f',
    colorTextHeading: '#1c1c1c',
    colorTextSecondary: '#575757',
    colorBorder: '#29292938',
    colorSplit: '#2929291f',
    colorBgLayout: '#f2f1ee',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    controlItemBgActive: '#fab52929'
  },
  components: componentOverrides
}

export const darkThemeConfig: ThemeConfig = {
  token: {
    ...sharedToken,
    colorPrimary: '#f0b24a',
    colorLink: '#f0b24a',
    colorInfo: '#f0b24a',
    colorBgLayout: '#1b1b1b',
    colorBgContainer: '#171717',
    colorBgElevated: '#222222',
    colorText: '#e9e3d8',
    colorTextHeading: '#fcf8ef',
    colorTextSecondary: '#b7ada0',
    colorBorder: '#e9e3d833',
    colorSplit: '#e9e3d81f',
    colorBgSpotlight: 'rgba(0, 0, 0, 0.45)',
    controlItemBgActive: '#f0b24a2e',
    colorSuccess: '#49aa19'
  },
  components: darkComponentOverrides
}
