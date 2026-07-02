import { type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import {
  type CreateProductionMetricCommentRequest,
  type ProductionMetricComment
} from '@/entities/production-stage/model/types'
import { type GraphPoint } from '@/entities/production-summary'
import { businessUnits } from '@/shared/mocks/business-unit/businessUnits'
import { industrialDashboardStages } from '@/shared/mocks/production-stage/industrialDashboard'
import { miningStageMetrics } from '@/shared/mocks/production-stage/miningStageOverview'
import { productionMetricDetails } from '@/shared/mocks/production-stage/productionStageDetails'
import { gtkNames } from '@/shared/mocks/production-summary/gtk'
import { summaryMock } from '@/shared/mocks/production-summary/summary'
import { API_ROUTES } from '@/shared/api/routes'
import { createId } from '@/shared/utils/createId'

type MockBaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>

const GRAPH_DATE_FORMAT = 'YYYY-MM-DD'

dayjs.extend(customParseFormat)

function getRequestUrl(args: string | FetchArgs) {
  const url = typeof args === 'string' ? args : args.url

  return url.split('?')[0]
}

function getRequestParams(args: string | FetchArgs) {
  const urlSearchParams = new URLSearchParams(typeof args === 'string' ? args.split('?')[1] : '')
  const params = typeof args === 'string' ? undefined : args.params

  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return
      }

      if (Array.isArray(value)) {
        value.forEach((item) => urlSearchParams.append(key, String(item)))

        return
      }

      urlSearchParams.set(key, String(value))
    })
  }

  return urlSearchParams
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

function parseRequestDate(value: string | null) {
  if (!value) {
    return null
  }

  const date = dayjs(value, GRAPH_DATE_FORMAT, true)

  return date.isValid() ? date : null
}

function getGraphSeed(params: URLSearchParams) {
  return Array.from(`${params.get('gtk') ?? ''}${params.get('indicator') ?? ''}`).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  )
}

function createGraphData(params: URLSearchParams): GraphPoint[] {
  const dateTo = parseRequestDate(params.get('date_to')) ?? dayjs()
  const dateFrom = parseRequestDate(params.get('date_from')) ?? dateTo.subtract(89, 'day')
  const start = dateFrom.isAfter(dateTo, 'day') ? dateTo : dateFrom
  const end = dateTo.isBefore(start, 'day') ? start : dateTo
  const seed = getGraphSeed(params)
  const days = end.diff(start, 'day') + 1

  return Array.from({ length: days }, (_, index) => {
    const date = start.add(index, 'day')
    const plan = Math.round((index + 1) * (70 + (seed % 8)) * 10) / 10
    const fact = Math.round((plan + Math.sin((index + seed) / 5) * 16 + (seed % 7)) * 10) / 10

    return {
      date: date.format(GRAPH_DATE_FORMAT),
      fact,
      plan
    }
  })
}

export const mockBaseQuery: MockBaseQuery = async (args) => {
  const url = getRequestUrl(args)
  const method = getRequestMethod(args)
  const params = getRequestParams(args)

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
    return { data: createGraphData(params) }
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
