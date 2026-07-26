export type PeriodKey = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type PeriodOption = {
  key: PeriodKey
  label: string
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
  { key: 'day', label: 'Сутки' },
  { key: 'week', label: 'Неделя', disabled: true },
  { key: 'month', label: 'Месяц' },
  { key: 'quarter', label: 'Квартал', disabled: true },
  { key: 'year', label: 'Год', disabled: true }
]

const DAY_INFO_CURRENT_SHIFT = 4
const DAY_INFO_ARCHIVE_SHIFT = 99
const DAY_GRAPH_SHIFT = 3
const MONTH_INFO_SHIFT = 5
const MONTH_GRAPH_SHIFT = 99
const YEAR_SHIFT = 100
const DAY_MS = 24 * 60 * 60 * 1000
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

function formatProductionMonth(year: number, month: number) {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-01`
}

function formatFullDate(date: Date) {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`
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
  const now = getActualProductionDate()

  return formatProductionMonth(now.getUTCFullYear(), now.getUTCMonth() + 1)
}

export function getActualProductionDate(now = new Date()) {
  return new Date(now.getTime() - DAY_MS)
}

export function getPeriodByKey(key: string | undefined): PeriodOption {
  return (
    PERIOD_OPTIONS.find((option) => option.key === key) ??
    PERIOD_OPTIONS.find((option) => option.key === DEFAULT_PERIOD_KEY) ??
    PERIOD_OPTIONS[0]
  )
}

export function normalizeProductionDate(period: PeriodOption, productionDate: string | undefined) {
  const { year, month } = parseProductionDate(productionDate ?? DEFAULT_PRODUCTION_DATE)

  if (period.key === 'month') {
    return formatProductionMonth(year, 1)
  }

  return formatProductionMonth(year, month)
}

function isSameProductionMonth(firstDate: string | undefined, secondDate: string | undefined) {
  const first = parseProductionDate(firstDate)
  const second = parseProductionDate(secondDate)

  return first.year === second.year && first.month === second.month
}

export function getInfoShift(
  period: PeriodOption,
  productionDate: string | undefined,
  actualProductionDate = formatFullDate(getActualProductionDate())
) {
  if (period.key === 'day') {
    return isSameProductionMonth(productionDate, actualProductionDate)
      ? DAY_INFO_CURRENT_SHIFT
      : DAY_INFO_ARCHIVE_SHIFT
  }

  if (period.key === 'month') {
    return MONTH_INFO_SHIFT
  }

  return YEAR_SHIFT
}

export function getGraphShift(period: PeriodOption) {
  if (period.key === 'day') {
    return DAY_GRAPH_SHIFT
  }

  if (period.key === 'month') {
    return MONTH_GRAPH_SHIFT
  }

  return YEAR_SHIFT
}

export function createPeriodRequestParams(
  period: PeriodOption,
  productionDate: string | undefined,
  kind: 'info' | 'graph'
): PeriodRequestParams {
  if (period.key === 'year') {
    return { shift: YEAR_SHIFT }
  }

  return {
    shift: kind === 'info' ? getInfoShift(period, productionDate) : getGraphShift(period),
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

  return formatProductionMonth(date.getUTCFullYear(), date.getUTCMonth() + 1)
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
