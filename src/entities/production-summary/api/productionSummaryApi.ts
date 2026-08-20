import { mainApi } from '@/shared/api'

import {
  GeneralSummaryParams,
  GeneralSummaryResponse,
  type AlarmSummaryResponse,
  type GraphByModeQuery,
  type GraphByModeResponse,
  type GraphMappingResponse,
  type GraphPoint,
  type GraphQuery,
  type GraphWithDetailsResponse,
  type GraphWithGtkResponse,
  type GtkName,
  type SummaryQuery
} from '../model/types'
import { PRODUCTION_SUMMARY_API_ROUTES } from './routes'
import { PRODUCTION_SUMMARY_API_TAGS, PRODUCTION_SUMMARY_API_TAG_TYPES } from './tagTypes'

const productionSummaryApiWithTags = mainApi.enhanceEndpoints({
  addTagTypes: PRODUCTION_SUMMARY_API_TAG_TYPES
})

export const productionSummaryApi = productionSummaryApiWithTags.injectEndpoints({
  endpoints: (build) => ({
    getGtk: build.query<GtkName[], void>({
      query: () => PRODUCTION_SUMMARY_API_ROUTES.gtk,
      providesTags: [PRODUCTION_SUMMARY_API_TAGS.gtk]
    }),
    getSummary: build.query<AlarmSummaryResponse, SummaryQuery>({
      query: (params) => ({
        url: PRODUCTION_SUMMARY_API_ROUTES.summary,
        params
      }),
      providesTags: [PRODUCTION_SUMMARY_API_TAGS.summary]
    }),
    getGraph: build.query<GraphPoint[], GraphQuery>({
      query: (params) => ({
        url: PRODUCTION_SUMMARY_API_ROUTES.graph,
        params
      }),
      providesTags: [PRODUCTION_SUMMARY_API_TAGS.graph]
    }),
    getGraphMapping: build.query<GraphMappingResponse, void>({
      query: () => PRODUCTION_SUMMARY_API_ROUTES.graphMapping,
      providesTags: [PRODUCTION_SUMMARY_API_TAGS.graphMapping]
    }),
    getGraphByMode: build.query<GraphByModeResponse, GraphByModeQuery>({
      query: (params) => ({
        url: PRODUCTION_SUMMARY_API_ROUTES.graphByMode,
        params
      }),
      providesTags: [PRODUCTION_SUMMARY_API_TAGS.graphByMode]
    }),
    getGraphWithGtk: build.query<GraphWithGtkResponse, GraphQuery>({
      query: (params) => ({
        url: PRODUCTION_SUMMARY_API_ROUTES.graphWithGtk,
        params
      }),
      providesTags: [PRODUCTION_SUMMARY_API_TAGS.graphWithGtk]
    }),
    getGraphWithDetails: build.query<GraphWithDetailsResponse, GraphQuery>({
      query: (params) => ({
        url: PRODUCTION_SUMMARY_API_ROUTES.graphWithDetails,
        params
      }),
      providesTags: [PRODUCTION_SUMMARY_API_TAGS.graphWithDetails]
    }),
    getGeneralSummary: build.query<GeneralSummaryResponse, GeneralSummaryParams>({
      query: (params) => ({
        url: PRODUCTION_SUMMARY_API_ROUTES.generalSummary,
        params
      }),
      providesTags: [PRODUCTION_SUMMARY_API_TAGS.generalSummary]
    })
  })
})

export const {
  useGetGtkQuery,
  useGetSummaryQuery,
  useGetGraphQuery,
  useGetGraphByModeQuery,
  useGetGraphMappingQuery,
  useGetGraphWithDetailsQuery,
  useGetGraphWithGtkQuery,
  useGetGeneralSummaryQuery
} = productionSummaryApi
