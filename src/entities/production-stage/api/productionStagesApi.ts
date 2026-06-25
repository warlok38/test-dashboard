import { API_ROUTES, API_TAGS, mainApi } from '@/shared/api'

import {
  type CreateProductionMetricCommentRequest,
  type DashboardStage,
  type MiningStageMetric,
  type ProductionMetricComment,
  type ProductionMetricDetail,
  type ProductionMetricDetailQuery,
  type ProductionStageMetricsQuery,
  type ProductionStagesQuery
} from '../model/types'

export const productionStagesApi = mainApi.injectEndpoints({
  endpoints: (build) => ({
    getProductionStages: build.query<DashboardStage[], ProductionStagesQuery | void>({
      query: (params) => ({
        url: API_ROUTES.productionStages,
        params: params ?? undefined
      }),
      providesTags: [API_TAGS.productionStages]
    }),
    getProductionStageMetrics: build.query<MiningStageMetric[], ProductionStageMetricsQuery>({
      query: ({ stageSlug, ...params }) => ({
        url: API_ROUTES.productionStageMetrics(stageSlug),
        params
      }),
      providesTags: (_result, _error, { stageSlug }) => [
        { type: API_TAGS.productionStageMetrics, id: stageSlug }
      ]
    }),
    getProductionMetricDetail: build.query<ProductionMetricDetail, ProductionMetricDetailQuery>({
      query: ({ stageSlug, metricSlug, ...params }) => ({
        url: API_ROUTES.productionMetricDetail(stageSlug, metricSlug),
        params
      }),
      providesTags: (_result, _error, { stageSlug, metricSlug }) => [
        { type: API_TAGS.productionMetricDetail, id: `${stageSlug}/${metricSlug}` }
      ]
    }),
    addProductionMetricComment: build.mutation<
      ProductionMetricComment,
      {
        stageSlug: string
        metricSlug: string
        body: CreateProductionMetricCommentRequest
      }
    >({
      query: ({ stageSlug, metricSlug, body }) => ({
        url: API_ROUTES.productionMetricComments(stageSlug, metricSlug),
        method: 'POST',
        body
      }),
      invalidatesTags: (_result, _error, { stageSlug, metricSlug }) => [
        { type: API_TAGS.productionMetricComments, id: `${stageSlug}/${metricSlug}` }
      ]
    })
  })
})

export const {
  useAddProductionMetricCommentMutation,
  useGetProductionStagesQuery,
  useGetProductionStageMetricsQuery,
  useGetProductionMetricDetailQuery
} = productionStagesApi
