import { API_ROUTES, API_TAGS, mainApi } from '@/shared/api'

import { type BusinessUnitOption } from '../model/types'

export const businessUnitsApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getBusinessUnits: build.query<BusinessUnitOption[], void>({
      query: () => API_ROUTES.businessUnits,
      providesTags: [API_TAGS.businessUnits]
    })
  })
})

export const { useGetBusinessUnitsQuery } = businessUnitsApi
