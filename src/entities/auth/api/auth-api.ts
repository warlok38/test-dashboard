import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from '@/shared/api/config'
import { isMockDataSource } from '@/shared/api/dataSource'

import type { AuthResponse } from '../model/types'

const MOCK_AUTH_RESPONSE: AuthResponse = {
  token: 'mock-auth-token',
  name: 'Товарищ Разработчик',
  avatar: null
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include'
  }),
  endpoints: (builder) => ({
    auth: builder.mutation<AuthResponse, void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        if (isMockDataSource()) {
          return { data: MOCK_AUTH_RESPONSE }
        }

        const result = await baseQuery({
          url: '/auth/kerb',
          method: 'POST'
        })

        if (result.error) {
          return { error: result.error }
        }

        return { data: result.data as AuthResponse }
      }
    })
  })
})

export const { useAuthMutation } = authApi
