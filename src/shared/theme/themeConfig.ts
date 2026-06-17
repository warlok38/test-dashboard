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
    colorPrimary: '#fbbf24',
    colorLink: '#fbbf24',
    colorInfo: '#fbbf24',
    colorBgLayout: '#171716',
    colorBgContainer: '#1f1f1d',
    colorBgElevated: '#1f1f1d',
    colorText: '#e8dfd0',
    colorTextHeading: '#f7f2e8',
    colorTextSecondary: '#aaa196',
    colorBorder: '#f7f2e824',
    colorSplit: '#f7f2e814',
    colorBgSpotlight: 'rgba(0, 0, 0, 0.45)',
    controlItemBgActive: '#fbbf2426',
    colorSuccess: '#65c97a',
    colorError: '#ff6b57',
    colorWarning: '#fbbf24'
  },
  components: darkComponentOverrides
}
