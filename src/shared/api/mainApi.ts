import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { API_TAG_TYPES } from './tagTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api'

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

export const mainApi = createApi({
  reducerPath: 'mainApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    paramsSerializer: serializeParams
  }),
  tagTypes: API_TAG_TYPES,
  endpoints: () => ({})
})
