'use client'

import { Filled, Outlined } from './assets'
import { createIconGroup } from './createSvgIcon'

export type { CustomIconComponent, CustomIconGroup, CustomIconProps } from './createSvgIcon'

export const IconFilled = createIconGroup(Filled, 'Filled')
export const IconOutlined = createIconGroup(Outlined, 'Outlined')
