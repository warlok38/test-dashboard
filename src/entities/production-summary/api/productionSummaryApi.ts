import { API_ROUTES, API_TAGS, mainApi } from '@/shared/api'

import {
  GeneralSummaryParams,
  GeneralSummaryResponse,
  type AlarmSummaryResponse,
  type GraphPoint,
  type GraphQuery,
  type GtkName,
  type SummaryQuery
} from '../model/types'

export const productionSummaryApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getGtk: build.query<GtkName[], void>({
      query: () => API_ROUTES.gtk,
      providesTags: [API_TAGS.gtk]
    }),
    getSummary: build.query<AlarmSummaryResponse, SummaryQuery>({
      query: (params) => ({
        url: API_ROUTES.summary,
        params
      }),
      providesTags: [API_TAGS.summary]
    }),
    getGraph: build.query<GraphPoint[], GraphQuery>({
      query: (params) => ({
        url: API_ROUTES.graph,
        params
      }),
      providesTags: [API_TAGS.graph]
    }),
    getGeneralSummary: build.query<GeneralSummaryResponse, GeneralSummaryParams>({
      query: (params) => ({
        url: API_ROUTES.generalSummary,
        params
      }),
      providesTags: [API_TAGS.generalSummary]
    })
  })
})

export const { useGetGtkQuery, useGetSummaryQuery, useGetGraphQuery, useGetGeneralSummaryQuery } =
  productionSummaryApi
