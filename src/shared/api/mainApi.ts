import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  createApi
} from '@reduxjs/toolkit/query/react'

import { createAuthBaseQuery } from './authBaseQuery'
import { API_TAG_TYPES } from './tagTypes'

function serializeParams(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, String(item))
      })

      return
    }

    searchParams.set(key, String(value))
  })

  return searchParams.toString()
}

const authBaseQuery = createAuthBaseQuery({
  paramsSerializer: serializeParams
})

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = (
  args,
  api,
  extraOptions
) => {
  return authBaseQuery(args, api, extraOptions)
}

export const mainApi = createApi({
  reducerPath: 'mainApi',
  baseQuery,
  tagTypes: API_TAG_TYPES,
  endpoints: () => ({})
})
