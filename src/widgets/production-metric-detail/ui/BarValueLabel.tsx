import { formatKpiValue, getKpiValueTone } from '@/shared/ui'

import { getNumberProp } from '../lib'

const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-kpi-plan)'
const NEUTRAL_VALUE_COLOR = 'var(--color-kpi-neutral)'

function getSvgKpiValueColor(tone: ReturnType<typeof getKpiValueTone>) {
  if (tone === 'fact') {
    return FACT_COLOR
  }

  if (tone === 'plan') {
    return PLAN_COLOR
  }

  return NEUTRAL_VALUE_COLOR
}

function createBarValueLabel(kind: 'fact' | 'plan') {
  return function BarValueLabel(props: unknown) {
    if (typeof props !== 'object' || props === null) {
      return null
    }

    const record = props as Record<string, unknown>
    const x = getNumberProp(record, 'x')
    const y = getNumberProp(record, 'y')
    const width = getNumberProp(record, 'width')
    const height = getNumberProp(record, 'height')
    const value = getNumberProp(record, 'value')

    if (x === null || y === null || width === null || height === null) {
      return null
    }

    const tone = getKpiValueTone(value, { kind })

    return (
      <text
        x={x + width / 2}
        y={y + height + 20}
        fill={getSvgKpiValueColor(tone)}
        fontSize={14}
        fontWeight={700}
        textAnchor="middle"
      >
        {formatKpiValue(value, {
          kind,
          fractionDigits: value !== null && value % 1 === 0 ? 0 : 2
        })}
      </text>
    )
  }
}

export const renderPlanValueLabel = createBarValueLabel('plan')
export const renderFactValueLabel = createBarValueLabel('fact')
