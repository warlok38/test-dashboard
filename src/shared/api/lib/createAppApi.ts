import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  createApi
} from '@reduxjs/toolkit/query/react'

import { serializeParams } from '@/shared/utils'

import { createAuthBaseQuery } from './authBaseQuery'

type CreateAppApiOptions<ReducerPath extends string, TagType extends string> = {
  baseUrl?: string
  reducerPath: ReducerPath
  tagTypes: readonly TagType[]
}

export function createAppApi<ReducerPath extends string, TagType extends string>({
  baseUrl,
  reducerPath,
  tagTypes
}: CreateAppApiOptions<ReducerPath, TagType>) {
  const authBaseQuery = createAuthBaseQuery({
    baseUrl,
    paramsSerializer: serializeParams
  })

  const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = (
    args,
    api,
    extraOptions
  ) => {
    return authBaseQuery(args, api, extraOptions)
  }

  return createApi({
    reducerPath,
    baseQuery,
    tagTypes,
    endpoints: () => ({})
  })
}
