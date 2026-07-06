import {
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError
} from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from '@/shared/api/config'

import { authActions } from '../model/auth-slice'
import type { AuthResponse } from '../model/types'
import { getToken, removeToken, setToken } from './token'

type ParamsSerializer = (params: Record<string, unknown>) => string

type CreateAuthBaseQueryOptions = {
  paramsSerializer: ParamsSerializer
}

const AUTH_ERROR: FetchBaseQueryError = {
  status: 401,
  data: 'Unauthorized'
}

let authPromise: Promise<AuthResponse | null> | null = null

async function authorizeByKerb() {
  if (!authPromise) {
    authPromise = fetch(`${API_BASE_URL}/auth/kerb`, {
      method: 'POST',
      credentials: 'include'
    })
      .then(async (response) => {
        if (!response.ok) {
          return null
        }

        return response.json() as Promise<AuthResponse>
      })
      .catch(() => null)
      .finally(() => {
        authPromise = null
      })
  }

  return authPromise
}

function saveAuth(data: AuthResponse, api: BaseQueryApi) {
  setToken(data.token)

  api.dispatch(
    authActions.authSuccess({
      token: data.token,
      userName: data.name,
      userAvatar: data.avatar,
      isAuthorized: true
    })
  )
}

function failAuth(api: BaseQueryApi) {
  removeToken()
  api.dispatch(authActions.authFailed())
}

export function createAuthBaseQuery({
  paramsSerializer
}: CreateAuthBaseQueryOptions): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    paramsSerializer,
    prepareHeaders: (headers) => {
      const token = getToken()

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      return headers
    }
  })

  return async (args, api, extraOptions) => {
    const firstResult = await rawBaseQuery(args, api, extraOptions)

    if (firstResult.error?.status !== 401) {
      return firstResult
    }

    const authData = await authorizeByKerb()

    if (!authData) {
      failAuth(api)

      return {
        error: AUTH_ERROR
      }
    }

    saveAuth(authData, api)

    return rawBaseQuery(args, api, extraOptions)
  }
}
