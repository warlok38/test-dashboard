export type PeriodKey = 'day' | 'month' | 'year'

export type PeriodOption = {
  key: PeriodKey
  label: string
  shift: number
  disabled?: boolean
}

export type PeriodScopeLabel = {
  primary: string
  secondary?: string
}

export type PeriodRequestParams = {
  shift: number
  production_date?: string
}

export const DEFAULT_PERIOD_KEY: PeriodKey = 'day'

export const PERIOD_OPTIONS: PeriodOption[] = [
  { key: 'day', label: 'Сутки', shift: 3 },
  { key: 'month', label: 'Месяц', shift: 99 },
  // TODO: уточнить код смены для периода "год"
  { key: 'year', label: 'Год', shift: 100, disabled: true }
]

const MONTH_LABELS = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь'
] as const

const DEFAULT_PRODUCTION_DATE = '2026-07-01'
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function createUtcDate(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1))
}

function formatDate(year: number, month: number) {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-01`
}

function parseProductionDate(value: string | undefined) {
  const match = value?.match(DATE_PATTERN)

  if (!match) {
    return { year: 2026, month: 7 }
  }

  const year = Number(match[1])
  const month = Number(match[2])

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return { year: 2026, month: 7 }
  }

  return { year, month }
}

export function getCurrentProductionDate() {
  const now = new Date()

  return formatDate(now.getFullYear(), now.getMonth() + 1)
}

export function getPeriodByShift(shift: string | number | undefined): PeriodOption {
  const numericShift = Number(shift)

  return (
    PERIOD_OPTIONS.find((option) => option.shift === numericShift) ??
    PERIOD_OPTIONS.find((option) => option.key === DEFAULT_PERIOD_KEY) ??
    PERIOD_OPTIONS[0]
  )
}

export function normalizeProductionDate(period: PeriodOption, productionDate: string | undefined) {
  const { year, month } = parseProductionDate(productionDate ?? DEFAULT_PRODUCTION_DATE)

  if (period.key === 'month') {
    return formatDate(year, 1)
  }

  return formatDate(year, month)
}

export function createPeriodRequestParams(
  period: PeriodOption,
  productionDate: string | undefined
): PeriodRequestParams {
  if (period.key === 'year') {
    return { shift: period.shift }
  }

  return {
    shift: period.shift,
    production_date: normalizeProductionDate(period, productionDate)
  }
}

export function shiftProductionDate(
  period: PeriodOption,
  productionDate: string | undefined,
  direction: -1 | 1
) {
  if (period.key === 'year') {
    return normalizeProductionDate({ ...period, key: 'day' }, productionDate)
  }

  const { year, month } = parseProductionDate(productionDate ?? DEFAULT_PRODUCTION_DATE)
  const date =
    period.key === 'day'
      ? createUtcDate(year, month - 1 + direction)
      : createUtcDate(year + direction, 0)

  return formatDate(date.getUTCFullYear(), date.getUTCMonth() + 1)
}

export function formatPeriodScopeLabel(
  period: PeriodOption,
  productionDate: string | undefined,
  currentYear = new Date().getFullYear()
): PeriodScopeLabel {
  if (period.key === 'year') {
    return { primary: '—' }
  }

  const { year, month } = parseProductionDate(productionDate ?? DEFAULT_PRODUCTION_DATE)

  if (period.key === 'month') {
    return { primary: String(year) }
  }

  return {
    primary: MONTH_LABELS[month - 1],
    ...(year === currentYear ? {} : { secondary: String(year) })
  }
}
