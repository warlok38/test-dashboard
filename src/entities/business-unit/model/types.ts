export const BUSINESS_UNIT_VALUES = [
  'olimpiada',
  'blagodatnoe',
  'natalka',
  'kuranah',
  'suhoy-log'
] as const

export type BusinessUnitValue = (typeof BUSINESS_UNIT_VALUES)[number]

export type BusinessUnitOption = {
  value: BusinessUnitValue
  label: string
}

export function isBusinessUnitValue(value: string): value is BusinessUnitValue {
  return BUSINESS_UNIT_VALUES.includes(value as BusinessUnitValue)
}
