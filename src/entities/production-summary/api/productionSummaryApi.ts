import { API_ROUTES, API_TAGS, mainApi } from '@/shared/api'

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
  type SummaryQuery,
  type VideoRecord,
  type VideoRecordListParams,
  type VideoRecordStreamParams,
  type VideoRecordStreamResponse
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
    getGraphMapping: build.query<GraphMappingResponse, void>({
      query: () => API_ROUTES.graphMapping,
      providesTags: [API_TAGS.graphMapping]
    }),
    getGraphByMode: build.query<GraphByModeResponse, GraphByModeQuery>({
      query: (params) => ({
        url: API_ROUTES.graphByMode,
        params
      }),
      providesTags: [API_TAGS.graphByMode]
    }),
    getGraphWithGtk: build.query<GraphWithGtkResponse, GraphQuery>({
      query: (params) => ({
        url: API_ROUTES.graphWithGtk,
        params
      }),
      providesTags: [API_TAGS.graphWithGtk]
    }),
    getGraphWithDetails: build.query<GraphWithDetailsResponse, GraphQuery>({
      query: (params) => ({
        url: API_ROUTES.graphWithDetails,
        params
      }),
      providesTags: [API_TAGS.graphWithDetails]
    }),
    getGeneralSummary: build.query<GeneralSummaryResponse, GeneralSummaryParams>({
      query: (params) => ({
        url: API_ROUTES.generalSummary,
        params
      }),
      providesTags: [API_TAGS.generalSummary]
    }),
    getVideoRecords: build.query<VideoRecord[], VideoRecordListParams>({
      query: (params) => ({
        url: API_ROUTES.videoRecords,
        params
      }),
      providesTags: [API_TAGS.videoRecords]
    }),
    getVideoRecordStream: build.query<VideoRecordStreamResponse, VideoRecordStreamParams>({
      query: ({ objectGuid, siteSlug, stream }) => ({
        url: `${API_ROUTES.videoRecordStream}/${siteSlug}/${objectGuid}/${stream}`
      }),
      providesTags: [API_TAGS.videoRecordStream]
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
  useGetGeneralSummaryQuery,
  useGetVideoRecordStreamQuery,
  useGetVideoRecordsQuery
} = productionSummaryApi
