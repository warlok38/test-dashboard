'use client'

import { Select } from 'antd'

import { businessUnits, type BusinessUnitValue } from '@/shared/mocks'

import { useBusinessUnitSearchParams } from './useBusinessUnitSearchParams'

export function BusinessUnitFilter() {
  const { value, setBusinessUnits } = useBusinessUnitSearchParams()

  return (
    <Select<BusinessUnitValue[]>
      allowClear
      mode="multiple"
      maxTagCount="responsive"
      showSearch={{ optionFilterProp: 'label' }}
      options={businessUnits}
      placeholder="Все БЕ"
      value={value}
      onChange={setBusinessUnits}
      style={{ minWidth: 240 }}
      aria-label="Фильтр бизнес-единиц"
    />
  )
}
