'use client'

import { Filled, Outlined } from './assets'
import { createIconGroup } from './createSvgIcon'

export type { CustomIconComponent, CustomIconGroup, CustomIconProps } from './createSvgIcon'

/**
 * Filled custom project icons.
 *
 * Add SVG exports to `src/shared/ui/icons/assets/filled/index.ts`,
 * then use icons as `<IconFilled.IconName />`.
 */
export const IconFilled = createIconGroup(Filled, 'Filled')

/**
 * Outlined custom project icons.
 *
 * Add SVG exports to `src/shared/ui/icons/assets/outlined/index.ts`,
 * then use icons as `<IconOutlined.IconName />`.
 */
export const IconOutlined = createIconGroup(Outlined, 'Outlined')
