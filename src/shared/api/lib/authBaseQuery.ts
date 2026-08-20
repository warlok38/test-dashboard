import {
  type BaseQueryApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError
} from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from '@/shared/api/config'
import {
  authActions,
  clearAuthSession,
  getToken,
  saveAuthSession,
  type AuthResponse
} from '@/shared/auth'
import { isDevelopmentRunMode } from '@/shared/constants'
import {
  createErrorFromRtkError,
  createHttpErrorFromResponse,
  httpErrorToFetchBaseQueryError
} from '@/shared/errors'

type ParamsSerializer = (params: Record<string, unknown>) => string

type CreateAuthBaseQueryOptions = {
  baseUrl?: string
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
type StateWithAuthToken = {
  auth?: {
    token?: string
  }
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

function isUnauthorizedResult(result: BaseQueryResult): result is UnauthorizedBaseQueryResult {
  return result.error?.status === 401
}

function saveAuth(data: AuthResponse, api: BaseQueryApi) {
  api.dispatch(authActions.authSuccess(saveAuthSession(data)))
}

function failAuth(error: FetchBaseQueryError, api: BaseQueryApi) {
  clearAuthSession()
  api.dispatch(authActions.authFailed(createErrorFromRtkError(error)))
}

function getAuthTokenFromState(state: unknown) {
  return (state as StateWithAuthToken).auth?.token || null
}

export function createAuthBaseQuery({
  baseUrl = API_BASE_URL,
  paramsSerializer
}: CreateAuthBaseQueryOptions): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    paramsSerializer,
    prepareHeaders: (headers, { getState }) => {
      const token = getAuthTokenFromState(getState()) ?? (isDevelopmentRunMode ? null : getToken())

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

    if (isDevelopmentRunMode) {
      failAuth(firstResult.error, api)

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
