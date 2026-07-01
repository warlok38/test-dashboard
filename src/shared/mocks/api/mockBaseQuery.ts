import { type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query'

import {
  type CreateProductionMetricCommentRequest,
  type ProductionMetricComment
} from '@/entities/production-stage/model/types'
import { businessUnits } from '@/shared/mocks/business-unit/businessUnits'
import { industrialDashboardStages } from '@/shared/mocks/production-stage/industrialDashboard'
import { miningStageMetrics } from '@/shared/mocks/production-stage/miningStageOverview'
import { productionMetricDetails } from '@/shared/mocks/production-stage/productionStageDetails'
import { graphMock } from '@/shared/mocks/production-summary/graph'
import { gtkNames } from '@/shared/mocks/production-summary/gtk'
import { summaryMock } from '@/shared/mocks/production-summary/summary'
import { API_ROUTES } from '@/shared/api/routes'
import { createId } from '@/shared/utils/createId'

type MockBaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>

function getRequestUrl(args: string | FetchArgs) {
  const url = typeof args === 'string' ? args : args.url

  return url.split('?')[0]
}

function getRequestMethod(args: string | FetchArgs) {
  if (typeof args === 'string') {
    return 'GET'
  }

  return args.method?.toUpperCase() ?? 'GET'
}

function getRequestBody(args: string | FetchArgs) {
  if (typeof args === 'string') {
    return undefined
  }

  return args.body
}

function createNotFoundError(message: string): { error: FetchBaseQueryError } {
  return {
    error: {
      status: 404,
      data: { message }
    }
  }
}

function createBadRequestError(message: string): { error: FetchBaseQueryError } {
  return {
    error: {
      status: 400,
      data: { message }
    }
  }
}

function isCreateCommentBody(value: unknown): value is CreateProductionMetricCommentRequest {
  if (!value || typeof value !== 'object') {
    return false
  }

  return (
    'author' in value &&
    typeof value.author === 'string' &&
    'text' in value &&
    typeof value.text === 'string'
  )
}

export const mockBaseQuery: MockBaseQuery = async (args) => {
  const url = getRequestUrl(args)
  const method = getRequestMethod(args)

  if (method === 'GET' && url === API_ROUTES.businessUnits) {
    return { data: businessUnits }
  }

  if (method === 'GET' && url === API_ROUTES.gtk) {
    return { data: gtkNames }
  }

  if (method === 'GET' && url === API_ROUTES.summary) {
    return { data: summaryMock }
  }

  if (method === 'GET' && url === API_ROUTES.graph) {
    return { data: graphMock }
  }

  if (method === 'GET' && url === API_ROUTES.productionStages) {
    return { data: industrialDashboardStages }
  }

  const metricCommentMatch = url.match(/^\/production-stages\/([^/]+)\/metrics\/([^/]+)\/comments$/)

  if (method === 'POST' && metricCommentMatch) {
    const body = getRequestBody(args)

    if (!isCreateCommentBody(body)) {
      return createBadRequestError('Invalid comment body')
    }

    const [, stageSlug, metricSlug] = metricCommentMatch
    const comment: ProductionMetricComment = {
      id: createId(),
      stageSlug,
      metricSlug,
      author: body.author,
      text: body.text,
      createdAt: new Date().toISOString()
    }

    return { data: comment }
  }

  const metricDetailMatch = url.match(/^\/production-stages\/([^/]+)\/metrics\/([^/]+)$/)

  if (method === 'GET' && metricDetailMatch) {
    const [, stageSlug, metricSlug] = metricDetailMatch
    const detail = productionMetricDetails.find(
      (item) => item.stageSlug === stageSlug && item.metricSlug === metricSlug
    )

    if (!detail) {
      return createNotFoundError('Production metric detail not found')
    }

    return { data: detail }
  }

  const stageMetricsMatch = url.match(/^\/production-stages\/([^/]+)\/metrics$/)

  if (method === 'GET' && stageMetricsMatch) {
    const [, stageSlug] = stageMetricsMatch

    if (stageSlug !== 'mining') {
      return createNotFoundError('Production stage metrics not found')
    }

    return { data: miningStageMetrics }
  }

  return createNotFoundError('Mock handler not found')
}
