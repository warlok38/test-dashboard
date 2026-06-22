import { formatKpiValue } from '@/shared/ui'

export type MetricValue = number | null | undefined

export function hasMetricValue(value: MetricValue): value is number {
  return typeof value === 'number'
}

export function getDelta(fact: MetricValue, plan: number) {
  if (!hasMetricValue(fact)) {
    return null
  }

  if (plan === 0) {
    return fact === 0 ? 0 : null
  }

  return ((fact - plan) / plan) * 100
}

export function getMetricTone(fact: MetricValue, delta: number | null) {
  if (!hasMetricValue(fact)) {
    return 'danger'
  }

  if (delta === null) {
    return 'neutral'
  }

  return delta < 0 ? 'danger' : 'success'
}

export function getStatusText(fact: MetricValue, delta: number | null) {
  if (!hasMetricValue(fact)) {
    return 'Нет факта'
  }

  if (delta === null) {
    return 'Без плана'
  }

  return delta < 0 ? 'Ниже плана' : 'В плане'
}

export function formatStatusBadge(fact: MetricValue, statusText: string, delta: number | null) {
  return hasMetricValue(fact)
    ? `${statusText} ${formatKpiValue(delta, { kind: 'delta', fractionDigits: 2 })}`
    : statusText
}
