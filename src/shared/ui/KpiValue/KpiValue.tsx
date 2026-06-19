import classNames from 'classnames'
import type { ElementType } from 'react'

import { formatNumber } from '@/shared/utils/formatNumber'

import styles from './KpiValue.module.css'

export type KpiValueKind = 'fact' | 'plan' | 'delta'
export type KpiValueTone = 'fact' | 'plan' | 'success' | 'danger' | 'neutral'

type KpiValueProps<TElement extends ElementType = 'span'> = {
  value: number | null | undefined
  kind: KpiValueKind
  as?: TElement
  className?: string
  fractionDigits?: number
  inverse?: boolean
  neutralZero?: boolean
}

type FormatKpiValueOptions = {
  kind?: KpiValueKind
  fractionDigits?: number
}

type GetKpiValueToneOptions = {
  kind: KpiValueKind
  inverse?: boolean
  neutralZero?: boolean
}

const KPI_KIND_TONE_MAP: Partial<Record<KpiValueKind, KpiValueTone>> = {
  fact: 'fact',
  plan: 'plan'
}

function isEmptyKpiValue(value: number | null | undefined, neutralZero: boolean) {
  return typeof value !== 'number' || (neutralZero && value === 0)
}

function isNumberKpiValue(value: number | null | undefined): value is number {
  return typeof value === 'number'
}

function getDeltaTone(value: number, inverse: boolean): KpiValueTone {
  if (value > 0) {
    return inverse ? 'danger' : 'success'
  }

  return inverse ? 'success' : 'danger'
}

/**
 * Displays KPI numbers with shared dashboard semantics: null/undefined render as "-",
 * zero is neutral by default, fact is yellow, plan is gray, and delta uses success/danger
 * colors with optional inverse meaning for metrics where lower values are better.
 */
export function KpiValue<TElement extends ElementType = 'span'>({
  value,
  kind,
  as,
  className,
  fractionDigits,
  inverse = false,
  neutralZero = true
}: KpiValueProps<TElement>) {
  const Component = as ?? 'span'
  const tone = getKpiValueTone(value, { kind, inverse, neutralZero })

  return (
    <Component className={classNames(styles.value, styles[tone], className)}>
      {formatKpiValue(value, { kind, fractionDigits })}
    </Component>
  )
}

export function getKpiValueTone(
  value: number | null | undefined,
  { kind, inverse = false, neutralZero = true }: GetKpiValueToneOptions
): KpiValueTone {
  if (!isNumberKpiValue(value) || isEmptyKpiValue(value, neutralZero)) {
    return 'neutral'
  }

  const kindTone = KPI_KIND_TONE_MAP[kind]

  return kindTone ?? getDeltaTone(value, inverse)
}

export function formatKpiValue(
  value: number | null | undefined,
  { kind = 'fact', fractionDigits }: FormatKpiValueOptions = {}
) {
  if (value === null || value === undefined) {
    return '-'
  }

  return formatNumber(value, {
    fractionDigits,
    showSign: kind === 'delta',
    suffix: kind === 'delta' ? '%' : ''
  })
}
