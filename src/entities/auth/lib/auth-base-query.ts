import {
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError
} from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from '@/shared/api/config'
import {
  createErrorFromRtkError,
  createHttpErrorFromResponse,
  httpErrorToFetchBaseQueryError
} from '@/shared/errors'

import { authActions } from '../model/auth-slice'
import type { AuthResponse } from '../model/types'
import { clearAuthSession, saveAuthSession } from './auth-session'
import { getToken } from './token'

type ParamsSerializer = (params: Record<string, unknown>) => string

type CreateAuthBaseQueryOptions = {
  paramsSerializer: ParamsSerializer
}

type AuthResult =
  | {
      data: AuthResponse
    }
  | {
      error: FetchBaseQueryError
    }

type BaseQueryResult = Awaited<
  ReturnType<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>>
>
type UnauthorizedBaseQueryResult = BaseQueryResult & {
  error: FetchBaseQueryError
}

const AUTH_FETCH_ERROR: FetchBaseQueryError = {
  status: 'FETCH_ERROR',
  error: 'Не удалось выполнить запрос авторизации'
}

let authResultPromise: Promise<AuthResult> | null = null

async function authorizeByKerbWithError(): Promise<AuthResult> {
  if (!authResultPromise) {
    authResultPromise = fetch(`${API_BASE_URL}/auth/kerb`, {
      method: 'POST',
      credentials: 'include'
    })
      .then(async (response) => {
        if (!response.ok) {
          const error = await createHttpErrorFromResponse(response)

          return {
            error: httpErrorToFetchBaseQueryError(error)
          }
        }

        return {
          data: (await response.json()) as AuthResponse
        }
      })
      .catch(() => ({
        error: AUTH_FETCH_ERROR
      }))
      .finally(() => {
        authResultPromise = null
      })
  }

  return authResultPromise
}

function saveAuth(data: AuthResponse, api: BaseQueryApi) {
  api.dispatch(authActions.authSuccess(saveAuthSession(data)))
}

function failAuth(error: FetchBaseQueryError, api: BaseQueryApi) {
  clearAuthSession()
  api.dispatch(authActions.authFailed(createErrorFromRtkError(error)))
}

function isUnauthorizedResult(result: BaseQueryResult): result is UnauthorizedBaseQueryResult {
  return result.error?.status === 401
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

    if (!isUnauthorizedResult(firstResult)) {
      return firstResult
    }

    const authResult = await authorizeByKerbWithError()

    if ('error' in authResult) {
      failAuth(authResult.error, api)

      return {
        error: authResult.error
      }
    }

    saveAuth(authResult.data, api)

    const retryResult = await rawBaseQuery(args, api, extraOptions)

    if (isUnauthorizedResult(retryResult)) {
      failAuth(retryResult.error, api)
    }

    return retryResult
  }
}
