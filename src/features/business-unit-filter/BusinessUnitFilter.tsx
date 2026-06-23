'use client'

import { Select } from 'antd'

import {
  businessUnits,
  type BusinessUnitValue,
  useGetBusinessUnitsQuery
} from '@/entities/business-unit'

import { useBusinessUnitSearchParams } from './useBusinessUnitSearchParams'

export function BusinessUnitFilter() {
  const { value, setBusinessUnits } = useBusinessUnitSearchParams()
  const { data: apiBusinessUnits } = useGetBusinessUnitsQuery()
  const options = apiBusinessUnits ?? businessUnits

  return (
    <Select<BusinessUnitValue[]>
      allowClear
      mode="multiple"
      maxTagCount="responsive"
      showSearch={{ optionFilterProp: 'label' }}
      options={options}
      placeholder="Все БЕ"
      value={value}
      onChange={setBusinessUnits}
      style={{ minWidth: 240 }}
      aria-label="Фильтр бизнес-единиц"
    />
  )
}
