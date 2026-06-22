export type BusinessUnitValue = 'olimpiada' | 'blagodatnoe' | 'natalka' | 'kuranah' | 'suhoy-log'

export type BusinessUnitOption = {
  value: BusinessUnitValue
  label: string
}

export const businessUnits: BusinessUnitOption[] = [
  { value: 'olimpiada', label: 'Олимпиада' },
  { value: 'blagodatnoe', label: 'Благодатное' },
  { value: 'natalka', label: 'Наталка' },
  { value: 'kuranah', label: 'Куранах' },
  { value: 'suhoy-log', label: 'Сухой Лог' }
]

export function isBusinessUnitValue(value: string): value is BusinessUnitValue {
  return businessUnits.some((unit) => unit.value === value)
}
