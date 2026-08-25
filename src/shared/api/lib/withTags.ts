import type { Api, BaseQueryFn, EndpointDefinitions } from '@reduxjs/toolkit/query/react'

type ApiEnhancers =
  | typeof import('@reduxjs/toolkit/query').coreModuleName
  | typeof import('@reduxjs/toolkit/query/react').reactHooksModuleName

export function withTags<
  BaseQuery extends BaseQueryFn,
  Definitions extends EndpointDefinitions,
  ReducPath extends string,
  TagTypes extends string,
  Enhancers extends ApiEnhancers,
  NewTagTypes extends string
>(
  api: Api<BaseQuery, Definitions, ReducPath, TagTypes, Enhancers>,
  tagTypes: readonly NewTagTypes[]
) {
  return api.enhanceEndpoints<NewTagTypes>({
    addTagTypes: tagTypes
  })
}
