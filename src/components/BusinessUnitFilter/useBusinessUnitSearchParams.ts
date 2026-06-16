'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { isBusinessUnitValue, type BusinessUnitValue } from '@/shared/mocks'

export const BUSINESS_UNIT_PARAM = 'businessUnit'

export function useBusinessUnitSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const value = searchParams.getAll(BUSINESS_UNIT_PARAM).filter(isBusinessUnitValue)

  const setBusinessUnits = (nextValue: BusinessUnitValue[]) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(BUSINESS_UNIT_PARAM)

    nextValue.forEach((unit) => {
      params.append(BUSINESS_UNIT_PARAM, unit)
    })

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return { value, setBusinessUnits }
}
