type FormatNumberOptions = {
  fractionDigits?: number
  showSign?: boolean
  suffix?: string
}

const GROUP_SEPARATOR_PATTERN = /\B(?=(\d{3})+(?!\d))/g

export function formatNumber(value: number, options: FormatNumberOptions = {}) {
  const { fractionDigits, showSign = false, suffix = '' } = options
  const sign = showSign && value > 0 ? '+' : ''
  const absoluteValue = Math.abs(value)
  const fixedValue =
    fractionDigits === undefined ? String(absoluteValue) : absoluteValue.toFixed(fractionDigits)
  const [integerPart, decimalPart] = fixedValue.split('.')
  const formattedInteger = integerPart.replace(GROUP_SEPARATOR_PATTERN, ' ')
  const formattedValue = decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger

  return `${value < 0 ? '-' : sign}${formattedValue}${suffix}`
}

export function formatPercent(value: number, fractionDigits = 1) {
  return formatNumber(value, {
    fractionDigits,
    showSign: true,
    suffix: '%'
  })
}
